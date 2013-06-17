module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({

    // define a src set of files for other tasks
    src: {
      files: ['Gruntfile.js', 'index.js', 'test/*.js']
    },

    // linting
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: '<%= src.files %>'
    },

    // testing
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/*.js']
      }
    },

    // code metrics
    complexity: {
      generic: {
        src: '<%= src.files %>',
        options: {
          cyclomatic: 4,
          halstead: 20,
          maintainability: 90
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-complexity');

  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', ['lint', 'mochaTest', 'complexity']);
};
