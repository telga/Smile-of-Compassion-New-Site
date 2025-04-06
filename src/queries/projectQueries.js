//import { gql } from 'graphql-request';
import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjects($language: Locale!, $stage: Stage = PUBLISHED) {
    projects(orderBy: date_DESC, stage: $stage) {
      id
      title
      date
      slug
      stage
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

export const GET_DRAFTS = gql`
  query GetDrafts($language: Locale!, $first: Int = 100) {
    projects(
      where: { stage: DRAFT }, 
      orderBy: date_DESC,
      first: $first
    ) {
      id
      title
      date
      slug
      stage
      image {
        url
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

export const GET_PUBLISHED = gql`
  query GetPublished($language: Locale!, $first: Int = 100) {
    projects(
      where: { stage: PUBLISHED }, 
      orderBy: date_DESC,
      first: $first
    ) {
      id
      title
      date
      slug
      stage
      image {
        url
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