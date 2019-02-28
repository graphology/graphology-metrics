/**
 * Graphology Degree
 * ===================
 *
 * Functions used to compute the degree of each node of a given graph.
 */
var isGraph = require('graphology-utils/is-graph');
var density = require('./density');

function isArray (array) {
  return Object.prototype.toString.call(array) === '[object Array]';
}

function isEmpty (obj) {

  // null and undefined are "empty"
  if (!obj)
    return true;

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0)
    return false;
  if (obj.length === 0)
    return true;

  // If it isn't an object at this point
  // it is empty, but it can't be anything *but* empty
  // Is it empty?  Depends on your application.
  if (typeof obj !== 'object')
    return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

function createEmptyModularity (isUndirected) {
  if (isUndirected) {
    return {
      nodes: 0,
      internalEdges: 0,
      internalDensity: 0,
      externalEdges: 0,
      externalDensity: 0
    };
  }
  return {
    nodes: 0,
    internalEdges: 0,
    internalDensity: 0,
    externalEdges: 0,
    externalDensity: 0,
    inboundEdges: 0,
    inboundDensity: 0,
    outboundEdges: 0,
    outboundDensity: 0
  };
}

function modalities (graph, attributes) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/modality: given graph is not a valid graphology instance.');
  if (!attributes || (attributes && attributes.length === 0)) {
    throw new Error('graphology-metrics/modality: no attributes where given.');
  }
  if (!isArray(attributes)) {
    attributes = [attributes];
  }
  var type = graph.type;
  var isUndirected = type === 'undirected';
  var hashmap = attributes.reduce(function (acc, curr) {
    acc[curr] = {};
    return acc;
  }, {});
  graph.forEachEdge(function (key, edgeAttributes, source, target, sourceAttributes, targetAttributes) {
    for (var i = 0; i < attributes.length; i++) {
      var attribute = attributes[i];
      var mapForAttribute = hashmap[attribute];
      var sourceValue = sourceAttributes[attribute];
      var targetValue = targetAttributes[attribute];
      var mapForSourceValue = mapForAttribute[sourceValue];
      if (!(attribute in sourceAttributes) || !(attribute in targetAttributes)) {
        return;
      }
      if (!mapForSourceValue) {
        mapForSourceValue = createEmptyModularity(isUndirected);
        mapForAttribute[sourceValue] = mapForSourceValue;
      }
      var mapForTargetValue = mapForAttribute[targetValue];
      if (!mapForTargetValue) {
        mapForTargetValue = createEmptyModularity(isUndirected);
        mapForAttribute[targetValue] = mapForTargetValue;
      }
      if (sourceValue === targetValue) {
        mapForSourceValue.internalEdges++;
      }
      else {
        if (!isUndirected) {
          mapForSourceValue.outboundEdges++;
          mapForTargetValue.inboundEdges++;
        }
        mapForSourceValue.externalEdges++;
        mapForTargetValue.externalEdges++;
      }
    }
  });

  graph.forEachNode(function (node, nodeAttributes) {
    for (var i = 0; i < attributes.length; i++) {
      hashmap[attributes[i]][nodeAttributes[attributes[i]]].nodes++;
    }
  });

  var densityFn;
  if (graph.type === 'directed') {
    densityFn = density.directedDensity;
  }
  else if (graph.type === 'undirected') {
    densityFn = density.undirectedDensity;
  }
  else {
    densityFn = density.mixedDensity;
  }
  // Checks if all provided attributes has been computed.
  for (var attribute in hashmap) {
    if (isEmpty(hashmap[attribute])) {
      throw new Error('graphology-metrics/modality: Attribute ' + attribute + ' provided not found in any node attributes.');
    }
    var valuesForAttribute = hashmap[attribute];
    for (var value in valuesForAttribute) {
      var valueModalities = valuesForAttribute[value];
      valueModalities.internalDensity = densityFn(
        valueModalities.nodes,
        valueModalities.internalEdges
      );
    }
  }
  return hashmap;
}

module.exports = modalities;
