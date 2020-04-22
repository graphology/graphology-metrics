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

  lg = singleSourceLength(graph, mynode);
  var l = Object.keys(lg).length

  for (var i = 1; i <= l; i++) {
    if (lg[i] > ecc) {
      ecc = lg[i];
    };
  };

  if (l < graph.order){
    ecc = Infinity ;
  };

  return ecc;
}
