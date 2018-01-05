# Cater Packages

The core of Cater is covered by the cater, cater-runtime and cater-build packages.

In all case you'll want to install the cater package. This brings in cater-runtime. This is suitable for a production deployment. With yarn that's as simple as:

    yarn add cater

At development and build time, you'll want cater-build as a "dev" dependency. Install to your application using:

    yarn add --dev cater-build
