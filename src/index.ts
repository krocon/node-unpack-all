import fs from 'fs';
import path from 'path';

import child_process from 'child_process';
import os from 'os';
import {UnpackCallbackType} from "./unpack-callback.type";
import {UnpackOptionsIf} from "./unpack-options.if";
import {UnpackListOptionsIf} from "./unpack-list-options.if";

const exec = child_process.exec;
const archiveTypePattern = /: [A-Z,7]*$/g;

type Done = (error: any, result: string[] | null) => void;

function quote(xs: any[]) {
    return xs.map(s => {
        if (s && typeof s === 'object') {
            return s.op.replace(/(.)/g, '\\$1');
        }
        else if (/["\s]/.test(s) && !/'/.test(s)) {
            return "'" + s.replace(/(['\\])/g, '\\$1') + "'";
        }
        else if (/["'\s]/.test(s)) {
            return '"' + s.replace(/(["\\$`!])/g, '\\$1') + '"';
        }
        else {
            return String(s).replace(/([A-Za-z]:)?([#!"$&'()*,:;<=>?@\[\\\]^`{|}])/g, '$1\\$2');
        }
    }).join(' ');
}

function walk(dir: string, done: Done) {
    let results: string[] = [];
    fs.readdir(dir, (err, list) => {
        if (err) return done(err, null);
        let i = 0;

        (function next() {
            let file = list[i++];
            if (!file) return done(null, results);

            file = path.resolve(dir, file);
            fs.stat(file, (_, stat) => {
                if (stat && stat.isDirectory()) {
                    walk(file, (_, res) => {
                        if (res) results = results.concat(res);
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

function escapeFileName(s: string): string {
    return '"' + s + '"';
}

function defaultListCallback(err: any, _files: string[] | null, _text: string) {
    if (err) return console.error(err);
    // if (files) console.log('files', files);
    // if (text) console.log('text', text);
}

function isInt(x: any) {
    return !isNaN(x) && eval(x).toString().length === parseInt(eval(x)).toString().length;
}

function defaultListFilter(s: string): boolean {
    return !!(s && s !== ''
        && s.indexOf('\r') === -1
        && s.indexOf('\n') === -1
        && !s.match(archiveTypePattern));
}

export function unpack(
    archiveFile: string | undefined,
    options: Partial<UnpackOptionsIf>,
    callback: UnpackCallbackType) {
    if (!archiveFile) archiveFile = options.archiveFile;
    if (!archiveFile) return console.error("Error: archiveFile or options.archiveFile missing.");

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

    if (!options.quiet) console.info('command', quote(ar));

    let cmd = quote(ar).replace('SOURCEFILE', escapeFileName(archiveFile));
    if (!options.quiet) console.info('cmd', cmd);

    exec(cmd, (err, stdout, stderr) => {
        if (err) return callback(err, null, '');
        if (stderr && stderr.length > 0) return callback('Error: ' + stderr, null, '');
        if (stdout && stdout.length > 0) {
            if (stdout.indexOf('No files extracted') > -1) return callback('Error: No files extracted', null, '');
        }

        if (options.randomTargetSubDir) {
            if (targetDir) {
                const td: string = targetDir;
                walk(targetDir, (_, res) => {
                    if (!options.quiet) console.info(res);
                    const msg = res ? res.join('\n') : '';
                    callback(null, [td], msg);
                });
            }
        } else {
            if (targetDir) {
                callback(null, [targetDir], stdout);
            }
        }
    });
} // unpackAll.unpack


export function list(
    archiveFile: string | undefined,
    options: Partial<UnpackListOptionsIf>,
    callback: UnpackCallbackType) {
    if (!archiveFile) archiveFile = options.archiveFile;
    if (!archiveFile) return console.error("Error: archiveFile or options.archiveFile missing.");
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

    let cmd = quote(ar).replace('SOURCEFILE', escapeFileName(archiveFile));
    if (!options.quiet) console.info('cmd', cmd);

    exec(cmd, (err, stdout, stderr) => {
        if (err) return callback(err, null, '');
        if (stderr && stderr.length > 0) return callback('Error: ' + stderr, null, '');

        let lines = stdout.split(/(\r?\n)/g);
        if (lines.length > 0) {
            let files = lines.filter(defaultListFilter);
            return callback(null, files, '');

        } else {
            return callback('Error: no files foound in archive. ' + stderr, null, '');
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

export async function listSync(archiveFile: string, options: UnpackOptionsIf) {
    return await new Promise((resolve, reject) => {
        list(archiveFile, options, (err: string | undefined, files: string[] | null, _: string) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

export async function unpackSync(archiveFile: string, options: UnpackOptionsIf) {
    return await new Promise((resolve, reject) => {
        unpack(archiveFile, options, (err, files, _) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

