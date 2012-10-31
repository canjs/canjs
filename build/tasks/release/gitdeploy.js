module.exports = function( grunt ) {
	grunt.registerMultiTask("gitdeploy", "Deploys files/folders to a Git repository", function() {
		var done = this.async();
		var options = grunt.config(['gitdeploy', this.target]);

		grunt.utils.spawn({
			cmd : 'git',
			args : ['clone', options.repository, '__deploy']
		}, function(error, result, code) {

		});

		exec('git', function () {
			exec('git', ['checkout', 'gh-pages'], function() {
				jake.cpR(path.join(rootPath + 'can/dist/edge/'), './canjs/release/');
				exec('git', ['add', '.', '--all'], function() {
					exec('git', ['commit', '-m', '"Updating edge"'], function() {
						exec('git', ['push', 'origin', 'gh-pages'], function () {
							exec('rm', [ '-rf', './canjs' ], function() {});
						}, { cwd : './canjs' });
					}, { cwd : './canjs' });
				}, { cwd : './canjs' });
				complete();
			}, { cwd : './canjs' });
		});
	});
};
