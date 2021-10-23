
# unpack-all

Wrapper for [unar and lsar](http://unarchiver.c3.cx/commandline) command line tool.
It allows you to unpack a lot of formats: zip, zipx, rar, 7z, tar, gzip, bzip2, lzma, ... [complete list](http://unarchiver.c3.cx/formats)

## Installation

Installation avaiable for Mac OS X, Windows, Ubuntu and other Linuxes: see [here](http://unarchiver.c3.cx/commandline).
Window users can use a 'portable' version of [Unarchiver](http://unarchiver.c3.cx/commandline): just copy the three files Foundation.1.0.dll, unar.exe and lsar.exe to the root of your node app.

## Usage
```js
import unpackAll from 'unpack-all';

// list only:
unpackAll.list(archiveFile<String>, options<Object>, callback<function>);
// or list sync:
const res = await unpackAll.listSync(archiveFile<String>, options<Object>);

// unpack:
unpackAll.unpack(archiveFile<String>, options<Object>, callback<function>);
// or unpack sync:
const files = await unpackAll.unpackSync(archiveFile<String>, options<Object>);
```

### Examples

#### Example: unpack file
```js
import unpackAll from 'unpack-all';

unpackAll.unpack(
    'test/abc.rar', 
    { 
      targetDir: 'out' 
    }, 
    (err, files, text) => {
       if (err) return console.error(err);
       if (files) console.log('files', files);
       if (text) console.log('text', text);
    });
```

#### Example: list content
```js
import unpackAll from 'unpack-all';

function cb(err, files, text) {
    if (err) return console.error(err);
    console.log('files', files);
}

unpackAll.list('test/abc.rar', {}, cb);
```                    


### Options

Key       | Possible values        | Comment
--------- | -----------------------|-------------------------------------------------
quiet     | true/false (default)   | true will reduce logging for unpacking
targetDir | \<String>              | The directory to write the contents of the archive to. Defaults to the current directory.
randomTargetSubDir | true/false (default)              | If true, a random subfolder will created for each unpack operation in target dir.
forceOverwrite | true/false (default)  | if null, tmp dir will created automatically
forceDirectory | true/false/undefined  | Always create a containing directory for the contents of the unpacked archive. By default, a directory is created if there is more than one top-level file or folder.
noDirectory | true/false/undefined     | Never create a containing directory for the contents of the unpacked archive.
noRecursion | true/false/undefined     | Do not attempt to extract archives contained in other archives. For instance, when unpacking a .tar.gz file, only unpack the .gz file and not its contents.
copyTime | true/false/undefined        | Copy the file modification time from the archive file to the containing directory, if one is created.
password | \<String>                   | The password to use for decrypting protected archives.
passwordEncoding | \<String>           | The encoding to use for the password for the archive, when it is not known. If not specified, then either the encoding given by the -encoding option or the auto-detected encoding is used.
encoding | \<String>                   | The encoding to use for filenames in the archive, when it is not known. If not specified, the program attempts to auto-detect the encoding used. Use "help" or "list" as the argument to give 


 
                    
