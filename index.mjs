'use strict';

// see http://unarchiver.c3.cx/commandline
// unar and lsar
import fs from 'fs';
import path from 'path';

import log from 'npmlog';
import quote from 'shell-quote';
import child_process from 'child_process';
import os from 'os';

const exec = child_process.exec;
const archiveTypePattern = /: [A-Z,7]*$/g;

function escapeFileName(s) {
  return '"' + s + '"';
}

function defaultListCallback(err, files, text) {
  if (err) return log.error(err);

  if (files) log.info('files', files);
  if (text) log.info('text', text);
}

function isInt(x) {
  return !isNaN(x) && eval(x).toString().length === parseInt(eval(x)).toString().length;
}

function defaultListFilter(s) {
  return s && s !== ''
    && s.indexOf('\r') === -1
    && s.indexOf('\n') === -1
    && !s.match(archiveTypePattern);
}

function unpack(archiveFile, options, callback) {
  if (!archiveFile) archiveFile = options.archiveFile;
  if (!archiveFile) return log.error("Error: archiveFile or options.archiveFile missing.");

  if (!callback) callback = defaultListCallback;
  if (!options) options = {};

  // Unar command:
  let unar = options.unar;
  if (!unar) unar = 'unar';
  let ar = [unar];

  // Archive file (source):
  ar.push('SOURCEFILE');
  //ar.push(archiveFile);

  // -output-directory (-o) <string>: The directory to write the contents of the archive to. Defaults to the current directory.
  ar.push('-o');
  let targetDir = options.targetDir;
  if (!targetDir) targetDir = path.join(os.tmpdir(), 'tmp');

  if (options.randomTargetSubDir) {
    targetDir = targetDir + '/t' + Date.now()
  }

  ar.push(targetDir);

  // -force-overwrite (-f): Always overwrite files when a file to be unpacked already exists on disk. By default, the program asks the user if possible, otherwise skips the file.
  if (options.forceOverwrite) ar.push('-f');

  // -force-rename (-r): Always rename files when a file to be unpacked already exists on disk.
  if (options.forceRename) ar.push('-r');

  // -force-skip (-s): Always skip files when a file to be unpacked already exists on disk.
  if (options.forceSkip) ar.push('-s');

  // -force-directory (-d): Always create a containing directory for the contents of the unpacked archive. By default, a directory is created if there is more than one top-level file or folder.
  if (options.forceDirectory) ar.push('-d');

  // -no-directory (-D): Never create a containing directory for the contents of the unpacked archive.
  if (options.noDirectory) ar.push('-D');

  // -no-recursion (-nr): Do not attempt to extract archives contained in other archives. For instance, when unpacking a .tar.gz file, only unpack the .gz file and not its contents.
  if (options.noRecursion) ar.push('-nr');

  // -copy-time (-t): Copy the file modification time from the archive file to the containing directory, if one is created.
  if (options.copyTime) ar.push('-t');

  // -quiet (-q): Run in quiet mode.
  if (options.quiet) ar.push('-q');

  // -password (-p) <string>: The password to use for decrypting protected archives.
  if (options.password) {
    ar.push('-p');
    ar.push(options.password);
  }
  // -password-encoding (-E) <name>: The encoding to use for the password for the archive, when it is not known. If not specified, then either the encoding given by the -encoding option or the auto-detected encoding is used.
  if (options.passwordEncoding) {
    ar.push('-E');
    ar.push(options.passwordEncoding);
  }

  // -encoding (-e) <encoding name>: The encoding to use for filenames in the archive, when it is not known. If not specified, the program attempts to auto-detect the encoding used. Use "help" or "list" as the argument to give
  if (options.encoding) {
    ar.push('-e');
    ar.push(options.encoding);
  }

  if (options.indexes) {
    // -indexes (-i): Instead of specifying the files to unpack as filenames or wildcard patterns, specify them as indexes, as output by lsar.
    if (Array.isArray(options.indexes)) {
      options.indexes.forEach(idx => {
        ar.push('-i');
        ar.push('' + idx); // string!
      });
    } else if (isInt(options.indexes)) {
      console.error('options.indexes must be an array of integer, but it is: ' + JSON.stringify(options.indexes))
    }
  } else if (options.files) {
    if (Array.isArray(options.files)) {
      options.files.forEach(s => {
        ar.push(s);
      });
    } else {
      ar.push(options.files);
    }
  }

  if (!options.quiet) log.info('command', quote.quote(ar));

  let cmd = quote.quote(ar).replace('SOURCEFILE', escapeFileName(archiveFile));
  if (!options.quiet) log.info('cmd', cmd);

  exec(cmd, (err, stdout, stderr) => {
    if (err) return callback(err, null);
    if (stderr && stderr.length > 0) return callback('Error: ' + stderr, null);
    if (stdout && stdout.length > 0) {
      if (stdout.indexOf('No files extracted') > -1) return callback('Error: No files extracted', null);
    }

    if (options.randomTargetSubDir) {
      walk(targetDir, (err, res) => {
        if (!options.quiet) console.info(res);
        callback(null, targetDir, res.join('\n'));
      });
    } else {
      callback(null, targetDir, stdout);
    }
  });
} // unpackAll.unpack

function list(archiveFile, options, callback) {
  if (!archiveFile) archiveFile = options.archiveFile;
  if (!archiveFile) return log.error("Error: archiveFile or options.archiveFile missing.");
  if (!callback) callback = defaultListCallback;

  if (!options) options = {};

  // Unar command:
  let lsar = options.lsar;
  if (!lsar) lsar = 'lsar';
  let ar = [lsar];

  // Archive file (source):
  ar.push('SOURCEFILE');

  // -no-recursion (-nr): Do not attempt to extract archives contained in other archives. For instance, when unpacking a .tar.gz file, only unpack the .gz file and not its contents.
  if (options.noRecursion) ar.push('-nr');

  // -password (-p) <string>: The password to use for decrypting protected archives.
  if (options.password) {
    ar.push('-p');
    ar.push(options.password);
  }
  // -password-encoding (-E) <name>: The encoding to use for the password for the archive, when it is not known. If not specified, then either the encoding given by the -encoding option or the auto-detected encoding is used.
  if (options.passwordEncoding) {
    ar.push('-E');
    ar.push(options.passwordEncoding);
  }

  // -encoding (-e) <encoding name>: The encoding to use for filenames in the archive, when it is not known. If not specified, the program attempts to auto-detect the encoding used. Use "help" or "list" as the argument to give
  if (options.encoding) {
    ar.push('-e');
    ar.push(options.encoding);
  }

  // -print-encoding (-pe): Print the auto-detected encoding and the confidence factor after the file list
  if (options.printEncoding) {
    ar.push('-pe');
    ar.push(options.printEncoding);
  }

  // -json (-j): Print the listing in JSON format.
  if (options.json) ar.push('-j');

  // -json-ascii (-ja): Print the listing in JSON format, encoded as pure ASCII text.
  if (options.jsonAscii) ar.push('-ja');

  let cmd = quote.quote(ar).replace('SOURCEFILE', escapeFileName(archiveFile));
  if (!options.quiet) log.info('cmd', cmd);

  const proc = exec(cmd, (err, stdout, stderr) => {
    if (err) return callback(err, null);
    if (stderr && stderr.length > 0) return callback('Error: ' + stderr, null);

    let lines = stdout.split(/(\r?\n)/g);
    if (lines.length > 0) {
      let files = lines.filter(unpackAll.defaultListFilter);
      return callback(null, files);

    } else {
      return callback('Error: no files foound in archive. ' + stderr, null);
    }
  });
  // let list = [];
  // proc.stdout.setEncoding('utf8');
  // proc.stdout.on('data', function (chunk) {
  //   list.push(chunk);
  // });
  //
  // proc.stdout.on('end', function () {
  //   callback(list.join());
  // });
}

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;

    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);

      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
}


const unpackAll = {};
unpackAll.list = list;
unpackAll.unpack = unpack;
unpackAll.defaultListFilter = defaultListFilter;

export {unpackAll as default};


