// Copyright Jon Williams 2017. See LICENSE file.
import PropTypes from 'prop-types';
import React from 'react';

// Context shared by Layout to it's child components
const layoutContextTypes = {
    __cater: PropTypes.any
}

/**
 * Layout is used on the Server Side to render the HTML surrounding the
 * #root <div id="root"></div> DOM "home" of the application. Any custom
 * layout should extend this component. See examples/custom-layout for
 * more.
 */
class Layout extends React.Component {
    static childContextTypes = layoutContextTypes;

    static propTypes = {
        app: PropTypes.func.isRequired,
        bundlePath: PropTypes.string.isRequired,
    }

    getChildContext() {
        return { __cater: this.props }
    }

    render() {
        const App = this.props.app;
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <title></title>
                </head>
                <body>
                    <Body />
                    <Scripts />
                </body>
            </html>
        )
    }
}

export class Body extends React.Component {
    static contextTypes = layoutContextTypes;
    render() {
        const App = this.context.__cater.app;
        return (
            <body>
                <div id="root"><App /></div>
            </body>
        );
    }
}


export class Scripts extends React.Component {
    static contextTypes = layoutContextTypes;
    render() {
        const bundlePath = this.context.__cater.bundlePath;
        return <script src={bundlePath}></script>
    }
}

export default Layout;