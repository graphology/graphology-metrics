import Graph from 'graphology-types';

type CommunityMapping = {[key: string]: string | number};

type ModularityOptions = {
  attributes: {
    community: string,
    weight: string
  },
  communities: CommunityMapping
};

export default function modularity(graph: Graph, options?: ModularityOptions): number;
