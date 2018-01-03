# Cater example: App Engine (Extended)

Example for deployment to Google Cloud App Engine Flexible. This is an extended example that includes:

* CDN Support using [Google Cloud storage](https://cloud.google.com/appengine/docs/flexible/nodejs/serving-static-files#example_of_serving_static_files_from_a_cloud_storage_bucket/).

## Instructions

Appears Google Cloud Storage doesn't have a no-gzip option when acting as a server.

    gsutil mb gs://cater-sample-1
    _PWD=$(pwd) && cd build/static && node -e "console.log(Object.values(require('./manifest.json')).join('\n'));" | gsutil -m cp -z css,html,js,svg -r -a public-read -I gs://cater-sample-1/static || cd _PWD

    gsutil mb gs://<your-bucket-name>
    gsutil defacl set public-read gs://<your-bucket-name>
    gsutil -m rsync -r -c -x 'manifest.json' -n ./static gs://<your-bucket-name>/static
    https://storage.googleapis.com/<your-bucket-name>/static/


    gsutil defacl set public-read gs://cater-sample-1

gsutil -m cp -z css,html,js,svg -r -a public-read ./build/static gs://cater-sample-1/static

    gsutil -m -h Content-Encoding:gzip rsync -r -c -x -n '^manifest\.json$|\.gz$' ./build/static/**.css gs://cater-sample-1/static

    https://storage.googleapis.com/cater-sample-1/static/manifest.js

    gsutil -h "Content-Type:text/html" \
          -h "Cache-Control:public, max-age=3600" cp -r images \
          gs://bucket/images
