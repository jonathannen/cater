// Copyright Jon Williams 2017. See LICENSE file.
import { caterContextTypes } from "./cater-provider"; // Note: Relative import
import PropTypes from "prop-types";
import React from "react";

/**
 * Renders the script tags based upon the bundled client-side code.
 */
export class Scripts extends React.Component {
  static contextTypes = caterContextTypes;
  render() {
    const bundlePath = this.context.__caterContext.bundlePath;
    return <script src={bundlePath} />;
  }
}

export default Scripts;
