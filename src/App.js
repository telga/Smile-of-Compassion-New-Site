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
import AdminPanel from './pages/AdminPanel';
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
  onError: (error) => {
    console.error('Apollo Client Error:', error);
  }
});

// Main App component: Sets up routing and global providers
function App() {
  return (
    <ApolloProvider client={client}>
      <LanguageProvider>
        <I18nextProvider i18n={i18n}>
          <Router basename="/">
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
    window.history.scrollRestoration = 'manual';
    
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    resetScroll();
    const timeoutId = setTimeout(resetScroll, 0);
    
    return () => clearTimeout(timeoutId);
  }, [location]);

  return (
    <ErrorBoundary>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onAnimationStart={() => {
          window.scrollTo(0, 0);
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
        }}
      >
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        <Footer />
      </motion.div>
    </ErrorBoundary>
  );
}

// Add this class
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Error: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

export default App;
