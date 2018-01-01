// Copyright Jon Williams 2017-2018. See LICENSE file.
import CustomProvider from 'server/custom-provider';
import React from 'react';
import shortid from 'shortid';

/**
 * Renders the script tags based upon the bundled client-side code.
 */
export class Scripts extends CustomProvider {
  render() {
    const ctx = this.caterContext();

    // For each Global JSON object, inject a script with an escaped
    // JSON-based payload. This is extracted and added to the "name"
    // property of window (client-side) on load.
    //
    // Attribute-style escaping is solid XSS-wise, but quite verbose
    // in the resulting document. We may substitute another method in down
    // the line.
    const result = Object.entries(ctx.globalJSON).map(([name, data]) => {
      const id = `__json-${shortid.generate()}`;
      const script = `(function() { window.${name} = JSON.parse(document.getElementById('${id}').getAttribute('data-payload')); })();`;

      // As the payload is an attribute, React will escape the values
      return (
        <script
          id={id}
          data-payload={JSON.stringify(data)}
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: script }} // eslint-disable-line react/no-danger
        />
      );
    });

    // Add the main bundle script in
    result.push(<script async src={ctx.bundlePath} />);
    return result;
  }
}

export default Scripts;
