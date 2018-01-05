// Copyright Jon Williams 2017-2018. See LICENSE file.
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Utilities and other tools for deploying Cater applications to Google Cloud.
 *
 * @module cater-google-cloud
 */

// Command line that will emit the current default project
const GCLOUD_DEFAULT_PROJECT_COMMAND = "gcloud config list --format 'value(core.project)'";

// Command line that will copy assets to the given bucket
function commandCopyToBucket(manifestPath, source, destination) {
  return `cat ${manifestPath} | gsutil -m cp -z css,html,js,svg -r -a public-read -I ${destination}`;
}

// Command line to create the bucket
function commandCreateBucket(bucket) {
  return `gsutil ls ${bucket} || gsutil mb ${bucket}`;
}

// Command to deploy
function commandDeploy() {
  return 'gcloud app deploy --quiet';
}

// Runs a command
function runCommand(command, stdio = false) {
  const options = stdio ? { stdio: 'inherit' } : {};
  const result = spawnSync('sh', ['-c', command], options);
  if (result.status !== 0) {
    if (!stdio) {
      console.log(result.stdout.toString()); // eslint-disable-line no-console
      console.error(result.stderr.toString()); // eslint-disable-line no-console
    }
    throw new Error('Google Cloud Storage deployment failed.');
  }
  return true;
}

function checkCommandInstalled(command, throwError, reason) {
  try {
    execSync(`which ${command}`);
  } catch (e) {
    const message = `Could not find the command ${command}, which is needed for ${reason}. Please make sure it's installed.`;

    // Either throw the error or print a warning
    if (throwError) throw new Error(message);
    // eslint-disable-next-line no-console
    console.error(`WARN: ${message}`);
  }
}

// Called when the Cater App is being built
function building(app, build) {
  build.emitConfigurationFile(
    'cater-google-cloud',
    `
module.exports = {
  assetHostGoogleCloudStorage: 'gs://*',
  env: {
    production: {
      httpPort: process.env.PORT || 8080
    }
  }
}`
  );
}

// Copyright Jon Williams 2017-2018. See LICENSE file.

// module.exports = {
//   assetHostGoogleCloudStorage: 'gs://*',
//   env: {
//     production: {
//       httpPort: process.env.PORT || 8080 // App Engine supplies via an ENV variable.
//     }
//   }
// };

// Called when the Cater (Build-Time) App is about to be configured.
function configured(app, options, currentState) {
  const state = currentState;
  checkCommandInstalled('gcloud', false, 'deploying to App Engine');
  state.buildPath = app.buildPath;
  state.staticPath = app.staticPath;

  // Are we using Google Cloud Storage as a CDN? If so set it up.
  state.bucket = options.assetHostGoogleCloudStorage;
  if (state.bucket) {
    checkCommandInstalled('gsutil', false, 'using Google Cloud Storage as a CDN');
    state.usingCloudStorageCDN = true;

    // gs://* will use a bucket name of gs://<default-project-id>-<current-package-name>
    if (state.bucket === 'gs://*') {
      const { name } = app.package(true);
      const defaultProject = execSync(GCLOUD_DEFAULT_PROJECT_COMMAND)
        .toString()
        .trim();
      state.bucketName = `${defaultProject}-${name}`;
      state.bucket = `gs://${state.bucketName}`;
      state.bucketPath = `${state.bucket}${app.publicPath}`;
    } else {
      state.bucketName = state.bucket.replace(/^gs:\/\//, '').trim();
    }

    // Is asset host already defined?
    if (app.assetHost) {
      // eslint-disable-next-line no-console
      console.log(
        "Warn: You have defined both an asset host and a Google Cloud Storage Bucket in your configuration. Usually you only want one or the other. We'll set the asset host based upon the bucket."
      );
    } else {
      state.assetHost = `https://storage.googleapis.com/${state.bucketName}`;
      // eslint-disable-next-line no-param-reassign
      app.assetHost = state.assetHost;
    }
  }

  return state;
}

module.exports = function plugin(caterApp) {
  const state = {
    bucket: null,
    buildPath: null,
    staticPath: null,
    usingCloudStorageCDN: false
  };

  caterApp.on('building', building);

  caterApp.once('configured', (app, options) => configured(app, options, state));

  caterApp.on('deploying', (app) => {
    if (state.usingCloudStorageCDN) {
      // eslint-disable-next-line no-console
      console.log(`    Deploying CDN assets using gsutil to bucket ${state.bucketName}...`);

      // Convert the manifest into a file that can be piped to the gsutil command
      const files = Object.values(app.loadManifests());
      const list = files
        .map((name) => {
          const filename = path.join(state.staticPath, name);
          if (!fs.existsSync(filename)) {
            throw new Error(
              `The client-side manifest.json specifies ${name}, but the file isn't found in the build static directory.`
            );
          }
          return filename;
        })
        .join('\n');
      const manifestListPath = path.join(state.buildPath, 'manifest.txt');
      fs.writeFileSync(manifestListPath, list);

      const createCommand = commandCreateBucket(state.bucket);
      runCommand(createCommand);

      const copyCommand = commandCopyToBucket(manifestListPath, state.staticPath, state.bucketPath);
      runCommand(copyCommand);
    }

    // eslint-disable-next-line no-console
    console.log('    Deploying to App Engine Flexible...');
    const deployCommand = commandDeploy();
    runCommand(deployCommand, true);
  });
};
