import type { DocumentNode } from 'graphql';
import { parse, Source } from 'graphql';

export const createDocument = (query: string): DocumentNode => {
  const source = new Source(query, 'GraphQL request');
  return parse(source);
};
