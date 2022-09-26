import { DefinitionNode, Kind } from 'graphql';
import type { QueryAndMutationMapping } from './types';

export const getQueryAndMutationOperations = (
  definitions: ReadonlyArray<DefinitionNode>
): QueryAndMutationMapping => {
  const unnamedOperation = 'unnamedOperation';
  let unnamedOperationCount = 1;

  return definitions.reduce((map, definition) => {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      let operationName = definition?.name?.value;
      if (!operationName) {
        operationName = `${unnamedOperation}${unnamedOperationCount}`;
        unnamedOperationCount += 1;
      }

      map[operationName] = definition;
    }
    return map;
  }, {} as QueryAndMutationMapping);
};
