// Copyright Jon Williams 2017-2018. See LICENSE file.
import CustomProvider from 'server/custom-provider';
import React from 'react';
import shortid from 'shortid';

/* eslint-disable react/no-danger */

/**
 * Renders the script tags based upon the bundled client-side code.
 */
export class Scripts extends CustomProvider {
  render() {
    const ctx = this.caterContext();

    let results = [];
    if (process.env.CATER_MODE === 'dev') {
      results = [
        <script
          dangerouslySetInnerHTML={{
            __html: 'window.onerror = function() { window.errorState = arguments; }'
          }}
        />
      ];
    }

    // For each Global JSON object, inject a script with an escaped
    // JSON-based payload. This is extracted and added to the "name"
    // property of window (client-side) on load.
    //
    // Attribute-style escaping is solid XSS-wise, but quite verbose
    // in the resulting document. We may substitute another method in down
    // the line.
    const json = Object.entries(ctx.globalJSON).map(([name, data]) => {
      const id = `__json-${shortid.generate()}`;
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
    results = results.concat(json);

    const scripts = ctx.globalJavaScript.map((script) => (
      <script type="text/javascript" dangerouslySetInnerHTML={{ __html: script }} />
    ));
    results = results.concat(scripts);

    // Add the main bundle script in
    results.push(<script async src={ctx.bundlePath} />);
    return results;
  }
}

export default Scripts;
