# Cater Assets

cater-assets is a Cater Plugin that provides asset processing for the Cater Framework.

This plugin looks in the _assets_ directory of your application for the usual suspects - jpg, png, css and even scss files. They will be compiled and digested as part of the build process.

These files can be used by importing them in your project. For example if you had _assets/cat.png_, you can use in a component with:

    import awesomeCatPicture from "assets/cat.png";
    import React from "react";

    export default () => <img src={awesomeCatPicture} />;

This component would render the image with your awesome cat picture.

For more information, look at the [top-level Cater Documentation](https://github.com/jonathannen/cater).
