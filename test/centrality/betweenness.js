/**
 * Graphology Betweenness Centrality Unit Tests
 * =============================================
 */
var assert = require('chai').assert,
    Graph = require('graphology'),
    generators = require('graphology-generators'),
    betweenness = require('../../centrality/betweenness');

var UndirectedGraph = Graph.UndirectedGraph;

var complete = generators.classic.complete.bind(null, UndirectedGraph),
    path = generators.classic.path.bind(null, UndirectedGraph);

describe('betweenness centrality', function() {
  it('should throw if passed an invalid graph.', function() {
    assert.throws(function() {
      betweenness(null);
    }, /graphology/);
  });

  it('K5', function() {
    var graph = complete(5);

    var centralities = betweenness(graph, {normalized: false});

    assert.deepEqual(centralities, {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0
    });
  });

  it('P3', function() {
    var graph = path(3);

    var centralities = betweenness(graph, {normalized: false});

    assert.deepEqual(centralities, {
      0: 0,
      1: 1,
      2: 0
    });
  });

  it('P3 normalized', function() {
    var graph = path(3);

    var centralities = betweenness(graph, {normalized: true});

    assert.deepEqual(centralities, {
      0: 0,
      1: 1,
      2: 0
    });
  });
});