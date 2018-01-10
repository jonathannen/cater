// Copyright Jon Williams 2017-2018. See LICENSE file.
import CustomProvider from 'server/custom-provider';
import { extractCritical } from 'emotion-server';
import ParentProvider from 'app/^'; // Note: Inheritance import
import React, { createElement } from 'react';
import { renderToString } from 'react-dom/server';

/**
 *
 */
class EmotionProvider extends CustomProvider {
  render() {
    const ctx = this.caterContext();
    const appBody = renderToString(this.props.children);
    const { html, ids, css } = extractCritical(appBody);

    ctx.addGlobalStyle(css);
    ctx.addGlobalJSON('INTERNAL_EMOTION_IDS', ids);

    return <ParentProvider dangerouslySetInnerHTML={{ __html: html }} />;
  }
}

export default EmotionProvider;
