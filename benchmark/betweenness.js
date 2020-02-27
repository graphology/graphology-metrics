var {UndirectedGraph} = require('graphology');
var betweenness = require('../centrality/betweenness');
var data = require('./resources/betweenness.json');

var graph = UndirectedGraph.from(data);

console.time('betweenness');
betweenness(graph);
console.timeEnd('betweenness');
