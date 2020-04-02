var Graph = require('graphology');
// var lib = require('../modularity.js');

var nodes = [
  [1, 1], // id, community
  [2, 2],
  [3, 2],
  [4, 2],
  [5, 1],
  [6, 2]
];

var edges = [
  [1, 2], // source, target
  [1, 5],
  [2, 3],
  [3, 4],
  [4, 2],
  [5, 1],
  [6, 3],
  [1, 1]
];

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
    if (source === target)
      return;

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
  var result = collectForUndirectedDense(graph, options);

  var communities = result.communities,
      weightedDegrees = result.weightedDegrees;

  var M = result.M;

  var nodes = graph.nodes();

  var i, j, l, Aij, didj;

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

      Aij = result.getWeight(edgeAttributes);
      didj = weightedDegrees[i] * weightedDegrees[j];

      // Here we multiply by two to simulate iteration through lower part
      S += (Aij - (didj / M2)) * 2;
    }
  }

  return S / M2;
}

var g = new Graph.UndirectedGraph();
nodes.forEach(n => g.addNode(n[0], {community: n[1]}));
edges.forEach(e => g.mergeEdge(e[0], e[1]));

var Q = undirectedDenseModularity(g, {attributes: {weight: 'weight', community: 'community'}});

console.log(Q);
