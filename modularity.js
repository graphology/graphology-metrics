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
 * implementation should also be aligned with the Louvain algorithm's
 * definition of the metric.
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
 * 1/m * [ ∑ij[Aij - (din-i.dout-j / m)] * ∂(ci, cj) ]
 *
 * where:
 *  - din-i is the in degree of node i
 *  - dout-i is the out degree of node i
 *
 * For sparse weighted undirected network:
 * --------------------------------------
 *
 * ∑c[ (∑c-internal / 2m) - (∑c-total / 2m)² ]
 *
 * where:
 *  - c is a community
 *  - ∑c-internal is the number of a community internal edges
 *  - ∑c-total is the total number of edges connected to a community
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
// var defaults = require('lodash/defaultsDeep');

// var DEFAULTS = {
//   attributes: {
//     community: 'community',
//     weight: 'weight'
//   },
//   weighted: true
// };

// function undirectedDenseModularity(graph, options) {
//   var nodeEntries
// }
