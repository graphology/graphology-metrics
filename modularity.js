/**
 * Graphology Modularity
 * ======================
 *
 * Implementation of modularity for graphology.
 *
 * Self-loops are not considered at all, not in the total weights, not in the
 * computing part (remove them and it will be the same modularity score).
 */
var defaults = require('lodash/defaultsDeep'),
    isGraph = require('graphology-utils/is-graph'),
    inferType = require('graphology-utils/infer-type');

var DEFAULTS = {
  attributes: {
    community: 'community',
    weight: 'weight'
  },
  weighted: true
};

/*
We should go towards: D = 1/(4*m) * Sum[Aij - ki*kj/(2*m)]
where m = sum of weight
      Aij = weight between i & j
      ki = weighted outdegree of i
      kj = weighted indegree of j
*/

/**
 * Function returning the modularity of the given graph.
 *
 * @param  {Graph}  graph         - Target graph.
 * @param  {object} options       - Options:
 * @param  {object}   communities - Communities mapping.
 * @param  {object}   attributes  - Attribute names:
 * @param  {string}     community - Name of the community attribute.
 * @param  {string}     weight    - Name of the weight attribute.
 * @param  {boolean}  weighted    - Whether to compute weighted modularity.
 * @return {number}
 */
function modularity(graph, options) {

  // Handling errors
  if (!isGraph(graph))
    throw new Error('graphology-metrics/modularity: the given graph is not a valid graphology instance.');

  if (graph.multi)
    throw new Error('graphology-metrics/modularity: multi graphs are not handled.');

  if (!graph.size)
    throw new Error('graphology-metrics/modularity: the given graph has no edges.');

  var type = inferType(graph);

  if (type === 'mixed')
    throw new Error('graphology-metrics/modularity: cannot compute the modularity of a true mixed graph.');

  // Solving options
  options = defaults({}, options, DEFAULTS);

  var communities,
      community,
      internalWeight = {},
      totalWeight = {},
      n;

  // Do we have a community mapping?
  if (typeof options.communities === 'object') {
    communities = options.communities;

    for (n in communities) {
      community = communities[n];

      if (!(community in internalWeight)) {
        internalWeight[community] = 0;
        totalWeight[community] = 0;
      }
    }
  }

  // Else we need to extract it from the graph
  else {
    communities = {};
    graph.forEachNode(function(node, attr) {
      community = attr[options.attributes.community];
      communities[node] = community;

      if (!(community in internalWeight)) {
        internalWeight[community] = 0;
        totalWeight[community] = 0;
      }
    });
  }

  var M = 0,
      Q = 0;

  var c1, c2, w;

  var getWeight = function(attr) {
    w = 1;

    if (options.weighted) {
      w = attr[options.attributes.weight];

      if (typeof w !== 'number')
        w = 1;
    }

    return w;
  };

  // Undirected edges
  graph.forEachUndirectedEdge(function(edge, attr, source, target) {

    // We ignore self loops
    if (source === target)
      return;

    c1 = communities[source];
    c2 = communities[target];

    if (typeof c1 === 'undefined' || typeof c2 === 'undefined')
      throw new Error('graphology-metrics/modularity: some nodes are not in the partition.');

    w = getWeight(attr);

    totalWeight[c1] += w;
    totalWeight[c2] += w;
    M += w * 2;

    if (c1 === c2)
      internalWeight[c1] += w * 2;
  });

  // Directed edges
  graph.forEachDirectedEdge(function(edge, attr, source, target) {

    // We ignore self loops
    if (source === target)
      return;

    c1 = communities[source];
    c2 = communities[target];

    w = getWeight(attr);

    totalWeight[c1] += w;
    M += w;

    if (c1 === c2)
      internalWeight[c1] += w;
  });

  for (community in totalWeight)
    Q += internalWeight[community] - totalWeight[community] * totalWeight[community] / M;

  return Q / M;
}

//   for (community1 in totalW)
//     Q += ((internalW[community1] || 0) - (totalW[community1] * totalW[community1] / M));



//     totalW[community1] = (totalW[community1] || 0) + weight;
//     if (graph.undirected(edge) || !graph.hasDirectedEdge(node2, node1)) {
//       totalW[community2] = (totalW[community2] || 0) + weight;
//       M += 2 * weight;
//     }
//     else {
//       M += weight;
//     }

//     if (!graph.hasDirectedEdge(node2, node1))
//       weight *= 2;

//     if (community1 === community2)
//       internalW[community1] = (internalW[community1] || 0) + weight;
//   }


module.exports = modularity;


// /**
//  * Graphology Modularity
//  * ======================
//  *
//  * Notes:
//  * The following code is taken from Gephi and Gephi doesn't consider directed
//  * edges:
//  *
//  * Directed edges produces the same modularity as if they were undirected
//  *   - if there are a->b and b->a : consider a<->b
//  *   - if there is a->b only or b->a only : consider ALSO a<->b
//  *   - if there are a->b , b->a with differents weights, only one is considered
//  *
//  * The order chosen by Gephi is unknown, it is a sensitive case and is not
//  * handled.
//  *
//  * Self-loops are not considered at all, not in the total weights, not in the
//  * computing part (remove them and it will be the same modularity score).
//  */
// var defaults = require('lodash/defaultsDeep'),
//     isGraph = require('graphology-utils/is-graph');

// var DEFAULTS = {
//   attributes: {
//     community: 'community',
//     weight: 'weight'
//   }
// };

// /**
//  * Function returning the modularity of the given graph.
//  *
//  * @param  {Graph}  graph         - Target graph.
//  * @param  {object} options       - Options:
//  * @param  {object}   communities - Communities mapping.
//  * @param  {object}   attributes  - Attribute names:
//  * @param  {string}     community - Name of the community attribute.
//  * @param  {string}     weight    - Name of the weight attribute.
//  * @return {number}
//  */
// function modularity(graph, options) {

//   // Handling errors
//   if (!isGraph(graph))
//     throw new Error('graphology-metrics/modularity: the given graph is not a valid graphology instance.');

//   if (graph.multi)
//     throw new Error('graphology-metrics/modularity: multi graphs are not handled.');

//   if (!graph.size)
//     throw new Error('graphology-metrics/modularity: the given graph has no edges.');

//   // Solving options
//   options = defaults({}, options, DEFAULTS);

//   var communities,
//       nodes = graph.nodes(),
//       edges = graph.edges(),
//       i,
//       l;

//   // Do we have a community mapping?
//   if (typeof options.communities === 'object') {
//     communities = options.communities;
//   }

//   // Else we need to extract it from the graph
//   else {
//     communities = {};

//     for (i = 0, l = nodes.length; i < l; i++)
//       communities[nodes[i]] = graph.getNodeAttribute(nodes[i], options.attributes.community);
//   }

//   var M = 0,
//       Q = 0,
//       internalW = {},
//       totalW = {},
//       bounds,
//       node1, node2, edge,
//       community1, community2,
//       w, weight;

//   for (i = 0, l = edges.length; i < l; i++) {
//     edge = edges[i];
//     bounds = graph.extremities(edge);
//     node1 = bounds[0];
//     node2 = bounds[1];

//     if (node1 === node2)
//       continue;

//     community1 = communities[node1];
//     community2 = communities[node2];

//     if (community1 === undefined)
//       throw new Error('graphology-metrics/modularity: the "' + node1 + '" node is not in the partition.');

//     if (community2 === undefined)
//       throw new Error('graphology-metrics/modularity: the "' + node2 + '" node is not in the partition.');

//     w = graph.getEdgeAttribute(edge, options.attributes.weight);
//     weight = isNaN(w) ? 1 : w;

//     totalW[community1] = (totalW[community1] || 0) + weight;
//     if (graph.undirected(edge) || !graph.hasDirectedEdge(node2, node1)) {
//       totalW[community2] = (totalW[community2] || 0) + weight;
//       M += 2 * weight;
//     }
//     else {
//       M += weight;
//     }

//     if (!graph.hasDirectedEdge(node2, node1))
//       weight *= 2;

//     if (community1 === community2)
//       internalW[community1] = (internalW[community1] || 0) + weight;
//   }

//   for (community1 in totalW)
//     Q += ((internalW[community1] || 0) - (totalW[community1] * totalW[community1] / M));

//   return Q / M;
// }

// module.exports = modularity;
