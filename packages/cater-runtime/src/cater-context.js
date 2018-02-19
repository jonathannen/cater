// Copyright Jon Williams 2017-2018. See LICENSE file.

/**
 * Context used by the CaterProvider component.
 */
class CaterContext {
  constructor(bundlePath, url) {
    this.bundlePath = bundlePath;
    this.globalJavaScript = [];
    this.globalJSON = {};
    this.globalStyles = [];
    this.globalStyleLinks = [];
    this.links = [];
    this.title = '';
    this.url = url;
  }

  /**
   * Adds a stylesheet that is intended to be rendered in the head of the
   * component. See the GlobalStyles component, which uses this function.
   */
  addGlobalStyle(css) {
    this.globalStyles.push(css);
  }

  /**
   * Adds a stylesheet that is intended to be rendered in the head of the
   * component. See the GlobalStyles component, which uses this function.
   */
  addGlobalStyleLink(href) {
    this.globalStyleLinks.push(href);
  }

  /**
   * Add the piece of JavaScript to be added at the end of the page.
   */
  addGlobalJavaScript(script) {
    this.globalJavaScript.push(script);
  }

  /**
   * Adds a piece of global JSON data.
   */
  addGlobalJSON(name, data) {
    this.globalJSON[name] = data;
  }

  /**
   * Adds a <head> link element
   */
  addLink(props) {
    this.links.push(props);
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
