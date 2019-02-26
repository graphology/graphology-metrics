/**
 * Graphology Degree
 * ===================
 *
 * Functions used to compute the degree of each node of a given graph.
 */
var isGraph = require('graphology-utils/is-graph');

function degree (graph) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/degree: given graph is not a valid graphology instance.');
  var nodes = graph.nodes();
  var degrees = {};
  for (var i = 0; i < nodes.length; i++) {
    degrees[nodes[i]] = graph.degree(nodes[i]);
  }
  return degrees;
}

function inDegree (graph) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/degree: given graph is not a valid graphology instance.');
  if (graph.type === 'undirected')
    throw new Error('graphology-metrics/degree: inDegrees can not be calculated for undirected graphs.');
  var nodes = graph.nodes();
  var degrees = {};
  for (var i = 0; i < nodes.length; i++) {
    degrees[nodes[i]] = graph.inDegree(nodes[i]);
  }
  return degrees;
}

function outDegree (graph) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/degree: given graph is not a valid graphology instance.');
  if (graph.type === 'undirected')
    throw new Error('graphology-metrics/degree: outDegrees can not be calculated for undirected graphs.');
  var nodes = graph.nodes();
  var degrees = {};
  for (var i = 0; i < nodes.length; i++) {
    degrees[nodes[i]] = graph.outDegree(nodes[i]);
  }
  return degrees;
}

function allDegree (graph) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/degree: given graph is not a valid graphology instance.');
  var nodes = graph.nodes();
  var degrees = {};
  for (var i = 0; i < nodes.length; i++) {
    degrees[nodes[i]] = {
      in: graph.inDegree(nodes[i]),
      out: graph.outDegree(nodes[i])
    };
  }
  return degrees;
}

degree.inDegree = inDegree;
degree.outDegree = outDegree;
degree.allDegree = allDegree;

module.exports = degree;
