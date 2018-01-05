# Cater example: Deploy to App Engine

Example for deployment to Google Cloud App Engine Flexible.

This version also includes using Google Cloud Storage as a CDN.

## Instructions

First, get all the packages installed:

    yarn install

To see the App running locally, run:

    yarn run dev

To deploy to Google Cloud App Engine, you'll need a Google Cloud account ready for deployment. To get started, read through the [Quickstart for Node.js for App Engine Flexible](https://cloud.google.com/appengine/docs/flexible/nodejs/quickstart).

Once you're ready to deploy run the following. Note that this setup will create a bucket with a default name of \_gs://<project-id>-appengine. You can change this in cater.config.js. Otherwise, run:

    yarn run build

The production version is now build in the build directory. Note that if you now run:

    yarn run start

You'll be able to see the production version at http://localhost:8080 - However, the assets will not load as the production version is expecting to find them on the CDN. To deploy and view the application on Google Cloud App Engine run:

    yarn run deploy
    yarn run browse

This will deploy to App Engine and then open a browser to the deployed application.
