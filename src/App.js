import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
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
  uri: process.env.REACT_APP_HYGRAPH_API_URL,
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

// Define the base path
const BASE_PATH = '/Smile-of-Compassion-New-Site';

// Main App component: Sets up routing and global providers
function App() {
  return (
    <ApolloProvider client={client}>
      <LanguageProvider>
        <I18nextProvider i18n={i18n}>
          <Router>
            <AppContent />
          </Router>
        </I18nextProvider>
      </LanguageProvider>
    </ApolloProvider>
  );
}

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleLinkClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.getAttribute('href').startsWith('/')) {
        e.preventDefault();
        let path = link.getAttribute('href');
        
        // Remove BASE_PATH from the beginning of the path if it's there
        if (path.startsWith(BASE_PATH)) {
          path = path.slice(BASE_PATH.length);
        }
        
        // Construct the full path
        const fullPath = `${window.location.origin}${BASE_PATH}${path}`;
        
        window.location.href = fullPath;
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  // Remove BASE_PATH from the beginning of location.pathname
  const currentPath = location.pathname.startsWith(BASE_PATH) 
    ? location.pathname.slice(BASE_PATH.length) 
    : location.pathname;

  return (
    <motion.div>
      <Header />
      <Routes>
        <Route path={`${BASE_PATH}/`} element={<Home />} />
        <Route path={`${BASE_PATH}/about`} element={<About />} />
        <Route path={`${BASE_PATH}/projects`} element={<Projects />} />
        <Route path={`${BASE_PATH}/projects/:id`} element={<ProjectDetail />} />
        <Route path={`${BASE_PATH}/contact`} element={<Contact />} />
        <Route path={`${BASE_PATH}/donate`} element={<Donate />} />
        {/* Catch-all route to redirect to home page */}
        <Route path="*" element={<Navigate to={`${BASE_PATH}/`} replace />} />
      </Routes>
      <Footer />
    </motion.div>
  );
}

export default App;
