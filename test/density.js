/**
 * Graphology Density Unit Tests
 * ==============================
 */
var assert = require('chai').assert,
    Graph = require('graphology'),
    density = require('../density.js');

describe('density', function() {

  it('should throw if given wrong arguments.', function() {

    assert.throws(function() {
      density(null);
    }, /instance/);

    assert.throws(function() {
      density('test', 1);
    }, /number/);

    assert.throws(function() {
      density(45, 'test');
    }, /number/);
  });

  it('should properly compute the given graph\'s density.', function() {
    var mixedGraph = new Graph();
    mixedGraph.addNodesFrom([1, 2, 3]);
    mixedGraph.addEdge(1, 2);
    mixedGraph.addEdge(1, 3);

    var directedGraph = new Graph({type: 'directed'});
    directedGraph.addNodesFrom([1, 2, 3]);
    directedGraph.addEdge(1, 2);
    directedGraph.addEdge(1, 3);

    var undirectedGraph = new Graph({type: 'undirected'});
    undirectedGraph.addNodesFrom([1, 2, 3]);
    undirectedGraph.addEdge(1, 2);
    undirectedGraph.addEdge(1, 3);

    var multiGraph = new Graph({type: 'undirected', multi: true});
    multiGraph.addNodesFrom([1, 2, 3]);
    multiGraph.addEdge(1, 2);
    multiGraph.addEdge(1, 3);
    multiGraph.addEdge(1, 3);
    multiGraph.addEdge(1, 3);

    assert.strictEqual(density(mixedGraph), 2 / 9);
    assert.strictEqual(density(directedGraph), 2 / 6);
    assert.strictEqual(density(undirectedGraph), 2 / 3);
    assert.strictEqual(density(multiGraph), 4 / 3);
    assert.strictEqual(density.undirectedDensity(multiGraph), 2 / 3);

    assert.strictEqual(density.mixedDensity(mixedGraph.order, mixedGraph.size), 2 / 9);
    assert.strictEqual(density.directedDensity(directedGraph.order, directedGraph.size), 2 / 6);
    assert.strictEqual(density.undirectedDensity(undirectedGraph.order, directedGraph.size), 2 / 3);
    assert.strictEqual(density.multiUndirectedDensity(multiGraph.order, multiGraph.size), 4 / 3);
  });
});
