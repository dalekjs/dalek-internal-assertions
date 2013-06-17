module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({

    // linting
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['Gruntfile.js', 'index.js', 'test/*.js']
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
        src: ['Gruntfile.js', 'index.js', 'test/*.js'],
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
