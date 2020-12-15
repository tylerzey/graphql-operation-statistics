import { getGraphQLQueryStats as getGraphQLDocumentQueryStats, createDocument } from '../src';

describe('detects the depth of graphQL operations', () => {
  describe('queries', () => {
    it('detects the deepest selection for a single query', () => {
      const { read } = getGraphQLDocumentQueryStats(
        `query read {
          version
          user {
            name
          }
      }`
      );
      expect(read.depthOfDeepestQuery).toBe(2);
      expect(read.sumOfMaxDepthOnAllQueries).toBe(3);
    });

    it('detects the deepest selection of multiple queries', () => {
      const { read } = getGraphQLDocumentQueryStats(
        `query read {
          matt: user(name: "matt") {
            email
          }
         andy: user(name: "andy") {
           email
           address {
             city
           }
           pets {
             name
             owner {
               name
             }
           }
         }
      }`
      );
      expect(read.depthOfDeepestQuery).toBe(4);
      expect(read.sumOfMaxDepthOnAllQueries).toBe(6);
    });

    it('works without names', () => {
      const response = getGraphQLDocumentQueryStats(
        `query {
          user {
            email
        }
      }`
      );
      expect(response['unnamedOperation1'].depthOfDeepestQuery).toBe(2);
    });

    it('works with graphQL documents', () => {
      const response = getGraphQLDocumentQueryStats(
        createDocument(`query {
          user {
            email
        }
      }`)
      );
      expect(response['unnamedOperation1'].depthOfDeepestQuery).toBe(2);
    });

    it('works with fragments', () => {
      const response = getGraphQLDocumentQueryStats(
        `query read0 {
        ... on Query {
         version
        }
      }`
      );
      expect(response['read0'].depthOfDeepestQuery).toBe(1);
    });

    it('works without the query name', () => {
      const response = getGraphQLDocumentQueryStats(
        `{
        user {
          pets {
            owner {
              pets {
                owner {
                  pets {
                    name
                  }
                }
              }
            }
          }
        }
      }`
      );
      expect(response['unnamedOperation1'].depthOfDeepestQuery).toBe(7);
      expect(response['unnamedOperation1'].sumOfMaxDepthOnAllQueries).toBe(7);
    });
  });

  describe('mutations', () => {
    it('detects the deepest selection for a single query', () => {
      const response = getGraphQLDocumentQueryStats(
        `mutation(
          $organizationId: String!
        ) {
          patch(
            organizationId: $organizationId
          ) {
            metadata {
              organizationId
            }
          }
        }`
      );

      expect(response['unnamedOperation1'].depthOfDeepestQuery).toBe(3);
      expect(response['unnamedOperation1'].sumOfMaxDepthOnAllQueries).toBe(3);
    });
  });
});
