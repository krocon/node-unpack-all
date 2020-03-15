'use strict';

import unpackAll from './index.mjs';

export function demo() {
  unpackAll.list('test/attr.7z', {}, console.info);
}

export async function demoSync() {
  console.info('aaaaaaa');
  const res = await unpackAll.listSync('test/attr.7z', {});
  console.info('res', res);
  console.info('bbbbbbb');
  return res;
}

console.info('---------');
demo();
console.info('########', demoSync());

console.info('........');
