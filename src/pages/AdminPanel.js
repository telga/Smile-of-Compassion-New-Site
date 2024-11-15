import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Card, Tabs, Tab, Box } from '@mui/material';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (error) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const colorPalette = {
    primary: '#4CAF50',
    secondary: '#2E7D32',
    accent1: '#81C784',
    accent2: '#173F5F',
    background: '#FFFFFF',
    text: '#1A1A1A',
    lightBg: '#F5F8F5',
  };

  if (!user) {
    return (
      <div style={{ backgroundColor: colorPalette.lightBg, minHeight: '100vh', paddingTop: '80px' }}>
        <Container sx={{ py: 6 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ maxWidth: '400px', margin: '0 auto', p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <h2>Admin Login</h2>
              </Box>
              {error && (
                <Box sx={{ color: 'error.main', mb: 2, textAlign: 'center' }}>
                  {error}
                </Box>
              )}
              <form onSubmit={handleLogin}>
                <Box sx={{ mb: 2 }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '10px',
                    }}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    style={{
                      width: '100%',
                      padding: '8px',
                    }}
                  />
                </Box>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: colorPalette.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Login
                </button>
              </form>
            </Card>
          </motion.div>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colorPalette.lightBg, minHeight: '100vh', paddingTop: '80px' }}>
      <Container sx={{ py: 6 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              maxWidth: '1200px',
              margin: '0 auto',
              borderRadius: '12px',
              backgroundColor: colorPalette.background,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 4, py: 2 }}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  color: colorPalette.accent2,
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Admin Panel
              </Box>
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  backgroundColor: colorPalette.accent2,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </Box>

            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                backgroundColor: colorPalette.lightBg,
                '& .MuiTab-root': {
                  color: colorPalette.text,
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  '&.Mui-selected': {
                    color: colorPalette.primary,
                    fontWeight: 600
                  },
                  '&:hover': {
                    color: colorPalette.secondary
                  }
                }
              }}
            >
              <Tab label="Add Post" />
              <Tab label="Add Facebook Posts" />
            </Tabs>

            <Box sx={{ p: 6 }}>
              {activeTab === 0 && (
                <div>
                  {/* Add Post content will go here */}
                </div>
              )}
              {activeTab === 1 && (
                <div>
                  {/* Add Facebook Posts content will go here */}
                </div>
              )}
            </Box>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}

export default AdminPanel;
