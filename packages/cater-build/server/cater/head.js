// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextConsumer from './context-consumer';
import PropTypes from 'prop-types';
import React from 'react';

/* eslint-disable react/no-danger */

class Head extends ContextConsumer {
  static propTypes = {
    unwrap: PropTypes.bool
  };

  static defaultProps = {
    unwrap: false
  };

  render() {
    const ctx = this.serverContext();

    const preload = ctx.javascripts.map((script) => (
      <link key={`script-preload-${script.src}`} rel="preload" href={script.src} as="script" />
    ));

    const styles = ctx.stylesheets
      .filter((stylesheet) => stylesheet.css)
      .map((stylesheet) => stylesheet.css)
      .join('\n');

    const stylesheetLinks = ctx.stylesheets
      .filter((stylesheet) => stylesheet.href)
      .map((stylesheet) => (
        <link href={stylesheet.href} key={stylesheet.href} rel="stylesheet" type="text/css" />
      ));

    const links = ctx.links.map((props) => <link key={`link-${props.href}`} {...props} />);
    const meta = ctx.meta.map((props) => <meta key={`link-${props.href}`} {...props} />);

    const brains = [
      <meta key="charset" charSet="utf-8" />,
      ...preload,
      <title key="title">{ctx.title}</title>,
      ...meta,
      ...links,
      ...stylesheetLinks
    ];
    if (styles.length > 0) {
      brains.push(<style key="global-css" dangerouslySetInnerHTML={{ __html: styles }} />);
    }

    if (this.props.unwrap) return brains;
    return <head>{brains}</head>;
  }
}

export default Head;
