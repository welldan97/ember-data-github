import {
  module,
  test
} from 'qunit';
import startApp from 'dummy/tests/helpers/start-app';
import Ember from 'ember';

var server, app, container, store;

module('github-repository', {
  setup: function() {
    server = new Pretender();
    server.prepareBody = function(body){ return JSON.stringify(body); };
    app = startApp();
    container = app.__container__;
    store = container.lookup("store:main");
  },
  teardown: function() {
    Ember.run(app, 'destroy');
    server.shutdown();
  }
});

test('finding a repository without authorization', function(assert) {
  server.get('/repos/User1/Repository1', function(request) {
    return [200, {}, Factory.build('repository')];
  });

  return Ember.run(function () {
    return store.find('githubRepository', 'User1/Repository1').then(function(repository) {
      assertGithubRepositoryOk(assert, repository);
      assert.equal(store.all('githubRepository').get('length'), 1);
      assert.equal(server.handledRequests.length, 1);
      assert.equal(server.handledRequests[0].requestHeaders.Authorization, undefined);
    });
  });
});

test('finding a repository', function(assert) {
  container.lookup('service:session').set('githubAccessToken', 'abc123');
  server.get('/repos/user1/repository1', function(request) {
    return [200, {}, Factory.build('repository')];
  });

  return Ember.run(function () {
    return store.find('githubRepository', 'user1/repository1').then(function(repository) {
      assertGithubRepositoryOk(assert, repository);
      assert.equal(store.all('githubRepository').get('length'), 1);
      assert.equal(server.handledRequests.length, 1);
      assert.equal(server.handledRequests[0].requestHeaders.Authorization, 'token abc123');
    });
  });
});

test('finding all repositories', function(assert) {
  container.lookup('service:session').set('githubAccessToken', 'abc123');
  server.get('/repositories', function(request) {
    var response = [
      Factory.build('repository'),
      Factory.build('repository')
    ];
    return [200, {}, response];
  });

  return Ember.run(function () {
    return store.find('githubRepository').then(function(repositories) {
      assert.equal(repositories.get('length'), 2);
      assertGithubRepositoryOk(assert, repositories.toArray()[0]);
      assert.equal(server.handledRequests.length, 1);
      assert.equal(server.handledRequests[0].requestHeaders.Authorization, 'token abc123');
    });
  });
});

test('getting a repository\'s owner', function(assert) {
  container.lookup('service:session').set('githubAccessToken', 'abc123');
  server.get('/repos/user1/repository1', function(request) {
    return [200, {}, Factory.build('repository')];
  });
  server.get('/users/user1', function(request) {
    return [200, {}, Factory.build('user')];
  });

  return Ember.run(function () {
    return store.find('githubRepository', 'user1/repository1').then(function(repository) {
      return repository.get('owner').then(function(owner) {
        assertGithubUserOk(assert, owner);
        assert.equal(server.handledRequests.length, 2);
        assert.equal(server.handledRequests[0].requestHeaders.Authorization, 'token abc123');
      });
    });
  });
});

test('getting a repository\'s default branch', function(assert) {
  container.lookup('service:session').set('githubAccessToken', 'abc123');
  server.get('/repos/user1/repository1', function(request) {
    return [200, {}, Factory.build('repository')];
  });
  server.get('/repos/user1/repository1/branches/branch1', function(request) {
    return [200, {}, Factory.build('branch')];
  });

  return Ember.run(function () {
    return store.find('githubRepository', 'user1/repository1').then(function(repository) {
      return repository.get('defaultBranch').then(function(branch) {
        assertGithubBranchOk(assert, branch);
        assert.equal(server.handledRequests.length, 2);
        assert.equal(server.handledRequests[0].requestHeaders.Authorization, 'token abc123');
      });
    });
  });
});

test('finding a repository\'s branches', function(assert) {
  container.lookup('service:session').set('githubAccessToken', 'abc123');
  server.get('/repos/user1/repository1', function(request) {
    return [200, {}, Factory.build('repository')];
  });
  server.get('/repos/user1/repository1/branches', function(request) {
    var response = [
      Factory.build('branch'),
      Factory.build('branch')
    ];
    return [200, {}, response];
  });

  return Ember.run(function () {
    return store.find('githubRepository', 'user1/repository1').then(function(repository) {
      return repository.get('branches').then(function(branches) {
        assert.equal(branches.get('length'), 2);
        assertGithubBranchOk(assert, branches.toArray()[0]);
        assert.equal(server.handledRequests.length, 2);
        assert.equal(server.handledRequests[1].requestHeaders.Authorization, 'token abc123');
      });
    });
  });
});
