//import { gql } from 'graphql-request';


//convert mod queries to aws.

//CALLUM TASK
import { gql } from '@apollo/client';

//!!Add a query that allows a non-merchant text field to be sent to donationsdata scheme.
//Could use old query and add the message field or make a new query to setup a fallback just in case of a failure in testing.

export const GET_PROJECTS = gql`
  query GetProjects($language: Locale!, $first: Int = 100, $skip: Int = 0) {
    projects(
      orderBy: date_DESC,
      first: $first,
      skip: $skip
    ) {
      id
      title
      date
      slug
      image {
        url
        localizations(locales: [en]) {
          locale
          url
        }
      }
      localizations(locales: [$language]) {
        locale
        title
        slug
        description {
          raw
        }
      }
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!, $language: Locale!) {
    project(where: { id: $id }) {
      id
      title
      description {
        raw
      }
      date
      slug
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
      localizations(locales: [$language]) {
        locale
        title
        slug
        description {
          raw
        }
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

export const GET_ALL_DONATIONS = gql`
  query GetAllDonations {
    donations(stage: DRAFT) {
      id
      donationDate
      donationAmount
      firstName
      lastName
      email
      fullAddress
    }
  }
`;