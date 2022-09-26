import type { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';

export type FragmentMapping = { [key: string]: FragmentDefinitionNode };
export type QueryAndMutationMapping = {
  [key: string]: OperationDefinitionNode;
};

export type OperationStatType = {
  depthOfDeepestQuery: number;
  totalDepthOfQuery: number;
};
export type DocumentQueryStatsResponse = {
  [operationName: string]: OperationStatType;
};
