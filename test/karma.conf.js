// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-05-02 using
// generator-karma 0.9.0

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'ones/bower_components/jquery/dist/jquery.js',
      'ones/bower_components/angular/angular.js',
      'ones/bower_components/todc-bootstrap/dist/js/bootstrap.js',
      'ones/bower_components/angular-strap/dist/angular-strap.js',
      'ones/bower_components/angular-strap/dist/angular-strap.tpl.js',
      'ones/bower_components/angular-animate/angular-animate.js',
      'ones/bower_components/chosen/chosen.jquery.min.js',
      'ones/bower_components/angular-chosen-localytics/chosen.js',
      'ones/bower_components/moment/moment.js',
      'ones/bower_components/bootstrap/dist/js/bootstrap.js',
      'ones/bower_components/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar-tpls.js',
      'ones/bower_components/angular-sanitize/angular-sanitize.js',
      'ones/bower_components/showdown/src/showdown.js',
      'ones/bower_components/angular-markdown-directive/markdown.js',
      'ones/bower_components/angular-socket-io/socket.js',
      'ones/bower_components/angular-base64-upload/src/angular-base64-upload.js',
      'ones/bower_components/jsbarcode/JsBarcode.js',
      'ones/bower_components/zeroclipboard/dist/ZeroClipboard.js',
      'ones/bower_components/ng-clip/src/ngClip.js',
      'ones/bower_components/angular-cookies/angular-cookies.js',
      'ones/bower_components/angular-resource/angular-resource.js',
      'ones/bower_components/angular-route/angular-route.js',
      'ones/bower_components/angular-touch/angular-touch.js',
      // endbower
      'app/scripts/**/*.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
