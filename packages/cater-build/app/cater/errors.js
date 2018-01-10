// Copyright Jon Williams 2017-2018. See LICENSE file.
import path from 'path';
import PropTypes from 'prop-types';
import React from 'react';

/* eslint-disable react/forbid-prop-types, react/no-danger */

/**
 * React component to render a error. Can render a regular error message.
 * Ideally it gets a parsed error that has broken down the stack trace for
 * rendering.
 *
 * @see util-errors
 */

const DEFAULT_CSS = `
body { background: white; font-family: monospace; margin: 0; padding: 20px; }
h1, h2, h3 { color: black; font-weight: 400; margin: 0; padding: 0; }
h1 span { background: Tomato; color: white; margin 0 10px; padding: 10px; font-size: 26px; }
h2 { font-size: 20px; margin: 40px 0 10px 0; }

.cater-error { font-family: monospace; }
.cater-error-frame { font-size: 14px; margin-bottom: 10px; }
.cater-error .cater-error-function { font-weight: 800; }
.cater-error-suggestion { background: #eee; padding: 20px; margin: 40px -20px 0 -20px; font-size: 16px; }
`;

class Errors extends React.Component {
  static propTypes = {
    appRootPath: PropTypes.string.isRequired,
    error: PropTypes.object.isRequired
  };

  // Strips out the path of the application and replaces node_modules
  // with their name.
  formatFilename(string) {
    const packageMatch = string.match(/^(.+?)\/node_modules\/(.+)$/);
    if (packageMatch) {
      const [, packageName, packagePath] = packageMatch[2].match(/^([^/]*)\/(.*)/);
      return `[${packageName}] ${packagePath}`;
    }

    return string.replace(`${this.props.appRootPath}${path.sep}`, '');
  }

  render() {
    const { error } = this.props;

    // HTML for the stack trace. Either using the node-side V8 Callsite API
    // or if it's browser-side, render it out.
    let lines = [];
    if (error.trace) {
      lines = error.trace.map((line) => {
        const file = this.formatFilename(line.fileName);
        const fn = `${line.typeName || ''}${line.typeName ? '.' : ''}${line.functionName}`;
        return (
          <li key={line.depth} className="cater-error-frame">
            <div>
              <span title={line.fileName}>
                {file}:{line.lineNumber}
              </span>{' '}
              <span className="cater-error-function">{fn}</span>
            </div>
          </li>
        );
      });
    } else {
      lines = (error.stack || []).split(/[\r\n]+/).map((line, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={line + index} className="cater-error-frame">
          {line}
        </li>
      ));
    }

    return (
      <div>
        <style>{DEFAULT_CSS}</style>
        <div className="cater-error">
          <h1>
            <span>500 Error</span>
          </h1>

          {error.suggestion && <p className="cater-error-suggestion">{error.suggestion}</p>}
          {error.messageHTML ? (
            <h2
              title={error.message}
              dangerouslySetInnerHTML={{ __html: this.formatFilename(error.messageHTML) }}
            />
          ) : (
            <h2 title={error.message}>{this.formatFilename(error.message)}</h2>
          )}
          {error.codeFrameHTML && <pre dangerouslySetInnerHTML={{ __html: error.codeFrameHTML }} />}

          <ol>{lines}</ol>
        </div>
      </div>
    );
  }
}

export default Errors;
