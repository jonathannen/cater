// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextComponent from 'server/cater/context-component';
import PropTypes from 'prop-types';
import React from 'react';
import util from 'util';

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

    const preload = ctx.globalScriptLinks.map((src) => (
      <link key="script-preload" rel="preload" href={src} as="script" />
    ));
    const brains = [
      <meta key="charset" charSet="utf-8" />,
      ...preload,
      <title key="title">{ctx.title}</title>,
      css
    ];

    const globalStyleLinks = ctx.globalStyleLinks.map((href) => (
      <link href={href} key={href} rel="stylesheet" type="text/css" />
    ));

    const links = ctx.links.map((props) => {
      const key = util.inspect(props);
      return <link {...props} key={key} />;
    });

    const children = brains.concat(globalStyleLinks).concat(links);

    if (this.props.unwrap) return children;
    return <head>{children}</head>;
  }
}

export default Head;
