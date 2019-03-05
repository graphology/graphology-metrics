/**
 * Graphology Degree
 * ===================
 *
 * Functions used to compute the degree of each node of a given graph.
 */
var isGraph = require('graphology-utils/is-graph');
var density = require('./density');

function isArray(array) {
  return Object.prototype.toString.call(array) === '[object Array]';
}

function isEmpty(obj) {

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

function createEmptyModularity() {
  return {
    nodes: 0,
    internalEdges: 0,
    density: 0,
    externalEdges: 0,
    inboundEdges: 0,
    outboundEdges: 0,
  };
}

function modalities(graph, attributes) {
  if (!isGraph(graph))
    throw new Error('graphology-metrics/modality: given graph is not a valid graphology instance.');
  if (!attributes || (attributes && attributes.length === 0)) {
    throw new Error('graphology-metrics/modality: no attributes where given.');
  }
  if (!isArray(attributes)) {
    if (typeof(attributes) !== 'string') {
      throw new Error('graphology-metrics/modality: Attributes must be a string or an array of strings. typeof attributes = ' + typeof(attributes));
    }
    attributes = [attributes];
  }
  var hashmap = {};
  var i = 0;

  // Build hashmap's accepted attributes
  for (i = 0; i < attributes.length; i++) {
    hashmap[attributes[i]] = {};
  }

  function modalitiesCreator(type) {
    return function(key, edgeAttributes, source, target, sourceAttributes, targetAttributes) {
      for (i = 0; i < attributes.length; i++) {
        var attribute = attributes[i];
        var mapForAttribute = hashmap[attribute];
        var sourceValue = sourceAttributes[attribute];
        var targetValue = targetAttributes[attribute];
        var mapForSourceValue = mapForAttribute[sourceValue];
        if (!(attribute in sourceAttributes) || !(attribute in targetAttributes)) {
          return;
        }
        if (!mapForSourceValue) {
          mapForSourceValue = createEmptyModularity();
          mapForAttribute[sourceValue] = mapForSourceValue;
        }
        var mapForTargetValue = mapForAttribute[targetValue];
        if (!mapForTargetValue) {
          mapForTargetValue = createEmptyModularity();
          mapForAttribute[targetValue] = mapForTargetValue;
        }
        if (sourceValue === targetValue) {
          mapForSourceValue.internalEdges++;
        }
        else {
          if (type === 'directed') {
            mapForSourceValue.outboundEdges++;
            mapForTargetValue.inboundEdges++;

            mapForSourceValue.externalEdges++;
            mapForTargetValue.externalEdges++;
          }
          else if (type === 'undirected' || type === 'mixed') {
            mapForSourceValue.externalEdges++;
            mapForTargetValue.externalEdges++;
            if (type === 'mixed') {
              mapForSourceValue.outboundEdges++;
              mapForSourceValue.inboundEdges++;
              mapForTargetValue.outboundEdges++;
              mapForTargetValue.inboundEdges++;
            }
          }
          else {
            mapForSourceValue.outboundEdges++;
            mapForSourceValue.inboundEdges++;
            mapForTargetValue.outboundEdges++;
            mapForTargetValue.inboundEdges++;
          }
        }
      }
    };
  }

  var densityFn;
  if (graph.type === 'directed') {
    graph.forEachEdge(
      modalitiesCreator(graph.type)
    );
    densityFn = density.directedDensity;
  }
  else if (graph.type === 'undirected') {
    graph.forEachEdge(
      modalitiesCreator(graph.type)
    );
    densityFn = density.undirectedDensity;
  }
  else {
    graph.forEachDirectedEdge(
      modalitiesCreator('directed')
    );
    graph.forEachUndirectedEdge(
      modalitiesCreator('mixed')
    );
    densityFn = density.mixedDensity;
  }

  graph.forEachNode(function(node, nodeAttributes) {
    for (i = 0; i < attributes.length; i++) {
      hashmap[attributes[i]][nodeAttributes[attributes[i]]].nodes++;
    }
  });

  // Checks if all provided attributes has been computed.
  for (var attribute in hashmap) {
    if (isEmpty(hashmap[attribute])) {
      throw new Error('graphology-metrics/modality: Attribute ' + attribute + ' provided not found in any node attributes.');
    }
    var valuesForAttribute = hashmap[attribute];
    for (var value in valuesForAttribute) {
      var valueModalities = valuesForAttribute[value];
      valueModalities.density = densityFn(
        valueModalities.nodes,
        valueModalities.internalEdges
      );
    }
  }
  return hashmap;
}

module.exports = modalities;
