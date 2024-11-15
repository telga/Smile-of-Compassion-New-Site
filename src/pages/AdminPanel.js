import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Card, Tabs, Tab, Box, TextField, Button, Stack, Typography, IconButton } from '@mui/material';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Highlight from '@tiptap/extension-highlight';
import CloseIcon from '@mui/icons-material/Close';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    titleEn: '',
    titleVn: '',
    descriptionEn: '',
    descriptionVn: '',
    date: null,
    image: null,
    images: []
  });
  const [previews, setPreviews] = useState({
    image: null,
    images: []
  });

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event, field) => {
    if (field === 'image') {
      const file = event.target.files[0];
      if (file) {
        setFormData(prev => ({ ...prev, image: file }));
        setPreviews(prev => ({ 
          ...prev, 
          image: URL.createObjectURL(file)
        }));
      }
    } else if (field === 'images') {
      const files = Array.from(event.target.files);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
      setPreviews(prev => ({ 
        ...prev, 
        images: [...prev.images, ...files.map(file => URL.createObjectURL(file))]
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (previews.image) URL.revokeObjectURL(previews.image);
      previews.images.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleSubmit = async () => {
    console.log('Form data to be sent:', formData);
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

  // Create editors for both languages
  const editorEn = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    onUpdate: ({ editor }) => {
      handleInputChange('descriptionEn', editor.getJSON());
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        if (!(event.ctrlKey || event.metaKey)) {
          return false;
        }
        
        switch (event.key) {
          case 'b':
            event.preventDefault();
            editorEn?.chain().focus().toggleBold().run();
            return true;
          case 'i':
            event.preventDefault();
            editorEn?.chain().focus().toggleItalic().run();
            return true;
          case 'u':
            event.preventDefault();
            editorEn?.chain().focus().toggleUnderline().run();
            return true;
          default:
            return false;
        }
      },
    },
  });

  const editorVn = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    onUpdate: ({ editor }) => {
      handleInputChange('descriptionVn', editor.getJSON());
    },
  });

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
                <Stack spacing={4}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Add New Post</Typography>
                  
                  {/* Title Fields */}
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      label="Title (English)"
                      value={formData.titleEn}
                      onChange={(e) => handleInputChange('titleEn', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Title (Vietnamese)"
                      value={formData.titleVn}
                      onChange={(e) => handleInputChange('titleVn', e.target.value)}
                    />
                  </Stack>

                  {/* Description Fields */}
                  <Stack spacing={2}>
                    <Typography variant="subtitle1">Description (English)</Typography>
                    <div className="editor-wrapper" style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
                      <div className="editor-toolbar" style={{ borderBottom: '1px solid #eee', marginBottom: '10px', paddingBottom: '10px' }}>
                        <Button
                          size="small"
                          onClick={() => editorEn?.chain().focus().toggleHeading({ level: 1 }).run()}
                          className={editorEn?.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                        >
                          H1
                        </Button>
                        <Button
                          size="small"
                          onClick={() => editorEn?.chain().focus().toggleHeading({ level: 2 }).run()}
                          className={editorEn?.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                        >
                          H2
                        </Button>
                        <Button
                          size="small"
                          onClick={() => editorEn?.chain().focus().toggleHeading({ level: 3 }).run()}
                          className={editorEn?.isActive('heading', { level: 3 }) ? 'is-active' : ''}
                        >
                          H3
                        </Button>
                        <Button
                          size="small"
                          onClick={() => editorEn?.chain().focus().toggleBold().run()}
                          className={editorEn?.isActive('bold') ? 'is-active' : ''}
                        >
                          Bold
                        </Button>
                        <Button
                          size="small"
                          onClick={() => editorEn?.chain().focus().toggleItalic().run()}
                          className={editorEn?.isActive('italic') ? 'is-active' : ''}
                        >
                          Italic
                        </Button>
                        <Button
                          size="small"
                          onClick={() => editorEn?.chain().focus().toggleUnderline().run()}
                          className={editorEn?.isActive('underline') ? 'is-active' : ''}
                        >
                          Underline
                        </Button>
                        <Button
                          size="small"
                          onClick={() => editorEn?.chain().focus().toggleHighlight().run()}
                          className={editorEn?.isActive('highlight') ? 'is-active' : ''}
                        >
                          Highlight
                        </Button>
                      </div>
                      <EditorContent editor={editorEn} />
                    </div>

                    <Typography variant="subtitle1">Description (Vietnamese)</Typography>
                    <div className="editor-wrapper" style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
                      <div className="editor-toolbar" style={{ borderBottom: '1px solid #eee', marginBottom: '10px', paddingBottom: '10px' }}>
                        <Button
                          size="small"
                          onClick={() => editorVn?.chain().focus().toggleHeading({ level: 1 }).run()}
                          className={editorVn?.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                        >
                          H1
                        </Button>
                        <Button
                          size="small"
                          onClick={() => editorVn?.chain().focus().toggleHeading({ level: 2 }).run()}
                          className={editorVn?.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                        >
                          H2
                        </Button>
                        <Button
                          size="small"
                          onClick={() => editorVn?.chain().focus().toggleHeading({ level: 3 }).run()}
                          className={editorVn?.isActive('heading', { level: 3 }) ? 'is-active' : ''}
                        >
                          H3
                        </Button>
                        <Button
                          size="small"
                          onClick={() => editorVn?.chain().focus().toggleBold().run()}
                          className={editorVn?.isActive('bold') ? 'is-active' : ''}
                        >
                          Bold
                        </Button>
                        <Button
                          size="small"
                          onClick={() => editorVn?.chain().focus().toggleItalic().run()}
                          className={editorVn?.isActive('italic') ? 'is-active' : ''}
                        >
                          Italic
                        </Button>
                        <Button
                          size="small"
                          onClick={() => editorVn?.chain().focus().toggleUnderline().run()}
                          className={editorVn?.isActive('underline') ? 'is-active' : ''}
                        >
                          Underline
                        </Button>
                      </div>
                      <EditorContent editor={editorVn} />
                    </div>
                  </Stack>

                  {/* Date Picker */}
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Date</Typography>
                    <DatePicker
                      selected={formData.date}
                      onChange={(date) => handleInputChange('date', date)}
                      dateFormat="dd-MM-yyyy"
                      className="form-control"
                      wrapperClassName="datePicker"
                      customInput={
                        <input
                          style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '100%'
                          }}
                        />
                      }
                    />
                  </Stack>

                  {/* Single Image Upload */}
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Featured Image</Typography>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'image')}
                      style={{ 
                        '::file-selector-button': { marginRight: 0 },
                        color: 'transparent'
                      }}
                    />
                    {previews.image && (
                      <Box sx={{ mt: 2, position: 'relative' }}>
                        <img 
                          src={previews.image} 
                          alt="Preview" 
                          style={{ 
                            maxWidth: '200px', 
                            maxHeight: '200px', 
                            objectFit: 'contain',
                            borderRadius: '4px'
                          }} 
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                          }}
                          onClick={() => {
                            const fileInput = document.querySelector('input[type="file"]:not([multiple])');
                            if (fileInput) fileInput.value = '';
                            
                            setFormData(prev => ({ ...prev, image: null }));
                            setPreviews(prev => ({ ...prev, image: null }));
                          }}
                        >
                          <CloseIcon sx={{ color: 'white', fontSize: '1rem' }} />
                        </IconButton>
                      </Box>
                    )}
                  </Stack>

                  {/* Multiple Images Upload */}
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">
                      Additional Images {formData.images.length > 0 && `(${formData.images.length} files)`}
                    </Typography>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'images')}
                      style={{ 
                        '::file-selector-button': { marginRight: 0 },
                        color: 'transparent'  // This hides the "no file selected" text
                      }}
                    />
                    {previews.images.length > 0 && (
                      <Box sx={{ 
                        mt: 2, 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 2 
                      }}>
                        {previews.images.map((preview, index) => (
                          <Box key={index} sx={{ position: 'relative' }}>
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`} 
                              style={{ 
                                width: '150px', 
                                height: '150px', 
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }} 
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                              }}
                              onClick={() => {
                                const newImages = formData.images.filter((_, i) => i !== index);
                                const newPreviews = previews.images.filter((_, i) => i !== index);
                                
                                if (newImages.length === 0) {
                                  const fileInput = document.querySelector('input[type="file"][multiple]');
                                  if (fileInput) fileInput.value = '';
                                }
                                
                                setFormData(prev => ({ ...prev, images: newImages }));
                                setPreviews(prev => ({ ...prev, images: newPreviews }));
                              }}
                            >
                              <CloseIcon sx={{ color: 'white', fontSize: '1rem' }} />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Stack>

                  {/* Submit Button */}
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                      backgroundColor: colorPalette.primary,
                      '&:hover': {
                        backgroundColor: colorPalette.secondary,
                      },
                    }}
                  >
                    Send to Hygraph
                  </Button>
                </Stack>
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
