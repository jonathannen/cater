// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextComponent from 'server/cater/context-component';
import PropTypes from 'prop-types';
import React from 'react';

/* eslint-disable react/no-danger */

class Head extends ContextComponent {
  static propTypes = {
    unwrap: PropTypes.bool
  };

  static defaultProps = {
    unwrap: false
  };

  render() {
    const ctx = this.caterContext();

    let css = '';
    if (ctx.globalStyles) {
      const joinedCss = ctx.globalStyles.join('\n');
      css = <style key="global-css" dangerouslySetInnerHTML={{ __html: joinedCss }} />;
    }

    const brains = [
      <meta key="charset" charSet="utf-8" />,
      <link key="script-preload" rel="preload" href={ctx.bundlePath} as="script" />,
      <title key="title">{ctx.title}</title>,
      css
    ];

    const globalStyleLinks = ctx.globalStyleLinks.map((href) => (
      <link href={href} key={href} rel="stylesheet" type="text/css" />
    ));

    const children = brains.concat(globalStyleLinks);

    if (this.props.unwrap) return children;
    return <head>{children}</head>;
  }
}

export default Head;
