// Copyright Jon Williams 2017-2018. See LICENSE file.
import { caterContextTypes } from 'server/cater-provider';
import { extractCritical } from 'emotion-server';
import Layout from 'server/^';
import React from 'react';
import React from 'react';

/**
 * Utility component that hooks into the server-side Cater Context.
 */

class EmotionLayout extends Layout {
  static contextTypes = caterContextTypes;

  render() {
    const ctx = this.context.internalCaterContext;
    const { ids, css } = extractCritical(ctx.bodyHTML);

    ctx.addGlobalStyle(css);
    ctx.addGlobalJSON('INTERNAL_EMOTION_IDS', ids);

    return <Layout />;
  }
}

export default EmotionLayout;
