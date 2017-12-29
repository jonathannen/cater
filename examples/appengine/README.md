# Cater example: App Engine

Example for deployment to Google Cloud App Engine Flexible.

## Instructions

First, get all the packages installed:

    yarn install

To see the App running locally, run:

    yarn run dev

To deploy to Google Cloud App Engine, you'll need a Google Cloud account ready for deployment. To get started, read through the [Quickstart for Node.js for App Engine Flexible](https://cloud.google.com/appengine/docs/flexible/nodejs/quickstart).

Once you're ready to deploy run:

    yarn run deploy && yarn run browse

This will deploy to App Engine and then open a browser to the deployed application.
