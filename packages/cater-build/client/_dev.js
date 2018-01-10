// Copyright Jon Williams 2017-2018. See LICENSE file.
import Errors from 'app/cater/errors';
import Provider from 'app/provider';
import React from 'react';
import { render } from 'react-dom';

// Add in hooks for development-time scripting. This includes a hook that
// will capture uncaught errors and attempt to render the error page.
// eslint-disable-next-line no-undef
if (MODE === 'dev') {
  const rootElement = document.getElementById('root');

  // eslint-disable-next-line no-inner-declarations
  function uncaughtErrorHandler(message, source, lineno, colno, error) {
    render(
      <Provider>
        <Errors error={error} appRootPath="" />
      </Provider>,
      rootElement
    );
  }

  window.onerror = uncaughtErrorHandler;
  if (window.errorState) uncaughtErrorHandler(...window.errorState);
}
