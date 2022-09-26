import { DefinitionNode, Kind, SelectionNode } from 'graphql';
import type { FragmentMapping } from './types';

export const determineDepth = (
  node: DefinitionNode | SelectionNode,
  fragments: FragmentMapping,
  depthSoFar: number,
  operationName: string
): number => {
  if (
    node.kind === Kind.OPERATION_DEFINITION ||
    node.kind === Kind.INLINE_FRAGMENT ||
    node.kind === Kind.FRAGMENT_DEFINITION
  ) {
    const selections = node.selectionSet.selections;
    const arrayOfMaxDepths = selections.map((selection) =>
      determineDepth(selection, fragments, depthSoFar, operationName)
    );

    return Math.max(...arrayOfMaxDepths);
  }

  if (node.kind === Kind.FIELD) {
    const arrayOfMaxDepths = node.selectionSet?.selections?.map((selection) =>
      determineDepth(selection, fragments, depthSoFar + 1, operationName)
    );

    if (!arrayOfMaxDepths) return 1;

    return 1 + Math.max(...arrayOfMaxDepths);
  }

  if (node.kind === Kind.FRAGMENT_SPREAD) {
    return determineDepth(
      fragments[node.name.value],
      fragments,
      depthSoFar,
      operationName
    );
  }

  throw new Error('uh oh! depth crawler cannot handle: ' + node.kind);
};
