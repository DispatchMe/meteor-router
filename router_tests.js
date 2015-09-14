describe('Router', function () {
  beforeEach(function () {
    // Reset routes map
    FlowRouter._routes = [];

    Router.go('/');
  });

  it('maps routes using Router.map', function () {
    Router.map({
      '/route_1': function () {},
      '/route_2': function () {}
    });

    var routes = FlowRouter._routes;

    expect(routes.length).toEqual(2);

    expect(routes[0].path).toEqual('/route_1');
    expect(routes[1].path).toEqual('/route_2');
  });

  it('performs route action with Router.go', function (done) {
    Router.map({
      '/route': function () {
        expect(window.location.pathname).toEqual('/route');
        done();
      }
    });

    Router.go('/route');
  });

  it('removes route from history with Router.go and replaceState flag', function (done) {
    Router.map({
      '/': function () {
        done();
      },
      '/route_1': function () {
        Router.go('/route_2', true);
      },
      '/route_2': function () {
        Router.goBack();
      }
    });

    Router.go('/route_1');
  });

  it('does not perform route action with Router.go and skipAction flag', function (done) {
    Router.map({
      '/route': function () {
        fail();
      }
    });

    Router.go('/route', false, true);

    Meteor.setTimeout(done, 100);
  });

  it('returns to previous route with Router.goBack', function (done) {
    Router.map({
      '/': function () {
        done();
      },
      '/route': function () {
        Router.goBack();
      }
    });

    Router.go('/route');
  });
});
