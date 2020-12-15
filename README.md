# GraphQL Operation Statistics

A simple, un-opinionated, zero-dependency way to implement rate limiting in GraphQL. The package inspects your queries and reports the total depth. You then decide what to do with that information.

[![Blazing Fast](https://badgen.now.sh/badge/speed/blazing%20%F0%9F%94%A5/green)](https://www.npmjs.com/package/graphql-operation-statistics) [![Blazing Fast](https://badgen.now.sh/badge/speed/blazing%20%F0%9F%94%A5/green)](https://www.npmjs.com/package/graphql-operation-statistics) [![Blazing Fast](https://badgen.now.sh/badge/speed/blazing%20%F0%9F%94%A5/green)](https://www.npmjs.com/package/graphql-operation-statistics)

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

## Install

```
yarn add graphql-operation-statistics

npm i graphql-operation-statistics
```

## Usage

```js
// Example 1
import { getGraphQLQueryStats } from 'graphql-operation-statistics';
const stats = getGraphQLQueryStats(
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
expect(stats['Users'].depthOfDeepestQuery).toBe(7);
expect(stats['Users'].sumOfMaxDepthOnAllQueries).toBe(7);
```

```js
// Example 2
import { getGraphQLQueryStats } from 'graphql-operation-statistics';
const { query } = JSON.parse(body);
try {
  const stats = getGraphQLQueryStats(query);

  for (const operationName of Object.keys(stats)) {
    console.log(
      `${operationName} - total depth: ${stats[operationName].sumOfMaxDepthOnAllQueries} deepest query: ${stats[operationName].depthOfDeepestQuery}`
    );
  }
} catch (error) {
  console.error('The query passed in is not a valid', query);
}
```

```js
// Example 3
import { getGraphQLQueryStats } from 'graphql-operation-statistics';
const response = getGraphQLQueryStats(
  `mutation($id: String!) { patch(id: $id) { metadata { id } } }`
);

expect(response['unnamedOperation1'].depthOfDeepestQuery).toBe(3);
expect(response['unnamedOperation1'].sumOfMaxDepthOnAllQueries).toBe(3);
```

## Notes

If your operations do not have names, the function will return `unnamedOperation1` where `1` increments for each unnamed operation.

This package does not care if you use Apollo Server, Serverless GraphQL, or anything else. You could even use it on the frontend if you wanted to inspect queries before sending them off.

```

```
