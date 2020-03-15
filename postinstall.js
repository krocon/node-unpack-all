'use strict';

import fs from 'fs';
import path from 'path';
import wget from 'wget-improved';
import unzip from 'unzipper';
import getInstallCmd from 'system-install';
import child_process from 'child_process';

const exec = child_process.exec;
const unarAppfile = (process.platform === "darwin") ? 'unar1.8.1.zip' : 'unar1.8.1_win.zip';
const unarAppurl = 'https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/theunarchiver/';

const cwd = process.cwd();
const url = unarAppurl + unarAppfile;
const source = path.join(cwd, unarAppfile);
const windows = (process.platform === "win32") || (process.platform === "darwin");

function getExtractUnar(urlsource, filesource, destination) {
  console.log('Downloading ' + urlsource + ' ...');

  return new Promise(function (resolve, reject) {

    let download = wget.download(urlsource, filesource, {});
    download.on('error', reject);
    download.on('start', console.log);
    // download.on('progress', console.log);

    download.on('end', output => {
      console.info('download finsihed.');

      const unzipfile = unzip.Extract({path: destination});
      unzipfile.on('error', reject);
      unzipfile.on('close', resolve);
      fs.createReadStream(filesource).pipe(unzipfile);
    });
  });
}

export function postinstall() {
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
    const cmd = getInstallCmd('unar');
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
      } else {
        console.info('Unar installed successful');
      }
    });
  }
}

postinstall();
