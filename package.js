Package.describe({
  name: 'dispatch:router',
  summary: 'A lightweight wrapper around FlowRouter to emit events and track direction.',
  git: 'https://github.com/DispatchMe/meteor-router.git',
  version: '0.0.6'
});

Package.onUse(function (api) {
  api.versionsFrom('1.0');

  api.use([
    // core
    'check',
    'ejson',
    'jquery',
    'reactive-var',
    'templating',
    'tracker',
    'underscore',

    // atmosphere
    'meteorhacks:flow-router@1.15.0',
    'raix:eventemitter@0.1.2'
  ], 'web');

  api.imply('meteorhacks:flow-router@1.15.0', 'web');

  api.addFiles('router.js', 'web');

  api.export('Router', 'web');
});
