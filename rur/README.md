# RUR
Minimal client-side router.

- named routes
- pretty urls
- simple, easy to use & **understand**, framework-agnostic
- dependency-free, ES5-compatible
- [readable source code](https://github.com/cztomsik/rur/blob/master/src/router.js)


## Install

    npm install rur --save


## Usage
    var Router = require('rur');
    var r = new Router();

    r.routes = [
      {name: 'home', path: ''},
      {name: 'users', path: 'users'},
      {name: 'show-user', path, 'users/:id'},
      {name: 'edit-user', path, 'users/:id/edit'}
    ];

    r.onChange = function(){
      if ( ! r.state){
        return r.go('home');
      }

      // current route as defined (including custom data)
      console.log(r.state.route);

      // path params (hash)
      console.log(r.state.params);
    };

    r.start();

To get URL

    r.getUrl('edit-user', {id: 1});

To go to another page

    r.go('edit-user', {id: 1});


## HTML5
Currently unsupported

  - IE9 does not support `pushState()` at all
  - IE10/Edge support is still buggy
  - not even Firefox & Webkit currently behave the same

It is probably going to appear in future with little or no change in current API but it will take some to implement correctly
