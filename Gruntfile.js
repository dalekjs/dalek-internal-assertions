module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({

    // load module meta data
    pkg: grunt.file.readJSON('package.json'),

    // define a src set of files for other tasks
    src: {
      lint: ['Gruntfile.js', 'index.js', 'test/*.js'],
      complexity: ['index.js', 'test/*.js'],
      test: ['test/*.js'],
      src: ['index.js']
    },

    // clean coverage helper file
    clean: ['coverage', 'report'],

    // linting
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: '<%= src.lint %>'
    },

    // testing
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: 'coverage/blanket'
        },
        src: '<%= src.test %>'
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          quiet: true
        },
        src: '<%= src.test %>',
        dest: 'report/coverage/index.html'
      }
    },

    // code metrics
    complexity: {
      generic: {
        src: '<%= src.complexity %>',
        options: {
          cyclomatic: 4,
          halstead: 20,
          maintainability: 100
        }
      }
    },
    plato: {
      generic: {
        options : {
          jshint : grunt.file.readJSON('.jshintrc')
        },
        files: {
          'report/complexity': '<%= src.complexity %>',
        }
      }
    },

    // api docs
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: '.',
          outdir: 'report/api'
        }
      }
    }

  });

  // prepare files & folders for grunt:plato & coverage
  grunt.registerTask('prepare', function () {
    var fs = require('fs');

    // generate dirs for docs & reports
    ['coverage', 'report', 'report/coverage',
    'report/complexity', 'report/complexity/files',
    'report/complexity/files/index_js', 'report/complexity/files/test_index_TEST_js'].forEach(function (path) {
      fs.mkdirSync(__dirname + '/' + path);
    });

    // store some dummy reports, so that grunt plato doesnt complain
    fs.writeFileSync(__dirname + '/report/complexity/report.history.json', '{}');
    fs.writeFileSync(__dirname + '/report/complexity/files/test_index_TEST_js/report.history.json', '{}');
    fs.writeFileSync(__dirname + '/report/complexity/files/index_js/report.history.json', '{}');

    // generate code coverage helper file
    var coverageHelper = 'require("blanket")({pattern: require("fs").realpathSync(__dirname + "/../index.js")});';
    fs.writeFileSync(__dirname + '/coverage/blanket.js', coverageHelper);
  });

  // load 3rd party tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-complexity');
  grunt.loadNpmTasks('grunt-plato');

  // define runner tasks
  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', ['clean', 'prepare', 'lint', 'mochaTest', 'complexity']);
  grunt.registerTask('docs', ['clean', 'prepare', 'mochaTest', 'plato', 'yuidoc']);
};
