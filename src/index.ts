import {
  parse,
  Source,
  DocumentNode,
  DefinitionNode,
  Kind,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  SelectionNode,
} from 'graphql';

export function createDocument(query: string): DocumentNode {
  const source = new Source(query, 'GraphQL request');
  return parse(source);
}
type OperationStaticsticType = {
  depthOfDeepestQuery: number;
  sumOfMaxDepthOnAllQueries: number;
};
type DocumentQueryStatsResponse = {
  [operationName: string]: OperationStaticsticType;
};

export function getGraphQLQueryStats(
  document: DocumentNode | string
): DocumentQueryStatsResponse {
  let graphQLDocument: DocumentNode;

  if (typeof document === 'string') {
    graphQLDocument = createDocument(document);
  } else {
    graphQLDocument = document;
  }

  const fragments = getFragments(graphQLDocument.definitions);
  const operations = getQueryAndMutationOperations(graphQLDocument.definitions);

  const queryDepths = {} as DocumentQueryStatsResponse;
  for (let name in operations) {
    queryDepths[name] = determineDepthStatistics(
      operations[name],
      fragments,
      0,
      name
    );
  }

  return queryDepths;
}

type FragmentMapping = { [key: string]: FragmentDefinitionNode };
function getFragments(
  definitions: ReadonlyArray<DefinitionNode>
): FragmentMapping {
  return definitions.reduce((map, definition) => {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      const value = definition.name.value;
      map[value] = definition;
    }

    return map;
  }, {} as FragmentMapping);
}

type QueryAndMutationMapping = { [key: string]: OperationDefinitionNode };
function getQueryAndMutationOperations(
  definitions: ReadonlyArray<DefinitionNode>
): QueryAndMutationMapping {
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
}

function determineDepth(
  node: DefinitionNode | SelectionNode,
  fragments: FragmentMapping,
  depthSoFar: number,
  operationName: string
): number {
  if (
    node.kind === Kind.OPERATION_DEFINITION ||
    node.kind === Kind.INLINE_FRAGMENT ||
    node.kind === Kind.FRAGMENT_DEFINITION
  ) {
    const selections = node.selectionSet.selections;
    const arrayOfMaxDepths = selections.map(selection =>
      determineDepth(selection, fragments, depthSoFar, operationName)
    );

    return Math.max(...arrayOfMaxDepths);
  }

  if (node.kind === Kind.FIELD) {
    const arrayOfMaxDepths = node.selectionSet?.selections?.map(selection =>
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
}

function determineDepthStatistics(
  node: DefinitionNode | SelectionNode,
  fragments: FragmentMapping,
  depthSoFar: number,
  operationName: string
): OperationStaticsticType {
  if (
    node.kind === Kind.OPERATION_DEFINITION ||
    node.kind === Kind.INLINE_FRAGMENT ||
    node.kind === Kind.FRAGMENT_DEFINITION
  ) {
    const selections = node.selectionSet.selections;
    const arrayOfMaxDepths = selections.map(selection =>
      determineDepth(selection, fragments, depthSoFar, operationName)
    );

    return {
      sumOfMaxDepthOnAllQueries: sum(arrayOfMaxDepths),
      depthOfDeepestQuery: Math.max(...arrayOfMaxDepths),
    };
  }

  if (node.kind === Kind.FIELD) {
    const arrayOfMaxDepths =
      node.selectionSet?.selections?.map(selection =>
        determineDepth(selection, fragments, depthSoFar + 1, operationName)
      ) || [];

    return {
      sumOfMaxDepthOnAllQueries: 1 + sum(arrayOfMaxDepths),
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
      sumOfMaxDepthOnAllQueries: x,
      depthOfDeepestQuery: x,
    };
  }

  throw new Error('uh oh! depth crawler cannot handle: ' + node.kind);
}
function sum(arr: number[]): number {
  return arr.reduce((acc, cur) => acc + cur, 0);
}
