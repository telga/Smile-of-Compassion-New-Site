import { GraphQLClient } from 'graphql-request';

const hygraphClient = new GraphQLClient(process.env.REACT_APP_HYGRAPH_API_URL);

export default hygraphClient;

