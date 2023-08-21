const KEYS = /:(\w+)/g;

export default class Router{
  constructor(){
    this.routes = [];
    this.onChange = null;

    this.state = null;
  }

  go(routeName, params){
    location.href = this.getUrl(routeName, params);
  }

  getUrl(routeName, params = {}){
    const route = this._getRoute(routeName);
    const paramKeys = Object.keys(params);

    if (JSON.stringify(pathKeys(route.path)) !== JSON.stringify(paramKeys)){
      die('missing/extra params', route, params);
    }

    return '#' + route.path.replace(KEYS, (m, k) => params[k]);
  }

  start(){
    const listener = () => {
      this.state = this._match(location.hash.slice(1));
      this.onChange();
    };

    addEventListener('hashchange', listener);
    listener();
  }

  _getRoute(routeName){
    return this.routes.filter(r => r.name === routeName)[0] || die(routeName, 'not found');
  }

  _match(path){
    for (let i = 0; i < this.routes.length; i++){
      const route = this.routes[i];
      const match = path.match(pathRegExp(route.path));

      if (match){
        return {route, params: zipObject(pathKeys(route.path), match.slice(1))};
      }
    }

    return null;
  }
}

function pathKeys(path){
  return (path.match(KEYS) || []).map(k => k.slice(1));
}

function pathRegExp(path){
  return new RegExp('^' + path.replace(KEYS, '([^/]*?)') + '$');
}

function die(){
  throw new Error(Array.prototype.join.call(arguments, ' '));
}

function zipObject(keys, values){
  return keys.reduce((obj, k, i) => {
    obj[k] = values[i];
    return obj;
  }, {});
}
