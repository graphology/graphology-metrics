
var assert = require('chai').assert,
  Graph = require('graphology'),
  rio = require('./datasets/rio.json'),
  rioBundle = require('./datasets/rio-bundle.json'),
  modalities = require('../modality.js');

describe('Modalities', function () {
  it('should throw if given wrong arguments', function () {
    assert.throws(function() {
      modalities({}, []);
    }, /instance/);
    assert.throws(function() {
      modalities(new Graph());
    }, /no attributes/);
    assert.throws(function() {
      modalities(new Graph(), '');
    }, /no attributes/);
    assert.throws(function() {
      modalities(new Graph(), []);
    }, /no attributes/);
    assert.throws(function() {
      modalities(new Graph(), ['nonExistingAttribute']);
    }, /any node attributes./);
  });
  it('should work on a bigger graph', function () {
    var rioGraph = new Graph({
      type: 'directed'
    });

    for (var i = 0; i < rio.nodes.length; i = i + 1) {
      var node = rio.nodes[i];
      if (rio.nodes[i].key) {
        rioGraph.addNode(node.key, node.attributes);
      }
    }

    for (var j = 0; j < rio.edges.length; j = j + 1) {
      if (
        rioGraph.hasEdge(
          rio.edges[j].source,
          rio.edges[j].target
        )
      ) {
        continue;
      }
      rioGraph.addDirectedEdge(
        rio.edges[j].source,
        rio.edges[j].target
      );
    }
    var res = modalities(rioGraph, 'Category');
    console.log(res);

    assert.equal(
      res.Category['Green-economy'].nodes,
      rioBundle.nodeAttributes[4].data.modalitiesIndex['Green-economy'].nodes
    );
    assert.equal(
      res.Category['Green-economy'].internalEdges,
      rioBundle.nodeAttributes[4].data.modalitiesIndex['Green-economy'].internalEdges
    );
    assert.equal(
      res.Category['Green-economy'].externalEdges,
      rioBundle.nodeAttributes[4].data.modalitiesIndex['Green-economy'].externalEdges
    );
    assert.equal(
      res.Category['Green-economy'].inboundEdges,
      rioBundle.nodeAttributes[4].data.modalitiesIndex['Green-economy'].inboundEdges
    );
    assert.equal(
      res.Category['Green-economy'].outboundEdges,
      rioBundle.nodeAttributes[4].data.modalitiesIndex['Green-economy'].outboundEdges
    );
  });
  it('should calculate internal edges of a directed graph', function () {
    var graph = new Graph({
      type: 'directed'
    });

    graph.addNode('1', {
      foo: 'bar',
      cava: 'ui'
    });
    graph.addNode('2', {
      foo: 'boo',
      cava: 'ui'
    });
    graph.addNode('3', {
      foo: 'bar',
      cava: 'non'
    });

    graph.addDirectedEdge(1, 2); // bar -> boo
    graph.addDirectedEdge(2, 3); // boo -> bar
    graph.addDirectedEdge(3, 2); // bar -> boo
    graph.addDirectedEdge(3, 1); // bar -> bar

    var mapModalities = modalities(graph, ['foo']);
    assert.deepEqual(
      mapModalities,
      {
        foo: {
          bar: {
            nodes: 2,
            internalEdges: 1,
            internalDensity: 0.5,
            externalEdges: 3,
            externalDensity: 0,
            inboundEdges: 1,
            inboundDensity: 0,
            outboundEdges: 2,
            outboundDensity: 0
          },
          boo: {
            nodes: 1,
            internalEdges: 0,
            internalDensity: 0,
            externalEdges: 3,
            externalDensity: 0,
            inboundEdges: 2,
            inboundDensity: 0,
            outboundEdges: 1,
            outboundDensity: 0
          }
        }
      }
    );
  });
  it('should calculate modalities on an undirected graph', function () {
    var graph = new Graph({
      type: 'undirected',
      multi: true
    });

    graph.addNode('1', {
      foo: 'bar',
      cava: 'ui'
    });
    graph.addNode('2', {
      foo: 'boo',
      cava: 'ui'
    });
    graph.addNode('3', {
      foo: 'bar',
      cava: 'non'
    });

    graph.addUndirectedEdge(1, 2);
    graph.addUndirectedEdge(2, 3);
    graph.addUndirectedEdge(3, 2);
    graph.addUndirectedEdge(3, 1);

    var mapModalities = modalities(graph, ['foo']);

    assert.deepEqual(
      mapModalities,
      {
        foo: {
          bar: {
            nodes: 2,
            internalEdges: 1,
            internalDensity: 1,
            externalEdges: 3,
            externalDensity: 0
          },
          boo: {
            nodes: 1,
            internalEdges: 0,
            internalDensity: 0,
            externalEdges: 3,
            externalDensity: 0
          }
        }
      }
    );
  });
});
