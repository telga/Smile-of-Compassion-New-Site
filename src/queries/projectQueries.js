//import { gql } from 'graphql-request';
import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjects($language: Locale!) {
    projects(orderBy: date_DESC) {
      id
      title
      date
      image {
        url
        localizations(locales: [en]) {
          locale
          url
        }
      }
      localizations(locales: [$language]) {
        title
      }
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!, $language: Locale!) {
    project(where: { id: $id }, locales: [$language]) {
      id
      title
      description {
        raw
      }
      date
      image {
        url
        width
        height
      }
      images {
        url
        width
        height
      }
    }
  }
`;

export const SEARCH_PROJECTS = gql`
  query SearchProjects($searchTerm: String!, $language: Locale!) {
    projects(where: { title_contains: $searchTerm }, locales: [$language]) {
      id
      title
      date
    }
  }
`;