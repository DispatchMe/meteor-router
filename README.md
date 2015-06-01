Router
======

##Usage

`meteor add dispatch:router`

```
Router.map({
  '/login': function () {
    // Use dispatch:viewport to display the login page
  }
});

Router.on('change', function (route) {
  analytics.page(route.substring(1));
});
```
