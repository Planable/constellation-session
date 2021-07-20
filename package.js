Package.describe({
  name: "planable:session",
  version: "0.4.12",
  summary: "Session variable editor plugin for Constellation",
  git: "https://github.com/Planable/constellation-session.git",
  documentation: "README.md",
  debugOnly: true,
});

Package.onUse(function (api) {
  api.versionsFrom("2.3");

  api.use(
    [
      "templating@1.4.1",
      "session",
      "blaze@2.5.0",
      "underscore",
      "ejson",
      "tracker",
      "reactive-var",
      "reactive-dict",
    ],
    "client"
  );
  api.use("planable:console@1.4.11", "client");
  api.use("planable:editable-json@0.6.6", "client");

  api.addFiles("session.css", "client");
  api.addFiles("session.html", "client");
  api.addFiles("session.js", "client");

  api.imply("planable:console");
});

Package.onTest(function(api) {
  api.use('tinytest');
});
