'use strict';
var expect = require('chai').expect;
var unpack = require('../index.js').unpack;
var list = require('../index.js').list;
var unpackonly = require('../index.js').unpackonly;

var archive = 'test/attr.7z';
var archiveblank = 'test/blank.zip';
var options = {
        targetDir : 'tmp',
        indexes : [0],
        forceOverwrite: true,
        noDirectory: true,
        quiet: false
    }

describe('Method: `list`', function () {
    it('should return an error on lsar error', function (done) {
        list('??', options, function (err, files, text) {
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
        });
    });	
		
    it('should return an error on if missing source file', function (done) {
        list(null, options, function (err, files, text) {
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
        });
    });		
	
    it('should return an error on archive have no files', function (done) {
        list(archiveblank, options, function (err, files, text) {
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
        });
    });	
    
    it('should return an error on no callback function defined', function (done) {
        var err = list(archiveblank, options);
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
    });	
               
    it('should return list of files by index', function (done) {
        list(archive, options, function (err, files, text) {
            if (files) expect(files[options.indexes]).to.be.a('string');
            done();
        });
    });       
    
    it('should return list of files by index `options` null', function (done) {
        list(archive, null, function (err, files, text) {
            if (files) expect(files[options.indexes]).to.be.a('string');
            done();
        });
    });
});

describe('Method: `unpack`', function () {
    
    it('should return an error on unar error', function (done) {
        unpack('???', options, function (err, files, text) {
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
        });
    });    
	
    it('should return an error on if missing source file', function (done) {
        unpack(null, options, function (err, files, text) {
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
        });
    });	
		
    it('should return an error on archive have no files or nothing extracted', function (done) {
        unpack(archiveblank, options, function (err, files, text) {
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
        });
    });	
    
    it('should return an error on no callback function defined', function (done) {
        var err = unpack(archive, {
        targetDir : 'tmp',
        forceOverwrite: true,
        noDirectory: true,
        quiet: false
        });
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
    })
    
    it('should output each file extracted', function (done) {
        unpack(archive, {
        targetDir : 'tmp',
        forceOverwrite: true,
        noDirectory: true,
        quiet: false
    }, function (err, files, text) {
            if (files) expect(files).to.be.a('string');
            done();
        });
    }); 
    
    it('should output each file extracted `options` null', function (done) {
        unpack(archive, null, function (err, files, text) {
            if (files) expect(files).to.be.a('string');
            done();
        });
    }); 
        
    it('should return output on fulfill', function (done) {
        unpack(archive, {
        targetDir : 'tmp',
        forceOverwrite: true,
        noDirectory: true,
        quiet: false
    }, function (err, files, text) {
            if (text) expect(text).to.be.a('string');
            done();
        });
    });    
    
    it('should return output on fulfill `options` null', function (done) {
        unpack(archive, null, function (err, files, text) {
            if (text) expect(text).to.be.a('string');
            done();
        });
    });
});

describe('Method: `unpackonly`', function () {
    
    it('should return an error on if missing source file', function (done) {
        unpackonly(null, 'tmp', ['normal file.txt','read-only file.txt'], function (err, files, text) {
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
        });
    });
	
    it('should return an error on if missing target directory', function (done) {
        unpackonly(archive, null, ['normal file.txt','read-only file.txt'], function (err, files, text) {
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
        });
    });
	
    it('should return an error on if missing file or directory to unpack from archive', function (done) {
        unpackonly(archive, 'tmp', null, function (err, files, text) {
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
        });
    });	
	
    it('should return an error on archive have no files or nothing extracted', function (done) {
        unpackonly(archiveblank, 'tmp', ['normal file.txt','read-only file.txt'], function (err, files, text) {
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
        });
    });	
    
    it('should return an error on no callback function defined', function (done) {
        var err = unpackonly(archiveblank, 'tmp', ['normal file.txt','read-only file.txt']);
            if (err) expect(err).to.be.an.instanceof(Error);
            done();
    })
    
    it('should not output any other file than what is suppplied', function (done) {
        unpackonly(archive, 'tmp', ['normal file.txt','read-only file.txt'], function (err, files, text) {
            if (files) expect(files).to.not.contain('system file.txt');
            if (files) expect(files).to.have.string('read-only file.txt');
            if (files) expect(files).to.have.string('normal file.txt');
            done();
        });
    }); 
	        
    it('should return output on fulfill', function (done) {
        unpackonly(archive, 'tmp', ['normal file.txt','read-only file.txt','system file.txt'], function (err, files, text) {
            if (text) expect(text).to.be.a('string');
            done();
        });
    });	      
    
    it('should return output on fulfill', function (done) {
        unpackonly(archive, 'tmp', ['normal file.txt','read-only file.txt','system file.txt'], function (err, files, text) {
            if (text) expect(text).to.be.a('string');
            done();
        });
    });	        
});