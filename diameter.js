/**
 * Graphology Diameter
 * ========================
 *
 * Functions used to compute the diameter of the given graph.
 */
var isGraph = require('graphology-utils/is-graph');
var eccentricity = require('/home/pauline/Documents/graphology-metrics/eccentricity.js');

module.exports = function diameter(graph) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/diameter: given graph is not a valid graphology instance.');

  if (graph.size === 0)
    return Infinity;

  var diameter = -Infinity, all_ecc = [];

  graph.forEachNode(function(node, attr) {
      all_ecc.push(eccentricity(graph, node));
  });

  diameter = Math.max(...all_ecc);

  return diameter;
};
