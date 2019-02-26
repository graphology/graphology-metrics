/**
 * Graphology Density Unit Tests
 * ==============================
 */
var assert = require('chai').assert,
    Graph = require('graphology'),
    degree = require('../degree.js'),
    data = require('./datasets/rio.json');
    // bundledData = require('./datasets/rio-bundle.json');

var inDegree = degree.inDegree;
var outDegree = degree.outDegree;
// var undirectedDegree = degree.undirectedDegree;
// var directedDegree = degree.directedDegree;
var allDegree = degree.allDegree;

var rioGraph = new Graph({
  type: 'directed'
});

for (var i = 0; i < data.nodes.length; i = i + 1) {
  var node = data.nodes[i];
  if (data.nodes[i].key) {
    rioGraph.addNode(node.key, node.attributes);
  }
}

for (var j = 0; j < data.edges.length; j = j + 1) {
  if (
    rioGraph.hasEdge(
      data.edges[j].source,
      data.edges[j].target
    )
  ) {
    continue;
  }
  rioGraph.addDirectedEdge(
    data.edges[j].source,
    data.edges[j].target
  );
}

describe('degree', function() {
  it('should throw if given wrong arguments.', function() {
    assert.throws(function() {
      degree(null);
    }, /instance/);
    assert.throws(function () {
      inDegree(new Graph({type: 'undirected'}));
    }, /undirected/);
  });
  it('should extract a map of nodes to degree.', function() {
    var directedGraph = new Graph({type: 'directed'});

    directedGraph.addNode(1);
    directedGraph.addNode(2);
    directedGraph.addNode(3);

    directedGraph.addDirectedEdge(1, 2);
    directedGraph.addDirectedEdge(2, 3);
    directedGraph.addDirectedEdge(3, 2);
    directedGraph.addDirectedEdge(3, 1);

    var degrees = degree(directedGraph);
    assert.deepEqual(degrees, {1: 2, 2: 3, 3: 3});

    var inDegrees = inDegree(directedGraph);
    assert.deepEqual(inDegrees, {1: 1, 2: 2, 3: 1});

    var outDegrees = outDegree(directedGraph);
    assert.deepEqual(outDegrees, {1: 1, 2: 1, 3: 2});

    var allDegrees = allDegree(directedGraph);
    assert.deepEqual(
      allDegrees,
      {
        1: {
          in: 1,
          out: 1
        },
        2: {
          in: 2,
          out: 1
        },
        3: {
          in: 1,
          out: 2
        }
      }
    );

  });
});
