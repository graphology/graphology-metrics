var Graph = require('graphology');
var lib = require('../modularity.js');

var g = new Graph.UndirectedGraph();

g.addNode(1, {community: 1});
g.addNode(2, {community: 1});
g.addNode(3, {community: 2});

g.addEdge(1, 2);
g.addEdge(2, 3);
g.addEdge(3, 1);

console.log('Q =', lib.sparse(g));
g.setNodeAttribute(3, 'community', 1);
console.log('Q+ =', lib.sparse(g));

// Node = 3
var dic = 0,
    di = 3,
    Ztot = 2,
    Zin = 1,
    m = 6;

// Node = 1
// var dic = 2,
//     di = 2,
//     Ztot = 3,
//     Zin = 1,
//     m = 3;

var DQ = dic / (2 * m) - (Ztot * di) / (2 * Math.pow(m, 2));

console.log(DQ.toFixed(4));

var DDQ = ( (Zin + dic) / (2 * m) - Math.pow((Ztot + di) / (2 * m), 2) ) -
          ( Zin / (2 * m) - Math.pow(Ztot / (2 * m), 2) - Math.pow(di / (2 * m), 2));

console.log(DDQ);
