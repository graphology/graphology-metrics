/**
 * Graphology Degree
 * ===================
 *
 * Functions used to compute the degree of each node of a given graph.
 */
var isGraph = require('graphology-utils/is-graph');
var defaultAttributes = {
  degree: 'degree',
  inDegree: 'inDegree',
  outDegree: 'outDegree',
  undirectedDegree: 'undirectedDegree',
  directedDegree: 'directedDegree'
};

function abstractDegree (graph, callee, assign, type, options) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/' + callee + ': given graph is not a valid graphology instance.');
  if (graph.type === type) {
    throw new Error('graphology-metrics/' + callee + ': can not be calculated for ' + type + '  graphs.');
  }
  var nodes = graph.nodes();
  if (assign) {
    var attributes = Object.assign({}, defaultAttributes, options && options.attributes);
    for (var j = 0; j < nodes.length; j++) {
      graph.setNodeAttribute(
        nodes[j],
        attributes[callee],
        graph[callee](nodes[j])
      );
    }
    return;
  }
  var hashmap = {};
  for (var i = 0; i < nodes.length; i++) {
    hashmap[nodes[i]] = graph[callee](nodes[i]);
  }
  return hashmap;
}

function allDegree (graph, options, assign) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/degree: given graph is not a valid graphology instance.');
  var attributes = Object.assign({}, defaultAttributes, options && options.attributes);
  var nodes = graph.nodes();
  var types;
  var defaultTypes;
  if (graph.type === 'undirected') {
    defaultTypes = ['degree'];
  }
  else {
    defaultTypes = ['inDegree', 'outDegree'];
  }
  if (options && options.types && options.types.length) {
    types = defaultTypes.filter(function (type) {
      return options.types.indexOf(type) > -1;
    });
  }
  else {
    types = defaultTypes;
  }
  if (assign) {
    for (var k = 0; k < nodes.length; k++) {
      for (var l = 0; l < types.length; l++) {
        graph.setNodeAttribute(
          nodes[k],
          attributes[types[l]],
          graph[types[l]](nodes[k])
        );
      }
    }
  }
  else {
    var hashmap = {};
    for (var i = 0; i < nodes.length; i++) {
      var response = {};
      for (var j = 0; j < types.length; j++) {
        response[attributes[types[j]]] = graph[types[j]](nodes[i]);
      }
      hashmap[nodes[i]] = response;
    }
    return hashmap;
  }
}
allDegree.assign = function assignAllDegree (graph, options) {
  allDegree(graph, options, true);
};

function degree (graph) {
  return abstractDegree(graph, 'degree');
}
degree.assign = function assignDegree (graph, options) {
  abstractDegree(graph, 'degree', true, 'none', options);
};

function inDegree (graph) {
  return abstractDegree(graph, 'inDegree', false, 'undirected');
}
inDegree.assign = function assignInDegree (graph, options) {
  abstractDegree(graph, 'inDegree', true, 'undirected', options);
};

function outDegree (graph) {
  return abstractDegree(graph, 'outDegree', false, 'undirected');
}
outDegree.assign = function assignOutDegree (graph, option) {
  abstractDegree(graph, 'outDegree', true, 'undirected', option);
};

function undirectedDegree (graph) {
  return abstractDegree(graph, 'undirectedDegree', false, 'directed');
}
undirectedDegree.assign = function assignUndirectedDegree (graph, option) {
  abstractDegree(graph, 'undirectedDegree', true, 'directed', option);
};

function directedDegree (graph) {
  return abstractDegree(graph, 'directedDegree', false, 'undirected');
}
directedDegree.assign = function assignUndirectedDegree (graph, option) {
  abstractDegree(graph, 'directedDegree', true, 'undirected', option);
};

degree.inDegree = inDegree;
degree.outDegree = outDegree;
degree.undirectedDegree = undirectedDegree;
degree.directedDegree = directedDegree;
degree.allDegree = allDegree;

module.exports = degree;
