# GraphQL Operation Statistics

GraphQL presents some interesting issues with rate limiting.

In a typical REST setup, you can simply rate limit by the number of requests sent to your server.

But, a GraphQL query can look like this:

```
query {
  user1: user(name: "matt") {
    email
  }
  user2: user(name: "andy") {
    pets {
      name
      owner {
        name
      }
    }
  }
  user3: user(name: "andy") {
    pets {
      name
      user {
        name
        pets {
          name
          user {
            name
            pets {
              name
              ...etc
            }
          }
        }
      }
    }
  }
}
```

This query not only sends 3 separate user lookups. It allow exposes the ability to recursively call nested resources.

GraphQL Operation Statistics gives you information about the query you are about to execute.

You simply pass it the query string and it returns the depthOfDeepestQuery and sumOfMaxDepthOnAllQueries for each operation.

Example:

```js
import { getGraphQLQueryStats } from 'graphql-operation-statistics';
const response = getGraphQLQueryStats(
  `query Users {
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
expect(response['Users'].depthOfDeepestQuery).toBe(7);
expect(response['Users'].sumOfMaxDepthOnAllQueries).toBe(7);

const response = getGraphQLQueryStats(
  `mutation($id: String!) {
    patch(id: $id) {
      metadata {
        id
      }
    }
  }`
);

expect(response['unnamedOperation1'].depthOfDeepestQuery).toBe(3);
expect(response['unnamedOperation1'].sumOfMaxDepthOnAllQueries).toBe(3);
```

## Notes

If your operations do not have names, the function will return `unnamedOperation1` where `1` increments for each unnamed operation.

This package does not care if you use Apollo Server, Serverless GraphQL, or anything else. You could even use it on the frontend if you wanted to inspect queries before sending them off.
