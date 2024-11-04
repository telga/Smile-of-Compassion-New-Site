import { GraphQLClient } from 'graphql-request';

// Add error handling and logging for the API URL
const hygraphApiUrl = process.env.REACT_APP_HYGRAPH_API_URL;
if (!hygraphApiUrl) {
  console.error('REACT_APP_HYGRAPH_API_URL is not defined in environment variables');
}

const hygraphClient = new GraphQLClient(hygraphApiUrl || '');

export default hygraphClient;