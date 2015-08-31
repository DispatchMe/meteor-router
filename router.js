Router = {};

// XXX make FlowRouter interchangeable with other routers, like IronRouter.

Router._emitter = new EventEmitter();

Router.on = Router._emitter.on.bind(Router._emitter);
Router.once = Router._emitter.once.bind(Router._emitter);

var currentRouteVar = new ReactiveVar();
var previousRouteVar = new ReactiveVar();

var getParams = function (str) {
   var queryString = str || window.location.search || '';
   var keyValPairs = [];

   var params = {};

   // There are no parameters on the route.
   if (queryString.indexOf('?') === -1) return params;

   queryString = queryString.substring(queryString.indexOf('?') + 1);

   if (queryString.length) {
      keyValPairs = queryString.split('&');

      for (pairNum in keyValPairs) {
        var key = keyValPairs[pairNum].split('=')[0];
        if (!key.length) continue;
        if (typeof params[key] === 'undefined')

        params[key] = keyValPairs[pairNum].split('=')[1];
      }
   }

   return params;
};

/**
 * The previous route path def.
 * @deprecated You cannot rely on this consistently.
 */
Router.getPrevious = function () {
  return previousRouteVar.get();
};

/**
 * The current route path def.
 */
Router.current = function () {
  return currentRouteVar.get();
};

/**
 * Is the current route is one of the path definitions (reactive).
 * @param {String||Array.<String>} pathDefs
 * @returns {Boolean}
 */
Router.is = function (pathDefs) {
  var current = Router.current();

  if (!_.isArray(pathDefs)) pathDefs = [pathDefs];
  return !!(current && pathDefs.indexOf(current) >= 0);
};

/**
 * Get the page index from the query parameters.
 * @param [params] Defaults to the current params.
 * @returns {Number}
 */
Router._getIndex = function (params) {
  if (params === false) return -1;

  params = params || FlowRouter.current().params;
  var index = (params && params.query || {}).i || 0;
  return parseInt(index);
};

/**
 * Go to the next route and track the page index.
 * The index is used by the transitions to determine if the next page
 * is before or after the current one. The index is also used to exit the
 * cordova app when there are no previous pages.
 * We store the page index in the query parameters because that
 * is the only way we can support the browser's back button.
 */
Router.go = function (path, replaceState) {
  if (!Router._enabled || window.location.pathname === path) return;

  var params = getParams(path);

  // Remove query string parameters
  if (path.indexOf('?') > -1) path = path.substring(0, path.indexOf('?'));

  // Update the page index so we can track which direction we are going
  var index = Router._getIndex();
  if (replaceState) {
    if (index < 1) index = 1;
    path = FlowRouter.path(path, null, _.extend(params, {i: index}));
    FlowRouter.redirect(path);
  } else {
    // Increment the page index
    FlowRouter.go(path, null, _.extend(params, {i: index + 1}));
  }
};

Router._enabled = true;

Router.disable = function () {
  Router._enabled = false;
};

Router.enable = function () {
  Router._enabled = true;
};

var forceBack = false;

/**
 * Replace the current route and animate backwards.
 * @param [path] Defaults to going to the previous route in history.
 */
Router.goBack = function (path) {
  if (!Router._enabled) return;

  history.back();

  if (!path) return;

  // Allow the history.back() to register in the browser then replace the state with the new route.
  // Since route actions are debounced only the new route will be triggered.
  Meteor.setTimeout(function () {
    forceBack = true;
    Router.go(path, true);
  }, 10);
};

// The previous route index.
var previousIndex = 0;

// Debounce route actions so that we can manipulate the history with
// Route.goBack without triggering a route action on the wrong route.
var debouncedRouteAction = _.debounce(function (route, action, params) {
  previousRouteVar.set(currentRouteVar.get());
  currentRouteVar.set(route);

  var index = Router._getIndex(params);
  var goBack = forceBack || previousIndex > index;

  // Omit the index from the parameters
  // that is something we track privately.
  params = _.omit(params, 'i');

  // Call the route action
  if (action) action(params, goBack);

  Router._emitter.emit('change', route, params, goBack);

  // Reset force back
  forceBack = false;

  // Store the previous route index.
  previousIndex = index;
}, 30);

/**
 * Map routes to actions
 * @param routeActions
 *
 * Ex:
 * Router.map({
 *   '/login': function (params) {
 *      // show login ui
 *   }
 * });
 */
Router.map = function (routeActions) {
  _.each(routeActions, function (action, route) {
    FlowRouter.route(route, {
      action: function (params) {
        debouncedRouteAction(route, action, params);
      }
    });
  });
};
