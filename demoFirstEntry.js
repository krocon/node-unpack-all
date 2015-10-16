
(function(){
    'use strict';

    var unpackAll = require('./index.js');

    var archive = 'test/abc (12).rar';
    var options = {
        targetDir : 'tmp',
        indexes : [0],
        forceOverwrite: true,
        noDirectory: true,
        quiet: false
    };

    unpackAll.list(archive, options, function (err, files, text) {
        if (err) return console.error(err);

        var coverName = files[options.indexes];
        console.info('coverName', coverName);

        unpackAll.unpack(archive, options, function (err, files, text) {
            if (err) return console.error(err);

            console.info('files', files);
            console.info('text', text);
        });
    });

})();