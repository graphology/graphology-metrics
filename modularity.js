/**
 * Graphology Modularity
 * ======================
 *
 * Implementation of network modularity for graphology.
 *
 * Modularity is a bit of a tricky problem because there are a wide array
 * of different definitions and implementations. The current implementation
 * try to stay true to Newman's original definition and consider both the
 * undirected & directed case as well as the weighted one. The current
 * implementation should also be aligned with Louvain algorithm's definition
 * of the metric.
 *
 * Hence, here are the retained formulas:
 *
 * For dense weighted undirected network:
 * --------------------------------------
 *
 * 1/2m * [ ∑ij[Aij - (di.dj / 2m)] * ∂(ci, cj) ]
 *
 * where:
 *  - i & j being a pair of nodes
 *  - m is the sum of edge weights
 *  - Aij being the weight of the ij edge (or 0 if absent)
 *  - di being the weighted degree of node i
 *  - ci being the community to which belongs node i
 *  - ∂ is Kronecker's delta function (1 if x = y else 0)
 *
 * For dense weighted directed network:
 * ------------------------------------
 *
 * 1/m * [ ∑ij[Aij - (dini.doutj / m)] * ∂(ci, cj) ]
 *
 * where:
 *  - dini is the in degree of node i
 *  - douti is the out degree of node i
 *
 * For sparse weighted undirected network:
 * --------------------------------------
 *
 * ∑c[ (∑cinternal / 2m) - (∑ctotal / 2m)² ]
 *
 * where:
 *  - c is a community
 *  - ∑cinternal is the number of a community internal edges
 *  - ∑ctotal is the total number of edges connected to a community
 *
 * Note that dense version run in O(N²) while sparse version runs in O(V). So
 * the dense version is mostly here to guarantee the validity of the sparse one.
 * As such it is not used as default.
 *
 * [Articles]
 * M. E. J. Newman, « Modularity and community structure in networks »,
 * Proc. Natl. Acad. Sci. USA, vol. 103, no 23,‎ 2006, p. 8577–8582
 * https://dx.doi.org/10.1073%2Fpnas.0601602103
 *
 * Blondel, Vincent D., et al. « Fast unfolding of communities in large
 * networks ». Journal of Statistical Mechanics: Theory and Experiment,
 * vol. 2008, no 10, octobre 2008, p. P10008. DOI.org (Crossref),
 * doi:10.1088/1742-5468/2008/10/P10008.
 * https://arxiv.org/pdf/0803.0476.pdf
 *
 * Nicolas Dugué, Anthony Perez. Directed Louvain: maximizing modularity in
 * directed networks. [Research Report] Université d’Orléans. 2015. hal-01231784
 * https://hal.archives-ouvertes.fr/hal-01231784
 */

// TODO: drop obliterator dep
var defaults = require('lodash/defaultsDeep'),
    take = require('obliterator/take');

var DEFAULTS = {
  attributes: {
    community: 'community',
    weight: 'weight'
  },
  communities: null,
  weighted: true
};

function createWeightGetter(weighted, weightAttribute) {
  return function(attr) {
    if (!attr)
      return 0;

    if (!weighted)
      return 1;

    var w = attr[weightAttribute];

    if (typeof w !== 'number')
      w = 1;

    return w;
  };
}

function collectCommunities(entries, options) {
  var i, l, entry;

  var communities = new Array(entries.length);

  for (i = 0, l = entries.length; i < l; i++) {
    entry = entries[i];

    communities[i] = options.communities ?
      options.communities[entry[0]] :
      entry[1][options.attributes.community];
  }

  return communities;
}

function undirectedDenseModularity(graph, options) {

  // TODO: move somewhere upper
  // TODO: should get weighted degree
  options = defaults({}, options || {}, DEFAULTS);

  var nodeEntries = take(graph.nodeEntries(), graph.order);

  var communities = collectCommunities(nodeEntries, options);

  var getWeight = createWeightGetter(options.weighted, options.attributes.weight);

  // TODO: should get weighted size
  var M = graph.size;

  var i, j, l, w, Aij, didj, iEntry, jEntry, edgeAttributes;

  var S = 0;

  var M2 = M * 2;

  for (i = 0, l = graph.order; i < l; i++) {
    iEntry = nodeEntries[i];

    S += 0 - (Math.pow(graph.degree(iEntry[0]), 2) / M2);

    // NOTE: it is important to parse the whole matrix here, diagonal and
    // lower part included. A lot of implementation differ here because
    // they process only a part of the matrix
    for (j = i + 1; j < l; j++) {

      // NOTE: Kronecker's delta
      // NOTE: we could go from O(n * (n - 1)) to O(avg.C^2)
      if (communities[i] !== communities[j])
        continue;

      jEntry = nodeEntries[j];

      edgeAttributes = graph.undirectedEdge(iEntry[0], jEntry[0]);
      w = getWeight(edgeAttributes);

      Aij = w;
      didj = graph.degree(iEntry[0]) * graph.degree(jEntry[0]);

      S += (Aij - (didj / M2)) * 2;
    }
  }

  return S / M2;
}

function undirectedSparseModularity(graph, options) {
  options = defaults({}, options || {}, DEFAULTS);

  var M = 0;

  var totalWeights = {},
      internalWeights = {};

  var getWeight = createWeightGetter(options.weighted, options.attributes.weight);

  var getCommunity = function(node, attr) {
    return attr[options.attributes.community];
  };

  if (options.communities)
    getCommunity = function(node) {
      return options.communities[node];
    };

  graph.forEachUndirectedEdge(function(edge, edgeAttr, source, target, sourceAttr, targetAttr) {
    var weight = getWeight(edgeAttr);

    M += weight;

    var sourceCommunity = getCommunity(source, sourceAttr);
    var targetCommunity = getCommunity(target, targetAttr);

    if (!(sourceCommunity in totalWeights))
      totalWeights[sourceCommunity] = weight;
    else
      totalWeights[sourceCommunity] += weight;

    if (!(targetCommunity in totalWeights))
      totalWeights[targetCommunity] = weight;
    else
      totalWeights[targetCommunity] += weight;

    if (sourceCommunity !== targetCommunity)
      return;

    if (!(sourceCommunity in internalWeights))
      internalWeights[sourceCommunity] = weight * 2;
    else
      internalWeights[sourceCommunity] += weight * 2;
  });

  var Q = 0,
      M2 = M * 2;

  for (var C in totalWeights)
    Q += (internalWeights[C] || 0) / M2 - Math.pow(totalWeights[C] / M2, 2);

  return Q;
}

module.exports = {
  undirectedDenseModularity: undirectedDenseModularity,
  undirectedSparseModularity: undirectedSparseModularity
};
