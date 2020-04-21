/**
 * Graphology Eccentricity
 * ===================
 *
 * Functions used to compute the eccentricity of each node of a given graph.
 */
var isGraph = require('graphology-utils/is-graph');
var singleSourceLength = require('graphology-shortest-path/unweighted');
var Graph = require('graphology');

module.exports = function eccentricity(graph, mynode) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/eccentricity: given graph is not a valid graphology instance.');

  var path = {}, ecc = 0;

  graph.forEachNode(function(node, attr) {

    if (node == 3){
      path = singleSourceLength(graph, node);

      for (i = 1, l = graph.order; i <= l; i++) {

        if (path[i]) {
          var lg = path[i].length - 1;

          if (lg > ecc) {
            ecc = lg
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

