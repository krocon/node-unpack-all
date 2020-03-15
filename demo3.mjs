'use strict';

import unpackAll from './index.mjs';

const archive = 'f:/ebooks/_deu/__temp3/s/schwarzbart-der-pirat-bastei/Schwarzbart der Pirat (Bastei) - 11 - Grillfest fuer den Weissen Vater.cbr';
const options = {
  targetDir: 'tmp',
  randomTargetSubDir: true,
  indexes: [0],
  forceOverwrite: true,
  noDirectory: true,
  quiet: false,
  // encoding: 'utf-8'
  // encoding: 'windows-1252'
  // encoding: 'cp1252'
  // printEncoding: true
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

