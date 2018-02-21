// Copyright Jon Williams 2017-2018. See LICENSE file.
import ContextProvider from 'server/cater/context-provider';
import { extractCritical } from 'emotion-server';
import Layout from 'server/^';
import React from 'react';

/**
 * Utility component that hooks into the server-side Cater Context.
 */

class EmotionLayout extends ContextProvider {
  render() {
    const ctx = this.serverContext();
    const { ids, css } = extractCritical(ctx.bodyHTML);

    ctx.addStyle(css);
    ctx.addJson('INTERNAL_EMOTION_IDS', ids);

    return <Layout />;
  }
}

export default EmotionLayout;
