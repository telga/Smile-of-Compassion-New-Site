import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container, Card, Tabs, Tab, Box, TextField, Button, Stack, Typography, IconButton, InputAdornment, Divider, Alert, Snackbar, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [drafts, setDrafts] = useState([]);
  const [selectedDrafts, setSelectedDrafts] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  const editEditorEn = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });
  const editEditorVn = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
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

  const publishMutation = `
    mutation PublishProject($where: ProjectWhereUniqueInput!) {
      publishProject(where: $where) {
        id
      }
    }
  `;

  const handleSubmit = async (shouldPublish = false) => {
    console.log('Starting form submission...');
    
    // Validation
    if (!formData.titleEn || !formData.titleVn || !formData.date) {
      console.error('Form validation failed: Missing required fields');
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields (titles and date)',
        severity: 'error'
      });
      return;
    }

    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      // Create project with both English and Vietnamese content
      const createMutation = `
        mutation CreateProject(
          $titleEn: String!, 
          $descriptionEn: RichTextAST!, 
          $titleVn: String!, 
          $descriptionVn: RichTextAST!, 
          $date: Date!
        ) {
          createProject(
            data: {
              title: $titleEn
              description: $descriptionEn
              date: $date
              localizations: {
                create: [
                  { 
                    locale: vn, 
                    data: { 
                      title: $titleVn,
                      description: $descriptionVn
                    } 
                  }
                ]
              }
            }
          ) {
            id
            title
            description {
              raw
            }
            date
            localizations {
              locale
              title
              description {
                raw
              }
            }
          }
        }
      `;

      // Create the draft first
      const response = await fetch(hygraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: createMutation,
          variables: {
            titleEn: formData.titleEn,
            descriptionEn: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: editorEn.getText()
                    }
                  ]
                }
              ]
            },
            titleVn: formData.titleVn,
            descriptionVn: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: editorVn.getText()
                    }
                  ]
                }
              ]
            },
            date: formData.date.toISOString().split('T')[0]
          }
        })
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(`Failed to create project: ${result.errors[0].message}`);
      }

      // If shouldPublish is true, publish the project
      if (shouldPublish) {
        const publishResponse = await fetch(hygraphUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            query: publishMutation,
            variables: {
              id: result.data.createProject.id
            }
          })
        });

        const publishResult = await publishResponse.json();
        
        if (publishResult.errors) {
          throw new Error(`Failed to publish project: ${publishResult.errors[0].message}`);
        }
      }

      // Clear form and show success message
      setFormData({
        titleEn: '',
        titleVn: '',
        descriptionEn: '',
        descriptionVn: '',
        date: null,
        image: null,
        images: []
      });
      
      // Clear editors
      if (editorEn) editorEn.commands.setContent('');
      if (editorVn) editorVn.commands.setContent('');

      setSnackbar({
        open: true,
        message: shouldPublish ? 'Post published successfully!' : 'Draft saved successfully!',
        severity: 'success'
      });

    } catch (error) {
      console.error('Error details:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${shouldPublish ? 'publish' : 'save'} post: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
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

  const fetchDrafts = async () => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      // Verify URL and token
      if (!hygraphUrl || !authToken) {
        throw new Error('Missing Hygraph configuration');
      }

      console.log('Fetching from:', hygraphUrl); // Debug URL

      const getDraftsQuery = `
        query GetAllProjects {
          draftProjects: projects(stage: DRAFT) {
            id
            title
            date
            description {
              raw
            }
            localizations {
              locale
              title
              description {
                raw
              }
            }
          }
          publishedProjects: projects(stage: PUBLISHED) {
            id
          }
        }
      `;

      // Add timeout and retry logic
      const fetchWithTimeout = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(hygraphUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({
                query: getDraftsQuery
              }),
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
          } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between retries
          }
        }
      };

      const result = await fetchWithTimeout();
      
      if (result.errors) {
        console.error('GraphQL Errors:', result.errors);
        throw new Error(`Failed to fetch drafts: ${result.errors[0].message}`);
      }

      // Filter out drafts that are also in published
      const publishedIds = new Set(result.data.publishedProjects.map(p => p.id));
      const trueDrafts = result.data.draftProjects.filter(draft => !publishedIds.has(draft.id));

      console.log('All drafts:', result.data.draftProjects);
      console.log('Published:', result.data.publishedProjects);
      console.log('True drafts:', trueDrafts);
      
      setDrafts(trueDrafts);

    } catch (error) {
      console.error('Error fetching drafts:', error);
      setSnackbar({
        open: true,
        message: `Failed to fetch drafts: ${error.message}. Please check your network connection and try again.`,
        severity: 'error'
      });
    }
  };

  const publishSelectedDrafts = async () => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      const publishMutation = `
        mutation PublishProject($where: ProjectWhereUniqueInput!) {
          publishProject(where: $where) {
            id
            title
            date
          }
        }
      `;

      // Track successful and failed publishes
      const results = await Promise.all(
        selectedDrafts.map(async (draftId) => {
          try {
            const response = await fetch(hygraphUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({
                query: publishMutation,
                variables: {
                  where: {
                    id: draftId
                  }
                }
              })
            });

            const result = await response.json();
            if (result.errors) {
              throw new Error(result.errors[0].message);
            }
            return { success: true, id: draftId };
          } catch (error) {
            return { success: false, id: draftId, error: error.message };
          }
        })
      );

      // Check for any failures
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        throw new Error(`Failed to publish some drafts: ${failures.map(f => f.error).join(', ')}`);
      }

      setSnackbar({
        open: true,
        message: 'Selected drafts published successfully!',
        severity: 'success'
      });

      setSelectedDrafts([]);
      fetchDrafts();
    } catch (error) {
      console.error('Error publishing drafts:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleEditDraft = (draft) => {
    setEditingDraft({
      id: draft.id,
      titleEn: draft.title,
      titleVn: draft.localizations?.[0]?.title || '',
      date: new Date(`${draft.date}T12:00:00`),
      descriptionEn: draft.description.raw,
      descriptionVn: draft.localizations?.[0]?.description?.raw || ''
    });

    // Wait for editors to be ready
    setTimeout(() => {
      if (editEditorEn && draft.description.raw) {
        const enContent = {
          type: 'doc',
          content: [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: draft.description.raw.children[0].children[0].text || ''
            }]
          }]
        };
        editEditorEn.commands.setContent(enContent);
      }

      if (editEditorVn && draft.localizations?.[0]?.description?.raw) {
        const vnContent = {
          type: 'doc',
          content: [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: draft.localizations[0].description.raw.children[0].children[0].text || ''
            }]
          }]
        };
        editEditorVn.commands.setContent(vnContent);
      }
    }, 0);

    setEditModalOpen(true);
  };

  const handleUpdateDraft = async (shouldPublish = false) => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      const updateMutation = `
        mutation UpdateProject($where: ProjectWhereUniqueInput!, $data: ProjectUpdateInput!) {
          updateProject(
            where: $where
            data: $data
          ) {
            id
            title
            description {
              raw
            }
            date
            localizations {
              locale
              title
              description {
                raw
              }
            }
          }
        }
      `;

      // Transform editor content to match Hygraph's rich text format
      const formatRichText = (editor) => {
        const content = editor.getJSON();
        return {
          children: content.content.map(node => {
            if (node.type === 'heading') {
              return {
                type: 'heading',
                level: node.attrs.level,
                children: node.content.map(child => ({
                  type: child.type,
                  text: child.text,
                  ...(child.marks && { marks: child.marks })
                }))
              };
            }
            if (node.type === 'bulletList') {
              return {
                type: 'bulletList',
                children: node.content.map(listItem => ({
                  type: 'listItem',
                  children: listItem.content.map(child => ({
                    type: child.type,
                    children: child.content.map(textNode => ({
                      type: textNode.type,
                      text: textNode.text,
                      ...(textNode.marks && { marks: textNode.marks })
                    }))
                  }))
                }))
              };
            }
            if (node.type === 'orderedList') {
              return {
                type: 'orderedList',
                children: node.content.map(listItem => ({
                  type: 'listItem',
                  children: listItem.content.map(child => ({
                    type: child.type,
                    children: child.content.map(textNode => ({
                      type: textNode.type,
                      text: textNode.text,
                      ...(textNode.marks && { marks: textNode.marks })
                    }))
                  }))
                }))
              };
            }
            // Default paragraph handling
            return {
              type: 'paragraph',
              children: node.content?.map(child => ({
                type: child.type,
                text: child.text,
                ...(child.marks && { marks: child.marks })
              })) || []
            };
          })
        };
      };

      const descriptionEn = formatRichText(editEditorEn);
      const descriptionVn = formatRichText(editEditorVn);

      const response = await fetch(hygraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: updateMutation,
          variables: {
            where: {
              id: editingDraft.id
            },
            data: {
              title: editingDraft.titleEn,
              description: descriptionEn,
              date: editingDraft.date.toISOString().split('T')[0],
              localizations: {
                update: [{
                  locale: "vn",
                  data: {
                    title: editingDraft.titleVn,
                    description: descriptionVn
                  }
                }]
              }
            }
          }
        })
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(`Failed to update draft: ${result.errors[0].message}`);
      }

      if (shouldPublish) {
        const publishMutation = `
          mutation PublishProject($where: ProjectWhereUniqueInput!) {
            publishProject(where: $where) {
              id
              title
              date
            }
          }
        `;

        const publishResponse = await fetch(hygraphUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            query: publishMutation,
            variables: {
              where: {
                id: editingDraft.id
              }
            }
          })
        });

        const publishResult = await publishResponse.json();
        if (publishResult.errors) {
          throw new Error(`Failed to publish: ${publishResult.errors[0].message}`);
        }
      }

      setSnackbar({
        open: true,
        message: shouldPublish ? 'Draft updated and published!' : 'Draft updated successfully!',
        severity: 'success'
      });

      setEditModalOpen(false);
      setEditingDraft(null);
      fetchDrafts();
    } catch (error) {
      console.error('Error updating draft:', error);
      setSnackbar({
        open: true,
        message: `Failed to update draft: ${error.message}`,
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    if (activeTab === 2) { // Assuming 2 is the index for the drafts tab
      fetchDrafts();
    }
  }, [activeTab]);

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
              <Tab label="Manage Drafts" />
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
                  <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleSubmit(false)}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleSubmit(true)}
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
                      Save & Publish
                    </Button>
                  </Stack>
                </Stack>
              )}
              {activeTab === 1 && (
                <div>
                  {/* Add Facebook Posts content will go here */}
                </div>
              )}
              {activeTab === 2 && (
                <Box sx={{ mt: 3 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">Draft Projects</Typography>
                      <Button
                        variant="contained"
                        disabled={selectedDrafts.length === 0}
                        onClick={publishSelectedDrafts}
                        sx={{
                          backgroundColor: colorPalette.primary,
                          '&:hover': {
                            backgroundColor: colorPalette.secondary,
                          }
                        }}
                      >
                        Publish Selected ({selectedDrafts.length})
                      </Button>
                    </Box>
                    
                    {drafts.length === 0 ? (
                      <Typography color="text.secondary">No drafts found</Typography>
                    ) : (
                      <Stack spacing={2}>
                        {drafts.map((draft) => (
                          <Card key={draft.id} sx={{ p: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Checkbox
                                checked={selectedDrafts.includes(draft.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedDrafts([...selectedDrafts, draft.id]);
                                  } else {
                                    setSelectedDrafts(selectedDrafts.filter(id => id !== draft.id));
                                  }
                                }}
                              />
                              <Stack spacing={1} sx={{ flex: 1 }}>
                                <Typography variant="h6">{draft.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Date: {draft.date.split('-').reverse().join('/')}
                                </Typography>
                                {draft.localizations?.map((loc) => (
                                  <Box key={loc.locale}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      {loc.locale.toUpperCase()}: {loc.title}
                                    </Typography>
                                  </Box>
                                ))}
                              </Stack>
                              <Button
                                variant="outlined"
                                onClick={() => handleEditDraft(draft)}
                                sx={{ minWidth: 100 }}
                              >
                                Edit
                              </Button>
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Box>
              )}
            </Box>
          </Card>
        </motion.div>
      </Container>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Draft</DialogTitle>
        <DialogContent>
          <Stack spacing={4} sx={{ mt: 2 }}>
            {/* Title Fields */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Title (English)"
                value={editingDraft?.titleEn || ''}
                onChange={(e) => setEditingDraft(prev => ({ ...prev, titleEn: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Title (Vietnamese)"
                value={editingDraft?.titleVn || ''}
                onChange={(e) => setEditingDraft(prev => ({ ...prev, titleVn: e.target.value }))}
              />
            </Stack>

            {/* Description Fields */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Description (English)</Typography>
              <Box sx={{ 
                border: '1px solid rgba(0, 0, 0, 0.23)', 
                borderRadius: '4px',
                minHeight: '100px',
                '& .ProseMirror': {
                  padding: '8px 12px',
                  minHeight: '100px',
                  '&:focus': {
                    outline: 'none'
                  }
                }
              }}>
                <div className="editor-toolbar" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', padding: '8px' }}>
                  <IconButton
                    size="small"
                    onClick={() => editEditorEn?.chain().focus().toggleBold().run()}
                  >
                    <FormatBold />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => editEditorEn?.chain().focus().toggleItalic().run()}
                  >
                    <FormatItalic />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => editEditorEn?.chain().focus().toggleUnderline().run()}
                  >
                    <FormatUnderlined />
                  </IconButton>
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                  <IconButton
                    size="small"
                    onClick={() => editEditorEn?.chain().focus().toggleBulletList().run()}
                  >
                    <FormatListBulleted />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => editEditorEn?.chain().focus().toggleOrderedList().run()}
                  >
                    <FormatListNumbered />
                  </IconButton>
                </div>
                <EditorContent editor={editEditorEn} />
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>Description (Vietnamese)</Typography>
              <Box sx={{ 
                border: '1px solid rgba(0, 0, 0, 0.23)', 
                borderRadius: '4px',
                minHeight: '100px',
                '& .ProseMirror': {
                  padding: '8px 12px',
                  minHeight: '100px',
                  '&:focus': {
                    outline: 'none'
                  }
                }
              }}>
                <div className="editor-toolbar" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', padding: '8px' }}>
                  <IconButton
                    size="small"
                    onClick={() => editEditorVn?.chain().focus().toggleBold().run()}
                  >
                    <FormatBold />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => editEditorVn?.chain().focus().toggleItalic().run()}
                  >
                    <FormatItalic />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => editEditorVn?.chain().focus().toggleUnderline().run()}
                  >
                    <FormatUnderlined />
                  </IconButton>
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                  <IconButton
                    size="small"
                    onClick={() => editEditorVn?.chain().focus().toggleBulletList().run()}
                  >
                    <FormatListBulleted />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => editEditorVn?.chain().focus().toggleOrderedList().run()}
                  >
                    <FormatListNumbered />
                  </IconButton>
                </div>
                <EditorContent editor={editEditorVn} />
              </Box>
            </Box>

            {/* Date Picker */}
            <DatePicker
              selected={editingDraft?.date}
              onChange={(date) => {
                setEditingDraft(prev => ({
                  ...prev,
                  date: new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    12, // Set to noon
                    0,
                    0,
                    0
                  )
                }));
              }}
              dateFormat="dd-MM-yyyy"
              customInput={
                <TextField
                  fullWidth
                  label="Date"
                  value={editingDraft?.date ? editingDraft.date.toISOString().split('T')[0].split('-').reverse().join('-') : ''}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              }
            />

            {/* Image Fields */}
            {/* ... rest of the image fields ... */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          <Button onClick={() => handleUpdateDraft(false)} variant="outlined">
            Save Draft
          </Button>
          <Button 
            onClick={() => handleUpdateDraft(true)} 
            variant="contained"
            sx={{
              backgroundColor: colorPalette.primary,
              '&:hover': {
                backgroundColor: colorPalette.secondary,
              }
            }}
          >
            Save & Publish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPanel;