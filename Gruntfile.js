/**
 * Created by jonas on 2015-12-12.
 */


var path = require('path');

module.exports = function(grunt) {

	// Load Grunt tasks declared in the package.json file
	//require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// Project configuration.
	grunt.initConfig({


		// grunt-express will serve the files from the folders listed in `bases`
		// on specified `port` and `hostname`
		develop: {
			server: {
				file: './server/serverRTC.js'
			}
		},
		watch: {
			scripts: {
				files: [
					'client/src/**/*'
				],
				tasks: ['jshint','concat']
			}
		},
		jshint: {
			options: {
				evil: true
			},
			all: ['client/src/js/**/*.js', 'server/**/*.js', 'client/src/examples/**/*.js']
		},
		concat: {
			basic_and_extras: {
				files: {
					'client/dist/serverRTC.js': ['client/src/js/serverRTC/ServerRTC.js', 'client/src/js/serverRTC/*.js'],
					'client/dist/client.js': ['client/src/js/client/serverRTC_Client.js', 'client/src/js/client/*.js'],

					'client/dist/examples/space/exampleClient.js': [
						'client/src/examples/space/client/exampleClient.js',
						'client/src/examples/space/shared/*.js',
						'client/src/examples/space/client/*.js'
					],
					'client/dist/examples/space/exampleClient.html': ['client/src/examples/space/client/exampleClient.html'],
					'client/dist/examples/space/exampleServer.js': ['client/src/examples/space/server/*.js', 'client/src/examples/space/shared/*.js'],
					'client/dist/examples/space/exampleServer.html': ['client/src/examples/space/server/exampleServer.html']
				}
			}
		}

	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-develop');

	grunt.registerTask('server', [
		'develop:server',
		'watch'
	]);
	grunt.registerTask('build', ['jshint', 'concat']);
	grunt.registerTask('default', ['build','server']);
	grunt.registerTask('heroku:development', 'build');

};
