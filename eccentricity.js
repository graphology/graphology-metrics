/**
 * Graphology Eccentricity
 * ===================
 *
 * Functions used to compute the eccentricity of each node of a given graph.
 */
var isGraph = require('graphology-utils/is-graph');
var shortestPath = require('graphology-shortest-path');
var Graph = require('graphology');

module.exports = function eccentricity(graph) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/degree: given graph is not a valid graphology instance.');

    var nodes = new Array(graph.order),
    entries = new Array(graph.order),
    i = 0, j;

  var mymap = {}
  var nopath = false

  graph.forEachNode(function(node, attr) {
    nodes[i] = node;
    entries[i++] = attr;
  });

  for (i = 0, l = graph.order; i < l; i++) {
    var path = shortestPath(graph, nodes[i]);
    var tab = new Array();

    for (j = 1; j <= l; j++){
      if (path[j]) {
        var ecc = tab.push(path[j].length - 1)
      }
      else {
        nopath = true
      }
    }

    if (nopath) {
      mymap[nodes[i]] = -Infinity;
    }
    else {
      mymap[nodes[i]] = Math.max(...tab);
    }
  }

  return mymap;
}
