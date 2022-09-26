import { DefinitionNode, Kind, SelectionNode } from 'graphql';
import { determineDepth } from './determineDepth';
import { sum } from './sum';
import type { FragmentMapping, OperationStatType } from './types';

export const determineDepthStatistics = (
  node: DefinitionNode | SelectionNode,
  fragments: FragmentMapping,
  depthSoFar: number,
  operationName: string
): OperationStatType => {
  if (
    node.kind === Kind.OPERATION_DEFINITION ||
    node.kind === Kind.INLINE_FRAGMENT ||
    node.kind === Kind.FRAGMENT_DEFINITION
  ) {
    const selections = node.selectionSet.selections;
    const arrayOfMaxDepths = selections.map((selection) =>
      determineDepth(selection, fragments, depthSoFar, operationName)
    );

    return {
      totalDepthOfQuery: sum(arrayOfMaxDepths),
      depthOfDeepestQuery: Math.max(...arrayOfMaxDepths),
    };
  }

  if (node.kind === Kind.FIELD) {
    const arrayOfMaxDepths =
      node.selectionSet?.selections?.map((selection) =>
        determineDepth(selection, fragments, depthSoFar + 1, operationName)
      ) || [];

    return {
      totalDepthOfQuery: 1 + sum(arrayOfMaxDepths),
      depthOfDeepestQuery: 1 + Math.max(...arrayOfMaxDepths),
    };
  }

  if (node.kind === Kind.FRAGMENT_SPREAD) {
    const x = determineDepth(
      fragments[node.name.value],
      fragments,
      depthSoFar,
      operationName
    );

    return {
      totalDepthOfQuery: x,
      depthOfDeepestQuery: x,
    };
  }

  throw new Error('uh oh! depth crawler cannot handle: ' + node.kind);
};
