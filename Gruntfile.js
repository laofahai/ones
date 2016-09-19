// Generated on 2015-05-02 using generator-angular 0.11.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            js: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            jsTest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['newer:jshint:test', 'karma']
            },
            styles: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
                tasks: ['newer:copy:styles', 'autoprefixer']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/{,*/}*',
                        '!<%= yeoman.dist %>/.git{,*/}*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            server: {
                options: {
                    map: true
                },
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },

        // Automatically inject Bower components into the app
        wiredep: {
            app: {
                src: ['<%= yeoman.app %>/index.html', '<%= yeoman.app %>/frame.html', '<%= yeoman.app %>/app.html'],
                ignorePath:  /\.\.\//
            },
            test: {
                devDependencies: true,
                src: '<%= karma.unit.configFile %>',
                ignorePath:  /\.\.\//,
                fileTypes:{
                    js: {
                        block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
                        detect: {
                            js: /'(.*\.js)'/gi
                        },
                        replace: {
                            js: '\'{{filePath}}\','
                        }
                    }
                }
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= yeoman.dist %>/scripts/{,*/}*.js',
                    '<%= yeoman.dist %>/styles/{,*/}*.css',
                    '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= yeoman.dist %>/styles/fonts/*'
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            index: {
                src: '<%= yeoman.dist %>/index.html',
                options: {
                    dest: '<%= yeoman.dist %>'
                }
            },
            app: {
                src: '<%= yeoman.dist %>/app.html',
                options: {
                    dest: '<%= yeoman.dist %>'
                }
            },
            frame: {
                src: '<%= yeoman.dist %>/frame.html',
                options: {
                    dest: '<%= yeoman.dist %>'
                }
            }

        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['<%= yeoman.dist %>/index.html', '<%= yeoman.dist %>/app.html', '<%= yeoman.dist %>/frame.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                assetsDirs: [
                    '<%= yeoman.dist %>',
                    '<%= yeoman.dist %>/images',
                    '<%= yeoman.dist %>/styles'
                ]
            }
        },

        // The following *-min tasks will produce minified files in the dist folder
        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        concat: {
            vendor: {
                files: [
                    {
                        dest: '.tmp/concat/assets/css/vendor.css',
                        src: [
                            "ones/bower_components/font-awesome/css/font-awesome.css",
                            "ones/bower_components/todc-bootstrap/dist/css/bootstrap.css",
                            "ones/bower_components/todc-bootstrap/dist/css/todc-bootstrap.css",
                            "ones/bower_components/angular-motion/dist/angular-motion.css",
                            "ones/bower_components/chosen/chosen.min.css",
                            "ones/bower_components/angular-bootstrap-calendar/dist/css/angular-bootstrap-calendar.css",
                            "ones/bower_components/bootstrap-additions/dist/bootstrap-additions.css"
                        ]
                    },
                    {
                        dest: '.tmp/concat/assets/js/vendor.js',
                        src: [
                            "ones/bower_components/jquery/dist/jquery.js",
                            "ones/bower_components/angular/angular.js",
                            "ones/bower_components/angular-animate/angular-animate.js",
                            "ones/bower_components/angular-cookies/angular-cookies.js",
                            "ones/bower_components/angular-resource/angular-resource.js",
                            "ones/bower_components/angular-route/angular-route.js",
                            "ones/bower_components/angular-sanitize/angular-sanitize.js",
                            "ones/bower_components/angular-touch/angular-touch.js",
                            "ones/bower_components/todc-bootstrap/dist/js/bootstrap.js",
                            "ones/bower_components/angular-strap/dist/angular-strap.js",
                            "ones/bower_components/angular-strap/dist/angular-strap.tpl.js",
                            "ones/bower_components/chosen/chosen.jquery.min.js",
                            "ones/bower_components/angular-chosen-localytics/chosen.js",
                            "ones/bower_components/moment/moment.js",
                            "ones/bower_components/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar-tpls.js",
                            "ones/bower_components/showdown/src/showdown.js",
                            "ones/bower_components/angular-markdown-directive/markdown.js",
                            "ones/bower_components/angular-socket-io/socket.js",
                            "ones/bower_components/angular-base64-upload/src/angular-base64-upload.js",
                            "ones/bower_components/jsbarcode/JsBarcode.all.min.js",
                            "ones/bower_components/socket.io-client/socket.io.js",
                            "ones/bower_components/zeroclipboard/dist/ZeroClipboard.min.js",
                            "ones/bower_components/ng-clip/dest/ng-clip.min.js"
                        ]
                    }
                ]
            },
            dev: {
                files: [
                    {
                        dest: '.tmp/concat/assets/css/login.css',
                        src: [
                            "ones/styles/animate.css",
                            "ones/styles/base.css",
                            "ones/styles/login.css"
                        ]
                    },
                    {
                        dest: '.tmp/concat/assets/css/app.css',
                        src: [
                            "ones/styles/animate.css",
                            "ones/styles/base.css",
                            "ones/styles/main.css"
                        ]
                    },
                    {
                        dest: '.tmp/concat/assets/css/frame.css',
                        src: [
                            "ones/styles/animate.css",
                            "ones/styles/bill.css",
                            "ones/styles/base.css",
                            "ones/styles/frame.css"
                        ]
                    },
                    {
                        dest: '.tmp/concat/assets/js/login.js',
                        src: [
                            "ones/lib/debugger.js",
                            "ones/lib/vendor/sprintf.js",
                            "ones/lib/function.js",
                            "ones/common/config.js",
                            "ones/lib/caches.js",
                            "ones/lib/i18n.js",
                            "ones/lib/plugin.js",
                            "ones/common/service.js",
                            "ones/common/filter.js",
                            "ones/common/login.js",
                            "ones/apps/account/main.js",
                            "ones/apps/account/model.js"
                        ]
                    },
                    {
                        dest: '.tmp/concat/assets/js/app.js',
                        src: [
                            "ones/lib/debugger.js",
                            "ones/lib/vendor/sprintf.js",
                            "ones/lib/vendor/md5.js",
                            "ones/lib/require.js",
                            "ones/common/config.js",
                            "ones/lib/function.js",
                            "ones/lib/caches.js",
                            "ones/lib/plugin.js",
                            "ones/lib/i18n.js",
                            "ones/lib/common_view.js",
                            "ones/lib/frames.js",
                            "ones/common/directive.js",
                            "ones/common/service.js",
                            "ones/common/filter.js",
                            "ones/common/app.js",
                            "ones/apps/account/main.js",
                            "ones/apps/account/model.js"
                        ]
                    },
                    {
                        dest: '.tmp/concat/assets/js/frame_lib.js',
                        src: [
                            "ones/lib/debugger.js",
                            "ones/lib/vendor/sprintf.js",
                            "ones/lib/vendor/md5.js",
                            "ones/lib/vendor/accounting.min.js",
                            "ones/lib/vendor/money.min.js",
                            "ones/common/config.js",
                            "ones/lib/function.js",
                            "ones/lib/caches.js",
                            "ones/lib/i18n.js",
                            "ones/lib/plugin.js",
                            "ones/lib/require.js",
                            "ones/lib/common_view.js",
                            "ones/lib/form/form.js",
                            "ones/lib/form/form.fields.js",
                            "ones/lib/form/form.fields.tpl.js",
                            "ones/lib/bill.js",
                            "ones/lib/grid_view.js",
                            "ones/lib/detail_view/detail_view.js",
                            "ones/lib/detail_view/detail_view.widget.js",
                            "ones/common/directive.js",
                            "ones/common/service.js",
                            "ones/common/filter.js",
                            "ones/common/frame.js",
                            "ones/apps/dataModel/service.js"
                        ]
                    }
                ]
            }
        },

        uglify: {
            generated: {
                files: [
                    {
                        dest: 'dist/scripts/vendor.js',
                        src: [
                            '.tmp/concat/assets/js/vendor.js'
                        ]
                    },
                    {
                        dest: 'dist/scripts/login.js',
                        src: [
                            '.tmp/concat/assets/js/login.js'
                        ]
                    },
                    {
                        dest: 'dist/scripts/app.js',
                        src: [
                            '.tmp/concat/assets/js/app.js'
                        ]
                    },
                    {
                        dest: 'dist/scripts/frame_lib.js',
                        src: [
                            '.tmp/concat/assets/js/frame_lib.js'
                        ]
                    }
                ]
            }
        },

        cssmin: {
            generated: {
                files: [
                    {
                        dest: 'dist/styles/vendor.css',
                        src: [ '.tmp/concat/assets/css/vendor.css' ]
                    },
                    {
                        dest: 'dist/styles/app.css',
                        src: [ '.tmp/concat/assets/css/app.css' ]
                    },
                    {
                        dest: 'dist/styles/login.css',
                        src: [ '.tmp/concat/assets/css/login.css' ]
                    },
                    {
                        dest: 'dist/styles/frame.css',
                        src: [ '.tmp/concat/assets/css/frame.css' ]
                    }
                ]
            }
        },

        //imagemin: {
        //  dist: {
        //    files: [{
        //      expand: true,
        //      cwd: '<%= yeoman.app %>/images',
        //      src: '{,*/}*.{png,jpg,jpeg,gif}',
        //      dest: '<%= yeoman.dist %>/images'
        //    }]
        //  }
        //},

        //svgmin: {
        //    dist: {
        //        files: [{
        //            expand: true,
        //            cwd: '<%= yeoman.app %>/images',
        //            src: '{,*/}*.svg',
        //            dest: '<%= yeoman.dist %>/images'
        //        }]
        //    }
        //},

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: ['*.html', 'views/{,*/}*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        // Replace Google CDN references
        //cdnify: {
        //    dist: {
        //        html: ['<%= yeoman.dist %>/*.html']
        //    }
        //},

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt,md}',
                        '.htaccess',
                        '*.html',
                        'apps/{,**/}*.*',
                        'views/{,*/}*.html',
                        'images/{,*/}*.*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: ['images/*']
                }, {
                    expand: true,
                    cwd: 'ones/bower_components/bootstrap/dist',
                    src: 'fonts/*',
                    dest: '<%= yeoman.dist %>'
                },{
                    expand: true,
                    cwd: 'ones/bower_components/font-awesome',
                    src: 'fonts/*',
                    dest: '<%= yeoman.dist %>'
                },{
                    expand: true,
                    cwd: 'ones/bower_components/chosen',
                    src: 'chosen-sprite.png',
                    dest: '<%= yeoman.dist %>/styles'
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'copy:styles'
            ],
            test: [
                'copy:styles'
            ],
            dist: [
                'copy:styles'
                //'imagemin',
                //'svgmin'
            ]
        },

        // Test settings
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        }
    });


    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'wiredep',
            'concurrent:server',
            'autoprefixer:server',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'wiredep',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        //'concat',
        'ngAnnotate',
        'copy:dist',
        //'cdnify',
        'concat',
        'uglify',
        'cssmin',
        'filerev',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};
