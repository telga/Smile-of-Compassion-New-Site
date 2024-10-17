import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Contact from './pages/Contact';
import Donate from './pages/Donate';
import { LanguageProvider } from './components/LanguageContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from "@apollo/client/link/error";

// Create Apollo Client using the environment variable
const httpLink = createHttpLink({
  uri: 'https://us-west-2.cdn.hygraph.com/content/cm291myyd01dw07w3rz3gvofh/master',
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    }
  }
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
  console.log('GraphQL Operation:', operation);
});

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
});

// Main App component: Sets up routing and global providers
function App() {
  return (
    <ApolloProvider client={client}>
      <LanguageProvider>
        {/* Provide i18n instance to the app for internationalization */}
        <I18nextProvider i18n={i18n}>
          {/* Set up routing with a custom basename for GitHub Pages deployment */}
          <Router basename="/Smile-of-Compassion-New-Site">
            {/* Wrap the entire app content in a motion.div for potential animations */}
            <motion.div>
              {/* Global header component */}
              <Header />
              {/* Define routes for different pages */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/donate" element={<Donate />} />
              </Routes>
              {/* Global footer component */}
              <Footer />
            </motion.div>
          </Router>
        </I18nextProvider>
      </LanguageProvider>
    </ApolloProvider>
  );
}

export default App;
