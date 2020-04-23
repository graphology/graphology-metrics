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

  var ecc = -Infinity, lg = {};

  lg = singleSourceLength(graph, mynode);
  var key = Object.keys(lg)
  var l = key.length

  for (key in lg) {
    if (lg[key] > ecc) {
      ecc = lg[key];
    };
  }

  if (l < graph.order){
    ecc = Infinity ;
  }

  return ecc;
}
