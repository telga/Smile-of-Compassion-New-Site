import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Donate from './pages/Donate';
import { LanguageProvider } from './components/LanguageContext';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
    <LanguageProvider>
        <motion.div>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />
          </Routes>
          <Footer />
        </motion.div>
    </LanguageProvider>
    </BrowserRouter>
  );
}



export default App;
