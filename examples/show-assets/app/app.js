// Copyright Jon Williams 2017-2018. See LICENSE file.
import GlobalStyle from 'app/global-style';
import React from 'react';
import Title from 'app/title';

// Import a global stylesheet
import css from 'assets/bundle.scss';

// Import four different image types
import gif from 'assets/cat.gif';
import png from 'assets/cat.png';
import pngForceData from 'assets/cat.png.datauri';
import jpg from 'assets/cat.jpg';
import jpgTiny from 'assets/cat-tiny.jpg';
import svg from 'assets/cat.svg';

const title = 'Cats on Cats on Cats - Cater Asset Test';

// Bring back Geocities! Renders assets from the asset pipeline
export default () => (
  <div>
    <Title>{title}</Title>
    <h1>{title}</h1>

    <GlobalStyle href={css} />

    <p>
      <img alt="Cute Cat GIF" src={gif} width="100" height="66" />
    </p>
    <p>
      <img alt="Cute Cat PNG" src={png} width="100" height="66" />
    </p>
    <p>
      <img alt="Cute Cat JPG" src={jpg} width="100" height="66" />
    </p>
    <p>
      <img alt="Cute Cat SVG" src={svg} width="100" height="100" />
    </p>
    <p>
      <a href=".">...</a>
    </p>

    <hr />
    <h2>Assets Loaded as data URIs</h2>
    <p>
      <img alt="Tiny Cat JPG" src={jpgTiny} width="100" height="66" />
    </p>

    <p>
      <img
        alt="Cat PNG that's forced to be a data URI"
        src={pngForceData}
        width="100"
        height="66"
      />
    </p>
  </div>
);
