'use strict';

import unpackAll from './index.mjs';

const archive = 'test/sb.cbr';
const options = {
  targetDir: 'tmp',
  indexes: [0],
  forceOverwrite: true,
  noDirectory: true,
  quiet: false
};

unpackAll.list(archive, options, (err, files, text) => {
  if (err) return console.error(err);

  const coverName = files[options.indexes];
  console.info('coverName', coverName);

  unpackAll.unpack(archive, options, (err, files, text) => {
    if (err) return console.error(err);

    console.info('files', files);
    console.info('text', text);
  });
});

