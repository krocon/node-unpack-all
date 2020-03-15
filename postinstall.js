'use strict';

import fs from 'fs';
import path from 'path';

const unarAppfile = (process.platform === "darwin") ? 'unar1.8.1.zip' : 'unar1.8.1_win.zip';
const unarAppurl = 'https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/theunarchiver/';

const cwd = process.cwd();
const url = unarAppurl + unarAppfile;
const source = path.join(cwd, unarAppfile);
const windows = (process.platform === "win32") || (process.platform === "darwin");

if (windows) {
  getExtractUnar(url, source, cwd)
    .then(function () {
      fs.unlink(source, (err) => {
        if (err) console.error(err);
      });
      if (process.platform !== "win32") {
        const chmod = ['unar', 'lsar'];
        chmod.forEach(s => {
          fs.chmodSync(path.join(cwd, s), 755)
        });
      }
      console.info('Unar installed successful');
    })
    .catch(console.error);

} else {

  const system_installer = require('system-installer').installer;
  system_installer('unar')
    .then(function () {
      console.info('Unar installed successful');
    })
    .catch(console.error);
}


function getExtractUnar(urlsource, filesource, destination) {
  import node_wget from 'node-wget';
  import unzip from 'unzipper';
  console.log('Downloading ' + urlsource + ' ...');

  return new Promise(function (resolve, reject) {
    node_wget({url: urlsource, dest: filesource}, err => {
      if (err) {
        return reject('Error downloading file: ' + err);
      }
      const unzipfile = unzip.Extract({path: destination});
      unzipfile.on('error', err => {
        reject(err);
      });
      unzipfile.on('close', () => {
        resolve();
      });
      fs.createReadStream(filesource).pipe(unzipfile);
    });
  });
}
