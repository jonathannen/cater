// Copyright Jon Williams 2017-2018. See LICENSE file.
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * # Let's Cater on Google Cloud
 *
 * Utilities and other tools for deploying Cater applications to Google Cloud.
 *
 * Configuration Options:
 *
 *    **assetHostGoogleCloudStorage**
 *    Sets the bucket you wish to deploy to as a CDN. Typically will be
 *    "gs://name-of-your-bucket". Will default to
 *    "gs://<project-id>-<application-package-name>/"
 *
 *    **disableGoogleCloudStorageCDN**
 *    If true, the Google Cloud Storage CDN isn't used.
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

  // Echo the command we're proposing to run
  console.log(command); // eslint-disable-line no-console
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
function building(app, build, state) {
  let assetDefinition = '';
  if (state.bucket !== null) {
    assetDefinition = `
  assetHostGoogleCloudStorage: '${state.bucket}',
  assetHost: '${state.assetHost}',`;
  }

  build.emitConfigurationFile(
    'cater-google-cloud',
    ` // Configures defaults required by Google Cloud App Engine
module.exports = { ${assetDefinition}
  env: {
    production: {
      httpPort: parseInt(process.env.PORT, 10) || 8080
    }
  }
}`
  );
}

// Called when the Cater (Build-Time) App is about to be configured.
function configuring(app, config, currentState) {
  const state = currentState;
  checkCommandInstalled('gcloud', false, 'deploying to App Engine');
  state.buildPath = app.buildPath;
  state.bucket = null;

  // Are we using Google Cloud Storage as a CDN? If so set it up.
  if (config.disableGoogleCloudStorageCDN !== true) {
    state.usingCloudStorageCDN = true;
    state.bucket = config.assetHostGoogleCloudStorage || 'gs://*';
    checkCommandInstalled('gsutil', false, 'using Google Cloud Storage as a CDN');

    // gs://* will use a bucket name of gs://<default-project-id>-<current-package-name>
    if (state.bucket === 'gs://*') {
      const { name } = app.package(true);
      const defaultProject = execSync(GCLOUD_DEFAULT_PROJECT_COMMAND)
        .toString()
        .trim();
      state.bucketName = `${defaultProject}-${name}`;
      state.bucket = `gs://${state.bucketName}`;
    } else {
      state.bucketName = state.bucket.replace(/^gs:\/\//, '').trim();
    }

    // Turns gs://some-bucket-name to gs://some-bucket-name/static
    state.bucketPath = `${state.bucket}${app.publicPath}`;

    // Is asset host already defined?
    const bucketHost = `https://storage.googleapis.com/${state.bucketName}`;
    if (app.assetHost && app.assetHost !== bucketHost) {
      // eslint-disable-next-line no-console
      console.log(
        "Warn: You have defined both an asset host and a Google Cloud Storage Bucket in your configuration. Usually you only want one or the other. We'll set the asset host based upon the bucket."
      );
    } else {
      state.assetHost = bucketHost;
      // eslint-disable-next-line no-param-reassign
      app.assetHost = state.assetHost;
    }
  }

  return state;
}

module.exports = function plugin(caterApp) {
  // Nothing to do unless we're building or deploying
  if (!['build', 'deploy'].includes(caterApp.mode)) return;

  const state = {
    bucket: null,
    buildPath: null,
    staticPath: null,
    usingCloudStorageCDN: false
  };

  caterApp.once('building', (app, build) => building(app, build, state));
  caterApp.once('configuring', (app, config) => configuring(app, config, state));

  caterApp.on('deploying', (app) => {
    state.staticPath = app.staticPath;

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
