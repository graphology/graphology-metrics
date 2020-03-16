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
 * Q = 1/2m * [ ∑ij[Aij - (di.dj / 2m)] * ∂(ci, cj) ]
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
 * Qd = 1/m * [ ∑ij[Aij - (dini.doutj / m)] * ∂(ci, cj) ]
 *
 * where:
 *  - dini is the in degree of node i
 *  - douti is the out degree of node i
 *
 * For sparse weighted undirected network:
 * ---------------------------------------
 *
 * Q = ∑c[ (∑cinternal / 2m) - (∑ctotal / 2m)² ]
 *
 * where:
 *  - c is a community
 *  - ∑cinternal is the total weight of a community internal edges
 *  - ∑ctotal is the total weight of edges connected to a community
 *
 * For sparse weighted directed network:
 * -------------------------------------
 *
 * Qd = ∑c[ (∑cinternal / m) - (∑cintotal * ∑couttotal / m²) ]
 *
 * where:
 *  - ∑cintotal is the total weight of edges pointing towards a community
 *  - ∑couttotal is the total weight of edges going from a community
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
 *
 * [Latex]
 *
 * Sparse undirected
 * Q = \sum_{c} \bigg{[} \frac{\sum\nolimits_{c\,in}}{2m} - \left(\frac{\sum\nolimits_{c\,tot}}{2m}\right )^2 \bigg{]}
 *
 * Sparse directed
 * Q_d = \sum_{c} \bigg{[} \frac{\sum\nolimits_{c\,in}}{m} - \frac{\sum_{c\,tot}^{in}\sum_{c\,tot}^{out}}{m^2} \bigg{]}
 */
var defaults = require('lodash/defaultsDeep');

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

function collectForUndirectedDense(graph, options) {
  var communities = new Array(graph.order),
      weightedDegrees = new Float64Array(graph.order),
      M = 0;

  var ids = {};

  var getWeight = createWeightGetter(options.weighted, options.attributes.weight);

  // Collecting communities
  var i = 0;
  graph.forEachNode(function(node, attr) {
    ids[node] = i;
    communities[i++] = options.communities ?
      options.communities[node] :
      attr[options.attributes.community];
  });

  // Collecting weights
  graph.forEachUndirectedEdge(function(edge, attr, source, target) {
    var weight = getWeight(attr);

    M += weight;

    weightedDegrees[ids[source]] += weight;
    weightedDegrees[ids[target]] += weight;
  });

  return {
    getWeight: getWeight,
    communities: communities,
    weightedDegrees: weightedDegrees,
    M: M
  };
}

function undirectedDenseModularity(graph, options) {

  // TODO: move somewhere upper
  options = defaults({}, options || {}, DEFAULTS);

  var result = collectForUndirectedDense(graph, options);

  var communities = result.communities,
      weightedDegrees = result.weightedDegrees;

  var M = result.M;

  var nodes = graph.nodes();

  var i, j, l, w, Aij, didj;

  var S = 0;

  var M2 = M * 2;

  for (i = 0, l = graph.order; i < l; i++) {

    // Diagonal
    // NOTE: could change something here to handle self loops
    S += 0 - (Math.pow(weightedDegrees[i], 2) / M2);

    // NOTE: it is important to parse the whole matrix here, diagonal and
    // lower part included. A lot of implementation differ here because
    // they process only a part of the matrix
    for (j = i + 1; j < l; j++) {

      // NOTE: Kronecker's delta
      // NOTE: we could go from O(n^2) to O(avg.C^2)
      if (communities[i] !== communities[j])
        continue;

      edgeAttributes = graph.undirectedEdge(nodes[i], nodes[j]);
      w = result.getWeight(edgeAttributes);

      Aij = w;
      didj = weightedDegrees[i] * weightedDegrees[j];

      // Here we multiply by two to simulate iteration through lower part
      S += (Aij - (didj / M2)) * 2;
    }
  }

  return S / M2;
}

function collectCommunitesForUndirected(graph, options) {
  var communities = {},
      totalWeights = {},
      internalWeights = {};

  if (options.communities)
    communities = options.communities;

  graph.forEachNode(function(node, attr) {
    var community;

    if (!options.communities) {
      community = attr[options.attributes.community];
      communities[node] = community;
    }
    else {
      community = communities[node];
    }

    totalWeights[community] = 0;
    internalWeights[community] = 0;
  });

  return {
    communities: communities,
    totalWeights: totalWeights,
    internalWeights: internalWeights
  };
}

function undirectedSparseModularity(graph, options) {
  options = defaults({}, options || {}, DEFAULTS);

  var result = collectCommunitesForUndirected(graph, options);

  var M = 0;

  var totalWeights = result.totalWeights,
      internalWeights = result.internalWeights,
      communities = result.communities;

  var getWeight = createWeightGetter(options.weighted, options.attributes.weight);

  graph.forEachUndirectedEdge(function(edge, edgeAttr, source, target, sourceAttr, targetAttr) {
    var weight = getWeight(edgeAttr);

    M += weight;

    var sourceCommunity = communities[source];
    var targetCommunity = communities[target];

    totalWeights[sourceCommunity] += weight;
    totalWeights[targetCommunity] += weight;

    if (sourceCommunity !== targetCommunity)
      return;

    internalWeights[sourceCommunity] += weight * 2;
  });

  var Q = 0,
      M2 = M * 2;

  for (var C in totalWeights)
    Q += internalWeights[C] / M2 - Math.pow(totalWeights[C] / M2, 2);

  return Q;
}

module.exports = {
  undirectedDenseModularity: undirectedDenseModularity,
  undirectedSparseModularity: undirectedSparseModularity
};
