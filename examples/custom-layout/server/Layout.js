// Copyright Jon Williams 2017. See LICENSE file.
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Layout is used on the Server Side to render the HTML surrounding the
 * #root <div id="root"></div> DOM "home" of the application. 
 */
class Layout extends Component {
    render() {
        const App = this.props.app;
        const bundlePath = this.props.bundlePath
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <title></title>
                </head>
                <body>
                    <h1>This is a Custom Layout</h1>
                    <div id="root"><App/></div>
                    <script src={bundlePath}></script>
                </body>
            </html>
        )
    }

}

Layout.propTypes = {
   app: PropTypes.func.isRequired,
   bundlePath: PropTypes.string.isRequired,
}

export default Layout;