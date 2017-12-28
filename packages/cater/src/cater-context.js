
// Copyright Jon Williams 2017. See LICENSE file.

/**
 * Context used by the CaterProvider component.
 */
class CaterContext {

  constructor() {
    this.globalStyles = [];
  }

  /**
   * Adds a stylesheet that is intended to be rendered in the head of the
   * component. See the GlobalStyles component, which uses this function.
   *
   * @param {*} href
   */
  addGlobalStyle(href) {
    this.globalStyles.push(href);
  }

}

export default CaterContext;
