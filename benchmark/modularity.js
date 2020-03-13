var nodes = [
  [1, 1, 2], // id, C, deg
  [2, 2, 3],
  [3, 2, 2],
  [4, 2, 2],
  [5, 1, 1],
  [6, 2, 1]
];

var edges = [
  [1, 2, null], // s, t, internal?
  [1, 5, 1],
  [2, 3, 2],
  [3, 4, 2],
  [4, 2, 2],
  [5, 1, 1],
  [6, 3, 2]
];

var M = 6; // Undirected size (minus 1 mutual edge)
var M2 = M * 2;

function hasUndirectedEdge(E, s, t) {
  return E.some(e => {
    return (e[0] === s && e[1] === t) || (e[1] === s && e[0] === t);
  });
}

function hasMutualEdge(E, s, t) {
  return hasDirectedEdge(E, s, t) && hasDirectedEdge(E, t, s);
}

function hasDirectedEdge(E, s, t) {
  return E.some(e => {
    return (e[0] === s && e[1] === t);
  });
}

var S = 0, Aij, didj;

var tot = {1: 0, 2: 0}, int = {1: 0, 2: 0}, ext = {1: 0, 2: 0};

var i, j, l, ok;

for (i = 0, l = nodes.length; i < l; i++) {
  for (j = i + 1; j < l; j++) {
    ok = hasUndirectedEdge(edges, nodes[i][0], nodes[j][0]);

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
    didj = nodes[i][2] * nodes[j][2];

    S += Aij - (didj / M2);
  }
}

console.log('S = ', S);
console.log('Q = ', S / M2);
console.log('tot1', tot[1], 'tot2', tot[2]);
console.log('int1', int[1], 'int2', int[2]);
console.log('ext1', ext[1], 'ext2', ext[2]);
console.log('sparse Q = ', ((int[1] - (tot[1] * tot[1] / M2)) + (int[2] - (tot[2] * tot[2] / M2))) / M2)
console.log('other sparse Q =', ((int[1] / M2) - Math.pow(tot[1] / M2, 2)) + ((int[1] / M2) - Math.pow(tot[1] / M2, 2)))

// 1/2m ∑ij[Aij - (di.dj / 2m)].∂(ci, cj)
// ∑c[(∑c-internal / 2m) - (∑c-total / 2m)²]
// self-loop do not count
