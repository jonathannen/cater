// Copyright Jon Williams 2017-2018. See LICENSE file.
import React from 'react';
import GlobalStyle from 'app/global-style';

// Import a global stylesheet
import css from '../assets/bundle.scss';

// Import four different image types
import gif from '../assets/cat.gif';
import png from '../assets/cat.png';
import jpg from '../assets/cat.jpg';
import svg from '../assets/cat.svg';

// Bring back Geocities! Renders assets from the asset pipeline
export default () => (
  <div>
    <h1>(Build) Hello World!</h1>
    <GlobalStyle href={css} />
    <img alt="Cute Cat GIF" src={gif} width="50" height="33" />
    <img alt="Cute Cat PNG" src={png} width="50" height="33" />
    <img alt="Cute Cat JPG" src={jpg} width="50" height="33" />
    <img alt="Cute Cat SVG" src={svg} width="50" height="50" />
    <a href=".">...</a>
  </div>
);
