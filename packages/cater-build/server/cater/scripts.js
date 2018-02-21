// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextConsumer from './context-consumer';
import React from 'react';

/* eslint-disable react/no-danger */

function errorHandlerScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: 'window.onerror = function() { window.errorState = arguments; }'
      }}
    />
  );
}

/**
 * Renders the script tags based upon the bundled client-side code.
 */
export class Scripts extends ContextConsumer {
  render() {
    const ctx = this.serverContext();

    const errorScript = process.env.CATER_MODE === 'dev' ? errorHandlerScript() : [];

    // For each Global JSON object, inject a script with an escaped
    // JSON-based payload. This is extracted and added to the "name"
    // property of window (client-side) on load.
    //
    // Attribute-style escaping is solid XSS-wise, but quite verbose
    // in the resulting document. We may substitute another method in down
    // the line.
    const json = Object.entries(ctx.json).map(([name, data]) => {
      const id = `__json-${name}`;
      const script = `(function() { window.${name} = JSON.parse(document.getElementById('${id}').getAttribute('data-payload')); })();`;

      // As the payload is an attribute, React will escape the values
      return (
        <script
          id={id}
          data-payload={JSON.stringify(data)}
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: script }}
        />
      );
    });

    const links = ctx.javascripts.map((script) => <script async src={script.src} />);
    return [...errorScript, ...json, ...links];
  }
}

export default Scripts;
