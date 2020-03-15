'use strict';

import unpackAll from './index.mjs';

export function demo() {
  unpackAll.list('test/attr.7z', {}, console.info);
}

demo();
