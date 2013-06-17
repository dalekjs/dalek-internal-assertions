module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['Gruntfile.js', 'test/*.js', 'index.js']
    },

    watch: {
      all: ['Gruntfile.js', 'test/*.js', 'index.js']
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', 'lint');
};
