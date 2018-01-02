import { hydrate } from 'emotion';

if (window.INTERNAL_EMOTION_IDS) {
  hydrate(window.INTERNAL_EMOTION_IDS);
}
