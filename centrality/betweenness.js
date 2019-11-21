/**
 * Graphology Betweenness Centrality
 * ==================================
 *
 * Function computing betweenness centrality.
 */
var isGraph = require('graphology-utils/is-graph'),
    unweightedShortestPath = require('graphology-shortest-path/unweighted'),
    dijkstraShotestPath = require('graphology-shortest-path/dijkstra'),
    defaults = require('lodash/defaults');

/**
 * Defaults.
 */
var DEFAULTS = {
  attributes: {
    centrality: 'betweennessCentrality',
    weight: 'weight'
  },
  normalized: true,
  weighted: false
};

/**
 * Abstract function computing beetweenness centrality for the given graph.
 *
 * @param  {boolean} assign           - Assign the results to node attributes?
 * @param  {Graph}   graph            - Target graph.
 * @param  {object}  [options]        - Options:
 * @param  {object}    [attributes]   - Attribute names:
 * @param  {string}      [weight]     - Name of the weight attribute.
 * @param  {string}      [centrality] - Name of the attribute to assign.
 * @param  {boolean} [normalized]     - Should the centrality be normalized?
 * @param  {boolean} [weighted]       - Weighted graph?
 * @param  {object}
 */
function abstractBetweennessCentrality(assign, graph, options) {
  if (!isGraph(graph))
    throw new Error('graphology-centrality/beetweenness-centrality: the given graph is not a valid graphology instance.');

  var centralities = {};

  // Solving options
  options = defaults({}, options, DEFAULTS);

  var weightAttribute = options.attributes.weight,
      centralityAttribute = options.attributes.centrality,
      normalized = options.normalized,
      weighted = options.weighted;

  var shortestPath = weighted ?
    dijkstraShotestPath.brandes :
    unweightedShortestPath.brandes;

  var nodes = graph.nodes(),
      node,
      result,
      S,
      P,
      sigma,
      delta,
      coefficient,
      i,
      j,
      l,
      m,
      v,
      w;

  // Initializing centralities
  for (i = 0, l = nodes.length; i < l; i++)
    centralities[nodes[i]] = 0;

  // Iterating over each node
  for (i = 0, l = nodes.length; i < l; i++) {
    node = nodes[i];

    result = shortestPath(graph, node, weightAttribute);

    S = result[0];
    P = result[1];
    sigma = result[2];

    delta = {};

    // Accumulating
    for (j = 0, m = S.length; j < m; j++)
      delta[S[j]] = 0;

    while (S.length) {
      w = S.pop();
      coefficient = (1 + delta[w]) / sigma[w];

      for (j = 0, m = P[w].length; j < m; j++) {
        v = P[w][j];
        delta[v] += sigma[v] * coefficient;
      }

      if (w !== node)
        centralities[w] += delta[w];
    }
  }

  // Rescaling
  var n = graph.order,
      scale = null;

  if (normalized)
    scale = n <= 2 ? null : (1 / ((n - 1) * (n - 2)));
  else
    scale = graph.type === 'undirected' ? 0.5 : null;

  if (scale !== null) {
    for (node in centralities)
      centralities[node] *= scale;
  }

  if (assign) {
    for (node in centralities)
      graph.setNodeAttribute(node, centralityAttribute, centralities[node]);
  }

  return centralities;
}

/**
 * Exporting.
 */
var betweennessCentrality = abstractBetweennessCentrality.bind(null, false);
betweennessCentrality.assign = abstractBetweennessCentrality.bind(null, true);

module.exports = betweennessCentrality;
