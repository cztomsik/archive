import assert from 'assert';
import Router from '..';

// count changes
let changes = 0;


const r = new Router();

r.routes = [
  {name: 'home', path: '/'},
  {name: 'users', path: '/users'},
  {name: 'show-user', path: '/users/:id'},
  {name: 'edit-user', path: '/users/:id/edit'}
];

r.onChange = () => {
  changes++;
};

r.start();


describe('router', () => {
  it('start()', () => {
    assert.strictEqual(changes, 1);
  });

  it('go()', () => {
    changes = 0;
    location.href = '';

    r.go('home');
    assert.strictEqual(location.href, '#/');
    assert.strictEqual(r.state.route, r.routes[0]);
    assert.strictEqual(changes, 2);

    r.go('users');
    assert.strictEqual(location.href, '#/users');
    assert.strictEqual(r.state.route, r.routes[1]);
    assert.strictEqual(changes, 3);

    r.go('show-user', {id: 1});
    assert.strictEqual(location.href, '#/users/1');
    assert.strictEqual(r.state.route, r.routes[2]);
    assert.strictEqual(changes, 4);

    try{
      r.go('show-user');
      assert.fail('missing params');
    }
    catch (e){}

    try{
      r.go('show-user', {extra: 'params'});
      assert.fail('extra params');
    }
    catch (e){}

    try{
      r.go('unknown');
      assert.fail('unknown state');
    }
    catch (e){}
  });

  it('getUrl(name, params)', () => {
    assert.strictEqual(r.getUrl('home'), '#/');

    assert.strictEqual(r.getUrl('users'), '#/users');
    assert.strictEqual(r.getUrl('show-user', {id: 1}), '#/users/1');
    assert.strictEqual(r.getUrl('edit-user', {id: 1}), '#/users/1/edit');
  });
});

describe('_match', () => {
  it('static', () => {
    assert.deepStrictEqual(r._match('/'), {
      route: r.routes[0],
      params: {}
    });

    assert.deepStrictEqual(r._match('/users'), {
      route: r.routes[1],
      params: {}
    });
  });

  it('dynamic', () => {
    assert.deepStrictEqual(r._match('/users/1'), {
      route: r.routes[2],
      params: {id: '1'}
    });

    assert.deepStrictEqual(r._match('/users/2'), {
      route: r.routes[2],
      params: {id: '2'}
    });

    assert.deepStrictEqual(r._match('/users/3/edit'), {
      route: r.routes[3],
      params: {id: '3'}
    });

    assert.deepStrictEqual(r._match('/users/123/edit'), {
      route: r.routes[3],
      params: {id: '123'}
    });
  });
});
