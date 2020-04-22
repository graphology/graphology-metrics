/**
 * Graphology Eccentricity
 * ===================
 *
 * Functions used to compute the eccentricity of each node of a given graph.
 */
var isGraph = require('graphology-utils/is-graph');
var singleSourceLength = require('graphology-shortest-path/unweighted').singleSourceLength
var Graph = require('graphology');

module.exports = function eccentricity(graph, mynode) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/eccentricity: given graph is not a valid graphology instance.');

  var path = {}, ecc = -Infinity;

  graph.forEachNode(function(node, attr) {

    if (node == mynode){
      lg = singleSourceLength(graph, node);

      for (i = 1, l = graph.order; i <= l; i++) {
        if (lg[i] != null) {
          if (lg[i] > ecc) {
            ecc = lg[i]
          }
        }
        else {
          ecc = Infinity
        }
      }

    }
  });

  return ecc;
}

