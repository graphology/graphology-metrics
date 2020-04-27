/**
 * Graphology Diameter
 * ========================
 *
 * Functions used to compute the diameter of the given graph.
 */
var isGraph = require('graphology-utils/is-graph');
var eccentricity = require('./eccentricity.js');
var Graph = require('graphology');

module.exports = function diameter(graph) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/diameter: given graph is not a valid graphology instance.');

  if (graph.size === 0)
    return Infinity;

  var diameter = -Infinity, ecc = 0;
  var node;

  for (node of graph.nodes()) {
    ecc = eccentricity(graph, node);
    if (ecc > diameter)
      diameter = ecc;
    if (diameter === Infinity)
      break;
  }

  return diameter;
};
