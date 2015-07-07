Package.describe({
  name: 'babrahams:constellation-session',
  version: '0.1.0',
  summary: 'Session variable editor plugin for Constellation',
  git: 'https://github.com/JackAdams/constellation-session.git',
  documentation: 'README.md',
  debugOnly: true
});

Package.onUse(function(api) {
  api.versionsFrom('1.1');

  api.use(['templating','session','blaze','underscore','ejson','tracker','reactive-var','reactive-dict'], 'client');
  api.use('babrahams:constellation@1.0.0', 'client');
  api.use('babrahams:editable-json@0.5.0', 'client');

  api.addFiles('session.css','client');
  api.addFiles('session.html','client');
  api.addFiles('session.js','client');
});

Package.onTest(function(api) {
  api.use('tinytest');
});