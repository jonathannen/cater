// Copyright Jon Williams 2017-2018. See LICENSE file.

/**
 * Context used by the CaterProvider component.
 */
class CaterContext {
  constructor(bundlePath, url) {
    this.bundlePath = bundlePath;
    this.globalJSON = {};
    this.globalStyles = [];
    this.title = '';
    this.url = url;
  }

  /**
   * Adds a stylesheet that is intended to be rendered in the head of the
   * component. See the GlobalStyles component, which uses this function.
   */
  addGlobalStyle(href) {
    this.globalStyles.push(href);
  }

  /**
   * Adds a piece of global JSON data.
   */
  addGlobalJSON(name, data) {
    this.globalJSON[name] = data;
  }

  /**
   * Sets the title for this page. Only the last title will apply if this
   * is called multiple times in a single render.
   */
  setTitle(title) {
    this.title = title;
  }
}

module.exports = CaterContext; // CommonJS
