const assert = require('assert');
const bm = require('../');

describe('Pattern creation', () => {
    it('Should split path into chunks of regular expressions', () => {
        var pattern = bm.parsePattern('dir/*.spec.js');

        assert.equal(pattern.length, 2, 'Pattern contains two segments');
        assert.equal(pattern[0].slices, 0, 'Regular match length should be 0');
        assert.equal(pattern[1].slices, 1, 'Mask patttern length should be 1');
    });

    it('Should search by map', () => {
        return bm.searchWithMap(bm.parsePattern('test/files/*-file.js'))
        .then(files => {
            assert.equal(files.length, 1, 'Find only one test file in test folder');
            assert.equal(files[0].length, 3, 'There are 3 path segments in result');

            var segments = files[0];
            var filepath = segments.map(segment => segment.file).join('/');

            assert.equal(filepath, 'test/files/test-file.js', 'Path from segments is files/test-file.js');
        })
    });

    it('Should search by pattern', () => {
        return bm.search('test/files/*-file.js')
        .then(files => {
            assert.equal(files.length, 1, 'There is one test file');
            var file = files[0];
            assert.equal(file.length, 2, 'File has one variable match');
            assert.equal(file[1], 'test', 'Variable part is "test"');
        });
    });

    it('Should map patterns', () => {
        return bm.map('test/*/*-file.js', {}, (file, dir, name) => {
            assert.equal(dir, 'files');
            assert.equal(name, 'test');
            return file;
        });
    });

    it('Should map patterns with leading dot', () => {
        return bm.map('./test/*/*-file.js', {}, (file, dir, name) => {
            assert.equal(dir, 'files');
            assert.equal(name, 'test');
            return file;
        });
    });
});
