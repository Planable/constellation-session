Package.describe({
  name: 'constellation:session',
  version: '0.3.1',
  summary: 'Session variable editor plugin for Constellation',
  git: 'https://github.com/JackAdams/constellation-session.git',
  documentation: 'README.md',
  debugOnly: true
});

Package.onUse(function(api) {
  api.versionsFrom('1.1');

  api.use(['templating','session','blaze','underscore','ejson','tracker','reactive-var','reactive-dict'], 'client');
  api.use('constellation:console@1.2.0', 'client');
  api.use('babrahams:editable-json@0.5.7', 'client');

  api.addFiles('session.css','client');
  api.addFiles('session.html','client');
  api.addFiles('session.js','client');
  
  api.imply('constellation:console');
});

Package.onTest(function(api) {
  api.use('tinytest');
});
