import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httplink = createHttpLink({
    uri: 'https://sunny-gorilla-88.hasura.app/v1/graphql',
    credentials: 'same-origin',
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        "x-hasura-admin-secret" : 'X4Hh7kQrymAVxjnw17S6e7n0PChHGbfhV2AgjqnL50aJG5u78zvcgr0no0cSCtbt'
      }
    }
  });

const client = new ApolloClient({
    link: authLink.concat(httplink),
    cache: new InMemoryCache()
});

export default client;
