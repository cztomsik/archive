/**
 * Fake window.location + addEventListener
 */

let _listener = null;
global.addEventListener = (event, listener) => {
  _listener = listener;
};

// fake location
global.location = {
  _href: '',
  hash: '',

  get href(){
    return this._href;
  },

  set href(href){
    this._href = href;
    this.hash = href.replace(/#.*/, '$&');
    _listener();
  }
};
