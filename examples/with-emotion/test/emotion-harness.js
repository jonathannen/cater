// Copyright Jon Williams 2017. See LICENSE file.

// Because of the JSDOM environment the global "window" is defined. This causes
// emotion to believe it's client side and behave differently. So we force
// emotion to be server-side here -- you could also abandon the use of JSDOM
// for testing, but it's useful to have around and wil likely be used.

var emotion = require('emotion');

emotion.resetForServerSideRendering = function() {
    emotion.sheet.isBrowser = false;
    emotion.flush();
}
emotion.resetForServerSideRendering();

export default emotion;