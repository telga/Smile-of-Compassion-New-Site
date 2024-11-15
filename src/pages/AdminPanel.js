import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Card, Tabs, Tab, Box, TextField, Button, Stack, Typography, IconButton, InputAdornment, Divider  } from '@mui/material';
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
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { 
  FormatBold, 
  FormatItalic, 
  FormatUnderlined, 
  FormatListBulleted, 
  FormatListNumbered 
} from '@mui/icons-material';

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
  const [showPassword, setShowPassword] = useState(false);

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

  const handleTogglePassword = () => setShowPassword(prev => !prev);

  if (!user) {
    return (
      <Box 
        sx={{ 
          backgroundColor: colorPalette.lightBg, 
          minHeight: '100vh',
          pt: {
            xs: '100px',  // Mobile (stays the same)
            md: '220px'  // Desktop (increased to avoid header)
          }
        }}
      >
        <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ 
              p: { xs: 3, sm: 4 },
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: colorPalette.accent2,
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    mb: 1
                  }}
                >
                  Admin Login
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  Please sign in to continue
                </Typography>
              </Box>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ 
                    bgcolor: '#FFF3F3', 
                    color: '#E41749', 
                    p: 2, 
                    borderRadius: 1, 
                    mb: 3,
                    textAlign: 'center',
                    fontSize: '0.875rem'
                  }}>
                    {error}
                  </Box>
                </motion.div>
              )}

              <form onSubmit={handleLogin}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.12)',
                        },
                        '&:hover fieldset': {
                          borderColor: colorPalette.primary,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colorPalette.primary,
                        },
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePassword}
                            edge="end"
                            sx={{ 
                              color: 'rgba(0, 0, 0, 0.54)',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                              }
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.12)',
                        },
                        '&:hover fieldset': {
                          borderColor: colorPalette.primary,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: colorPalette.primary,
                        },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      py: 1.5,
                      backgroundColor: colorPalette.primary,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        backgroundColor: colorPalette.secondary,
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Sign In
                  </Button>
                </Stack>
              </form>
            </Card>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        backgroundColor: colorPalette.lightBg, 
        minHeight: '100vh',
        pt: {
          xs: '60px',  // Mobile (stays the same)
          md: '100px'  // Desktop (increased to avoid header)
        }
      }}
    >
      <Container sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              maxWidth: '1200px',
              margin: '0 auto',
              borderRadius: '16px',
              backgroundColor: colorPalette.background,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              px: 4, 
              py: 3,
              borderBottom: '1px solid rgba(0,0,0,0.06)'
            }}>
              <Typography
                variant="h5"
                sx={{
                  color: colorPalette.accent2,
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Admin Panel
              </Typography>
              <Button
                onClick={handleLogout}
                variant="outlined"
                sx={{
                  borderColor: colorPalette.accent2,
                  color: colorPalette.accent2,
                  '&:hover': {
                    backgroundColor: colorPalette.accent2,
                    color: 'white',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Logout
              </Button>
            </Box>

            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                backgroundColor: colorPalette.lightBg,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                '& .MuiTabs-indicator': {
                  backgroundColor: colorPalette.primary,
                  height: '3px',
                  borderRadius: '3px 3px 0 0'
                },
                '& .MuiTab-root': {
                  color: colorPalette.text,
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  minHeight: '56px',
                  '&.Mui-selected': {
                    color: colorPalette.primary,
                    fontWeight: 600
                  },
                  '&:hover': {
                    color: colorPalette.secondary,
                    backgroundColor: 'rgba(0,0,0,0.02)'
                  }
                }
              }}
            >
              <Tab label="Add Post" />
              <Tab label="Add Facebook Posts" />
            </Tabs>

            <Box sx={{ p: { xs: 3, md: 6 } }}>
              {activeTab === 0 && (
                <Stack spacing={4}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3, 
                      color: colorPalette.accent2,
                      fontWeight: 600 
                    }}
                  >
                    Create New Post
                  </Typography>

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
                    <div className="editor-wrapper" style={{ 
                      border: '1px solid #ccc', 
                      borderRadius: '4px', 
                      padding: '10px',
                      backgroundColor: '#fff'
                    }}>
                      <div className="editor-toolbar" style={{ 
                        borderBottom: '1px solid #eee', 
                        marginBottom: '10px', 
                        paddingBottom: '10px',
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                      }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (editorEn?.isActive('heading', { level: 1 })) {
                              editorEn?.chain().focus().setParagraph().run();
                            } else {
                              editorEn?.chain().focus().setHeading({ level: 1 }).run();
                            }
                          }}
                          color={editorEn?.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
                        >
                          H1
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (editorEn?.isActive('heading', { level: 2 })) {
                              editorEn?.chain().focus().setParagraph().run();
                            } else {
                              editorEn?.chain().focus().setHeading({ level: 2 }).run();
                            }
                          }}
                          color={editorEn?.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
                        >
                          H2
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (editorEn?.isActive('heading', { level: 3 })) {
                              editorEn?.chain().focus().setParagraph().run();
                            } else {
                              editorEn?.chain().focus().setHeading({ level: 3 }).run();
                            }
                          }}
                          color={editorEn?.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
                        >
                          H3
                        </IconButton>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <IconButton
                          size="small"
                          onClick={() => editorEn?.chain().focus().toggleBold().run()}
                          color={editorEn?.isActive('bold') ? 'primary' : 'default'}
                        >
                          <FormatBold />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editorEn?.chain().focus().toggleItalic().run()}
                          color={editorEn?.isActive('italic') ? 'primary' : 'default'}
                        >
                          <FormatItalic />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editorEn?.chain().focus().toggleUnderline().run()}
                          color={editorEn?.isActive('underline') ? 'primary' : 'default'}
                        >
                          <FormatUnderlined />
                        </IconButton>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <IconButton
                          size="small"
                          onClick={() => editorEn?.chain().focus().toggleBulletList().run()}
                          color={editorEn?.isActive('bulletList') ? 'primary' : 'default'}
                        >
                          <FormatListBulleted />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editorEn?.chain().focus().toggleOrderedList().run()}
                          color={editorEn?.isActive('orderedList') ? 'primary' : 'default'}
                        >
                          <FormatListNumbered />
                        </IconButton>
                      </div>
                      <EditorContent 
                        editor={editorEn}
                      />
                    </div>

                    <Typography variant="subtitle1">Description (Vietnamese)</Typography>
                    <div className="editor-wrapper" style={{ 
                      border: '1px solid #ccc', 
                      borderRadius: '4px', 
                      padding: '10px',
                      backgroundColor: '#fff'
                    }}>
                      <div className="editor-toolbar" style={{ 
                        borderBottom: '1px solid #eee', 
                        marginBottom: '10px', 
                        paddingBottom: '10px',
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                      }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (editorVn?.isActive('heading', { level: 1 })) {
                              editorVn?.chain().focus().setParagraph().run();
                            } else {
                              editorVn?.chain().focus().setHeading({ level: 1 }).run();
                            }
                          }}
                          color={editorVn?.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
                        >
                          H1
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (editorVn?.isActive('heading', { level: 2 })) {
                              editorVn?.chain().focus().setParagraph().run();
                            } else {
                              editorVn?.chain().focus().setHeading({ level: 2 }).run();
                            }
                          }}
                          color={editorVn?.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
                        >
                          H2
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (editorVn?.isActive('heading', { level: 3 })) {
                              editorVn?.chain().focus().setParagraph().run();
                            } else {
                              editorVn?.chain().focus().setHeading({ level: 3 }).run();
                            }
                          }}
                          color={editorVn?.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
                        >
                          H3
                        </IconButton>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <IconButton
                          size="small"
                          onClick={() => editorVn?.chain().focus().toggleBold().run()}
                          color={editorVn?.isActive('bold') ? 'primary' : 'default'}
                        >
                          <FormatBold />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editorVn?.chain().focus().toggleItalic().run()}
                          color={editorVn?.isActive('italic') ? 'primary' : 'default'}
                        >
                          <FormatItalic />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editorVn?.chain().focus().toggleUnderline().run()}
                          color={editorVn?.isActive('underline') ? 'primary' : 'default'}
                        >
                          <FormatUnderlined />
                        </IconButton>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <IconButton
                          size="small"
                          onClick={() => editorVn?.chain().focus().toggleBulletList().run()}
                          color={editorVn?.isActive('bulletList') ? 'primary' : 'default'}
                        >
                          <FormatListBulleted />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editorVn?.chain().focus().toggleOrderedList().run()}
                          color={editorVn?.isActive('orderedList') ? 'primary' : 'default'}
                        >
                          <FormatListNumbered />
                        </IconButton>
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

                  {/* Styled File Upload Buttons */}
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                        Featured Image
                      </Typography>
                      <Button
                        component="label"
                        variant="outlined"
                        sx={{
                          width: '100%',
                          height: previews.image ? 'auto' : '120px',
                          border: '2px dashed rgba(0,0,0,0.12)',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          padding: previews.image ? '0' : '20px',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            borderColor: colorPalette.primary,
                            backgroundColor: 'rgba(76, 175, 80, 0.04)',
                            '& .remove-overlay': {
                              opacity: 1
                            }
                          }
                        }}
                      >
                        {previews.image ? (
                          <>
                            <img 
                              src={previews.image} 
                              alt="Preview" 
                              style={{ 
                                width: '100%',
                                height: 'auto',
                                display: 'block'
                              }} 
                            />
                            <Box
                              className="remove-overlay"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s ease-in-out',
                              }}
                            >
                              <IconButton
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFormData(prev => ({ ...prev, image: null }));
                                  setPreviews(prev => ({ ...prev, image: null }));
                                }}
                                sx={{ color: 'white' }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          </>
                        ) : (
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center'
                          }}>
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                              Drop your image here, or click to browse
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              (Supports: JPG, PNG, WebP)
                            </Typography>
                          </Box>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'image')}
                          style={{ display: 'none' }}
                        />
                      </Button>
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                        Additional Images
                      </Typography>
                      <Box sx={{ 
                        border: '2px dashed rgba(0,0,0,0.12)',
                        borderRadius: 2,
                        p: 2,
                        '&:hover': {
                          borderColor: colorPalette.primary,
                          backgroundColor: 'rgba(76, 175, 80, 0.04)'
                        }
                      }}>
                        {previews.images.length > 0 && (
                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: 2,
                            mb: 2
                          }}>
                            {previews.images.map((preview, index) => (
                              <Box
                                key={index}
                                sx={{
                                  position: 'relative',
                                  paddingTop: '100%', // 1:1 Aspect ratio
                                  borderRadius: 1,
                                  overflow: 'hidden'
                                }}
                              >
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                                <IconButton
                                  onClick={() => {
                                    const newImages = [...formData.images];
                                    newImages.splice(index, 1);
                                    setFormData(prev => ({ ...prev, images: newImages }));
                                    
                                    const newPreviews = [...previews.images];
                                    URL.revokeObjectURL(newPreviews[index]);
                                    newPreviews.splice(index, 1);
                                    setPreviews(prev => ({ ...prev, images: newPreviews }));
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: 'rgba(0,0,0,0.7)'
                                    },
                                    padding: '4px',
                                    '& .MuiSvgIcon-root': {
                                      fontSize: '1rem'
                                    }
                                  }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                        <Button
                          component="label"
                          variant="outlined"
                          fullWidth
                          sx={{
                            height: '120px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            border: 'none',
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.04)',
                              border: 'none'
                            }
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center'
                          }}>
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                              Drop multiple images here, or click to browse
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              (Supports: JPG, PNG, WebP)
                            </Typography>
                          </Box>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileChange(e, 'images')}
                            style={{ display: 'none' }}
                          />
                        </Button>
                      </Box>
                    </Box>
                  </Stack>

                  {/* Submit Button */}
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                      mt: 4,
                      py: 1.5,
                      backgroundColor: colorPalette.primary,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        backgroundColor: colorPalette.secondary,
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Publish Post
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
    </Box>
  );
}

export default AdminPanel;