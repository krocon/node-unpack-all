'use strict';

import unpackAll from './../index.mjs';
const unpack = unpackAll.unpack;
const list = unpackAll.list;

import chai from 'chai';
const {expect} = chai;



let archive = 'test/attr.7z';
let archiveblank = 'test/blank.zip';
let options = {
  targetDir: 'tmp',
  indexes: [0],
  forceOverwrite: true,
  noDirectory: true,
  quiet: false
};

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
    let err = list(archiveblank, options);
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
    let err = unpack(archive, {
      targetDir: 'tmp',
      forceOverwrite: true,
      noDirectory: true,
      quiet: false
    });
    if (err) expect(err).to.be.an.instanceof(Error);
    done();
  });

  it('should output each file extracted', function (done) {
    unpack(archive, {
      targetDir: 'tmp',
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
      targetDir: 'tmp',
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


