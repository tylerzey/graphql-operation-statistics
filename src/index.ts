import type { DocumentNode } from 'graphql';

import { createDocument } from './lib/createDocument';
import type { DocumentQueryStatsResponse } from './lib/types';
import { getFragments } from './lib/getFragments';
import { getQueryAndMutationOperations } from './lib/getQueryAndMutationOperations';
import { determineDepthStatistics } from './lib/determineDepthStatistics';

export const getGraphQLTotalQueryDepth = (
  document: DocumentNode | string
): number => {
  return Object.entries(getGraphQLQueryStatsByOperation(document)).reduce(
    (acc, [, val]) => {
      return acc + val.totalDepthOfQuery;
    },
    0
  );
};

export const getGraphQLQueryStatsByOperation = (
  document: DocumentNode | string
): DocumentQueryStatsResponse => {
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
};

export { createDocument };
