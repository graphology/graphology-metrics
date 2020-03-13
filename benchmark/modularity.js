var Graph = require('graphology');

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
  [6, 3]
];

var g = new Graph.UndirectedGraph();
edges.forEach(e => g.mergeEdge(e[0], e[1]));

var degrees = nodes.map(n => g.degree(n[0]));

var M = g.size; // Undirected size (minus 1 mutual edge)
var M2 = M * 2;

var S = 0, Aij, didj;

var tot = {1: 0, 2: 0}, int = {1: 0, 2: 0}, ext = {1: 0, 2: 0};

var i, j, l, ok;

for (i = 0, l = nodes.length; i < l; i++) {

  // TODO: j should be 0 -> should scan diagonal and lower part
  for (j = i + 1; j < l; j++) {
    ok = g.hasEdge(nodes[i][0], nodes[j][0]);

    if (ok) {
      tot[nodes[i][1]] += 1;
      tot[nodes[j][1]] += 1;
    }

    // Kronecker delta
    if (nodes[i][1] !== nodes[j][1]) {
      ext[nodes[i][1]] += 1;
      ext[nodes[j][1]] += 1;
      continue;
    }

    if (ok)
      int[nodes[i][1]] += 2;

    Aij = ok ? 1 : 0;
    didj = degrees[i] * degrees[j];
    S += Aij - (didj / M2);
  }
}

var Q = S / M2;
var SPARSE_Q = ((int[1] - (tot[1] * tot[1] / M2)) + (int[2] - (tot[2] * tot[2] / M2))) / M2;
var OTHER_SPARSE_Q = ((int[1] / M2) - Math.pow(tot[1] / M2, 2)) + ((int[2] / M2) - Math.pow(tot[2] / M2, 2));

console.log('M = ', M);
console.log('S = ', S);
console.log('Q = ', Q.toFixed(4));
console.log('tot1', tot[1], 'tot2', tot[2]);
console.log('int1', int[1], 'int2', int[2]);
console.log('ext1', ext[1], 'ext2', ext[2]);
console.log('sparse Q = ', SPARSE_Q.toFixed(4));
console.log('other sparse Q =', OTHER_SPARSE_Q.toFixed(4));

// 1/2m ∑ij[Aij - (di.dj / 2m)].∂(ci, cj)
// ∑c[(∑c-internal / 2m) - (∑c-total / 2m)²]
// self-loop do not count
// note: sparse version is the same as igraph now
