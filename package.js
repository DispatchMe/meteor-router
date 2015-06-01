Package.describe({
  name: 'dispatch:router',
  summary: 'A lightweight wrapper around FlowRouter to emit events and track direction.',
  git: 'https://github.com/DispatchMe/meteor-router.git',
  version: '0.0.1'
});

Package.onUse(function (api) {
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
    'meteorhacks:flow-router@1.0.1',
    'raix:eventemitter'
  ], 'web');

  api.addFiles('router.js', 'web');

  api.export('Router', 'web');
});
