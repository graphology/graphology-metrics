var Graph = require('graphology');
var lib = require('../modularity.js');

// function fromData(G, nodes, edges) {
//   var g = new G();

//   nodes.forEach(function(node) {
//     g.addNode(node[0], {community: node[1]});
//   });

//   edges.forEach(function(edge) {
//     var attr = {};

//     if (edge.length > 2)
//       attr.weight = edge[2];

//     g.mergeEdge(edge[0], edge[1], attr);
//   });

//   return g;
// }

// var nodes = [
//   [1, 1], // id, community
//   [2, 2],
//   [3, 2],
//   [4, 2],
//   [5, 1],
//   [6, 2]
// ];

// var edges = [
//   [1, 2], // source, target
//   [1, 5],
//   [2, 3],
//   [3, 4],
//   [4, 2],
//   [5, 1],
//   [6, 3]
// ];

// var g = fromData(Graph.UndirectedGraph, nodes, edges);

var g = new Graph.UndirectedGraph();

g.addNode(1, {community: 1});
g.addNode(2, {community: 1});
g.addNode(3, {community: 2});
g.addNode(4, {community: 1});

g.addEdge(1, 2);
g.addEdge(1, 3);
g.addEdge(1, 4);
g.addEdge(2, 3);
g.addEdge(2, 4);
g.addEdge(3, 4);

var Q = lib.sparse(g);
console.log('Q  =', Q);

g.setNodeAttribute(3, 'community', 1);

console.log('Q+ =', lib.sparse(g));
console.log('∆  =', lib.sparse(g) - Q);

// Variables
var dic = 3 * 2,
    di = 3,
    Ztot = 9,
    Zin = 6,
    m = 6;

var DQ = dic / (2 * m) - (Ztot * di) / (2 * Math.pow(m, 2));

console.log(DQ.toFixed(4));

var DDQ = ( (Zin + dic) / (2 * m) - Math.pow((Ztot + di) / (2 * m), 2) ) -
          ( Zin / (2 * m) - Math.pow(Ztot / (2 * m), 2) - Math.pow(di / (2 * m), 2));

console.log(DDQ.toFixed(4));
