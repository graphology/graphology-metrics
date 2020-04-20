/**
 * Graphology Eccentricity
 * ===================
 *
 * Functions used to compute the eccentricity of each node of a given graph.
 */
var isGraph = require('graphology-utils/is-graph');
var shortestPath = require('graphology-shortest-path');
var Graph = require('graphology');

module.exports = function eccentricity(graph, mynode) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/degree: given graph is not a valid graphology instance.');

    var nodes = new Array(graph.order),
    entries = new Array(graph.order),
    i = 0, j, ecc = 0;

  graph.forEachNode(function(node, attr) {
    nodes[i] = node;
    entries[i++] = attr;
  });

  for (i = 0, l = graph.order; i < l; i++) {
    if (nodes[i] == mynode) {
      var path = shortestPath(graph, nodes[i])
      var lg = path[i+1].length - 1;

      if (lg > ecc) {
        ecc = lg
      }
    }
  }

  var ecc = 0

  for (j = 1; j <= l; j++) {
    if (path[j]) {
      if (path[j].length - 1 > ecc)
        ecc = path[j].length - 1;
    }
    else
      ecc = Infinity;
  }

  return ecc;
}
