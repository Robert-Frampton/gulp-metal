'use strict';

var assert = require('assert');
var fs = require('fs');
var gulp = require('gulp');
var path = require('path');
var registerTasks = require('../../lib/tasks/index');
var sinon = require('sinon');

describe('Build Tasks', function() {
	before(function() {
		this.initialCwd_ = process.cwd();
		process.chdir(path.join(__dirname, 'assets'));
	});

	after(function() {
		process.chdir(this.initialCwd_);
	});

	it('should build js files into a single bundle with globals', function(done) {
		registerTasks({
			bundleFileName: 'foo.js',
			globalName: 'foo'
		});

		gulp.start('build:globals', function() {
			var contents = fs.readFileSync('build/globals/foo.js', 'utf8');
			eval.call(global, contents);

			assert.ok(global.foo);
			assert.ok(global.foo.Bar);
			assert.ok(global.foo.Foo);

			var foo = new global.foo.Foo();
			assert.ok(foo instanceof global.foo.Bar);

			done();
		});
	});

	it('should trigger "end" event even when build:globals throws error for invalid js', function(done) {
		registerTasks({
			buildSrc: 'invalidSrc/Invalid.js',
			bundleFileName: 'invalid.js',
			globalName: 'invalid'
		});
		sinon.stub(console, 'error');

		gulp.start('build:globals', function() {
			assert.strictEqual(1, console.error.callCount);
			done();
		});
	});
});
