// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextComponent from 'server/cater/context-component';
import { extractCritical } from 'emotion-server';
import Layout from 'server/^';
import React from 'react';

/**
 */

class EmotionLayout extends ContextComponent {
  render() {
    const ctx = this.caterContext();
    const { ids, css } = extractCritical(ctx.bodyHTML);

    ctx.addGlobalStyle(css);
    ctx.addGlobalJSON('INTERNAL_EMOTION_IDS', ids);

    return <Layout />;
  }
}

export default EmotionLayout;
