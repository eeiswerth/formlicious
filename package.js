Package.describe({
  name: 'eeiswerth:formlicious',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/eeiswerth/meteor-formlicious.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use(['templating']);
  api.addFiles([
      'formlicious.html',
      'formlicious.js',
      'lib/utils.js'], 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('eeiswerth:formlicious');
  api.addFiles('formlicious-tests.js');
});
