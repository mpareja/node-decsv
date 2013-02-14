module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-bump');

  grunt.initConfig({
    watch: {
      files: '<config:jslint.files>',
      tasks: 'jslint'
    },

    jslint: { // configure the task
      files: [ '*.js' ],
      exclude: [ 'node_modules/*' ],
      directives: {
        devel: true,
        node: true,
        vars: true,
        maxerr: 100,
        indent: 2,
        sloppy: true, // don't require use strict
        nomen: true, // don't give warnings for __dirname
        undef: true,
        plusplus: true,
        minusminus: true
      }
    }
  });

  grunt.registerTask('default', 'jslint');
};

