
// Copyright Jon Williams 2017. See LICENSE file.

/**
 * Context used by the CaterProvider component.
 */
class CaterContext {

  constructor(bundlePath) {
    this.bundlePath = bundlePath;
    this.globalStyles = [];
    this.title = "";
  }

  /**
   * Adds a stylesheet that is intended to be rendered in the head of the
   * component. See the GlobalStyles component, which uses this function.
   */
  addGlobalStyle(href) {
    this.globalStyles.push(href);
  }

  /**
   * Sets the title for this page. Only the last title will apply if this
   * is called multiple times in a single render.
   */
  setTitle(title) {
    this.title = title;
  }

}

export default CaterContext;
