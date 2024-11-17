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
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';

const transformToSlateAST = (editorContent) => {
  if (!editorContent || !editorContent.content) {
    return {
      children: [{
        type: 'paragraph',
        children: [{ text: '' }]
      }]
    };
  }

  const transformedContent = editorContent.content.map(node => {
    if (node.type === 'heading') {
      let headingType;
      switch (node.attrs.level) {
        case 1:
          headingType = 'heading-one';
          break;
        case 2:
          headingType = 'heading-two';
          break;
        case 3:
          headingType = 'heading-three';
          break;
        default:
          headingType = 'paragraph';
      }
      
      return {
        type: headingType,
        children: [{
          text: node.content?.[0]?.text || '',
          ...(node.content?.[0]?.marks?.reduce((acc, mark) => ({
            ...acc,
            [mark.type]: true
          }), {}) || {})
        }]
      };
    }

    if (node.type === 'bulletList') {
      return {
        type: 'bulleted-list',
        children: node.content.map(listItem => ({
          type: 'list-item',
          children: [{
            type: 'list-item-child',
            children: [{
              text: listItem.content?.[0]?.content?.[0]?.text || '',
              ...(listItem.content?.[0]?.content?.[0]?.marks?.reduce((acc, mark) => ({
                ...acc,
                [mark.type]: true
              }), {}) || {})
            }]
          }]
        }))
      };
    }

    if (node.type === 'orderedList') {
      return {
        type: 'numbered-list',
        children: node.content.map(listItem => ({
          type: 'list-item',
          children: [{
            type: 'list-item-child',
            children: [{
              text: listItem.content?.[0]?.content?.[0]?.text || '',
              ...(listItem.content?.[0]?.content?.[0]?.marks?.reduce((acc, mark) => ({
                ...acc,
                [mark.type]: true
              }), {}) || {})
            }]
          }]
        }))
      };
    }

    // Default paragraph case
    return {
      type: 'paragraph',
      children: [{
        text: node.content?.[0]?.text || '',
        ...(node.content?.[0]?.marks?.reduce((acc, mark) => ({
          ...acc,
          [mark.type]: true
        }), {}) || {})
      }]
    };
  });

  return {
    children: transformedContent
  };
};

const updateMutation = `
  mutation UpdateProject(
    $titleEn: String!
    $titleVn: String!
    $descriptionEn: RichTextAST!
    $descriptionVn: RichTextAST!
    $date: Date!
    $id: ID!
    $imageConnect: AssetWhereUniqueInput
    $imageDisconnect: Boolean
    $imagesConnect: [AssetConnectInput!]
    $imagesDisconnect: [AssetWhereUniqueInput!]
  ) {
    updateProject(
      where: { id: $id }
      data: {
        title: $titleEn
        description: $descriptionEn
        date: $date
        image: { 
          connect: $imageConnect
          disconnect: $imageDisconnect
        }
        images: {
          connect: $imagesConnect
          disconnect: $imagesDisconnect
        }
        localizations: {
          upsert: {
            locale: vn
            create: {
              title: $titleVn
              description: $descriptionVn
            }
            update: {
              title: $titleVn
              description: $descriptionVn
            }
          }
        }
      }
    ) {
      id
      title
      description {
        raw
      }
      date
      image {
        id
        url
      }
      images {
        id
        url
      }
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

// Update the createAssetMutation to be more specific
const createAssetMutation = `
  mutation CreateAsset($fileName: String!) {
    createAsset(data: { fileName: $fileName }) {
      id
      url
      fileName
      handle
      mimeType
      size
      upload {
        status
        expiresAt
        requestPostData {
          url
          date
          key
          signature
          algorithm
          policy
          credential
          securityToken
        }
      }
    }
  }
`;

// Add this helper function to handle asset creation
const createAssetInHygraph = async (file, hygraphUrl, authToken) => {
  const response = await fetch(hygraphUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      query: createAssetMutation,
      variables: {
        fileName: file.name
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Network error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  
  // Log the full response for debugging
  console.log('Asset creation response:', JSON.stringify(result, null, 2));

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  if (!result.data?.createAsset?.upload?.requestPostData) {
    throw new Error('Invalid response format from asset creation');
  }

  return result.data.createAsset;
};

// Keep the original createMutation simple
const createMutation = `
  mutation CreateProject(
    $titleEn: String!
    $titleVn: String!
    $descriptionEn: RichTextAST!
    $descriptionVn: RichTextAST!
    $date: Date!
  ) {
    createProject(
      data: {
        title: $titleEn
        description: $descriptionEn
        date: $date
        localizations: {
          create: {
            locale: vn
            data: {
              title: $titleVn
              description: $descriptionVn
            }
          }
        }
      }
    ) {
      id
      title
      date
      localizations {
        locale
      }
    }
  }
`;

// Update the updateProjectAssetsMutation to handle both single and multiple images
const updateProjectAssetsMutation = `
  mutation UpdateProjectAssets(
  $id: ID!
  $imageConnect: AssetWhereUniqueInput
  $imagesConnect: [AssetConnectInput!]
) {
  updateProject(
    where: { id: $id }
    data: {
      image: { connect: $imageConnect }
      images: { connect: $imagesConnect }
    }
  ) {
    id
    image {
      id
      url
    }
    images {
      id
      url
    }
  }
}
`;

const uploadFileToS3 = async (file, requestPostData) => {
  const formData = new FormData();
  
  try {
    // Add all required fields in the correct order
    formData.append('key', requestPostData.key);
    formData.append('X-Amz-Algorithm', requestPostData.algorithm);
    formData.append('X-Amz-Credential', requestPostData.credential);
    formData.append('X-Amz-Date', requestPostData.date);
    formData.append('X-Amz-Security-Token', requestPostData.securityToken);
    formData.append('Policy', requestPostData.policy);
    formData.append('X-Amz-Signature', requestPostData.signature);
    formData.append('file', file);

    const response = await fetch(requestPostData.url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`S3 upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw error;
  }
};

// Update this mutation to match the docs exactly
const publishAssetsMutation = `
  mutation PublishAsset($where: AssetWhereUniqueInput!) {
    publishAsset(where: $where, to: PUBLISHED) {
      id
    }
  }
`;

// Add this mutation to delete assets
const deleteAssetsMutation = `
  mutation DeleteAssets($where: AssetWhereInput!) {
    deleteManyAssets(where: $where) {
      count
    }
  }
`;

// Add this mutation near your other GraphQL queries
const deleteAssetMutation = `
  mutation DeleteAsset($id: ID!) {
    deleteAsset(where: { id: $id }) {
      id
    }
  }
`;

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
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [selectedPublished, setSelectedPublished] = useState([]);
  const [editSource, setEditSource] = useState('drafts');
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
  const [refreshKey] = useState(0);

  // Initialize tab after authentication
  useEffect(() => {
    if (user) {  // Only run this after user is authenticated
      const storedTab = localStorage.getItem('adminActiveTab');
      if (storedTab) {
        setActiveTab(parseInt(storedTab));
        
        // Update hash to match stored tab
        const tabToHash = {
          0: '#add-post',
          1: '#add-facebook-posts',
          2: '#drafts',
          3: '#published'
        };
        const hash = tabToHash[parseInt(storedTab)] || '#drafts';
        window.location.hash = hash;
      }
    }
  }, [user]); // Depend on user state

  // Keep your existing tab change effect
  useEffect(() => {
    if (user) {  // Only store tab when authenticated
      localStorage.setItem('adminActiveTab', activeTab.toString());
    }
  }, [activeTab, user]);

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

  const handleSubmit = async (shouldPublish = false) => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      // 1. First create the project without assets
      const createResponse = await fetch(hygraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: createMutation,
          variables: {
            titleEn: formData.titleEn,
            titleVn: formData.titleVn,
            descriptionEn: transformToSlateAST(editorEn.getJSON()),
            descriptionVn: transformToSlateAST(editorVn.getJSON()),
            date: formData.date.toISOString().split('T')[0]
          }
        })
      });

      const createResult = await createResponse.json();
      if (createResult.errors) {
        throw new Error(createResult.errors[0].message);
      }

      const projectId = createResult.data.createProject.id;

      // 2. If there are assets, upload them and update the project
      let featuredImage = null;
      let additionalImages = [];

      if (formData.image || formData.images?.length > 0) {
        try {
          // Handle featured image
          if (formData.image) {
            try {
              const asset = await createAssetInHygraph(formData.image, hygraphUrl, authToken);
              await uploadFileToS3(formData.image, asset.upload.requestPostData);
              featuredImage = { id: asset.id };
            } catch (error) {
              console.warn('Featured image upload failed:', error);
            }
          }

          // Handle additional images
          if (formData.images?.length > 0) {
            for (const image of formData.images) {
              try {
                const asset = await createAssetInHygraph(image, hygraphUrl, authToken);
                await uploadFileToS3(image, asset.upload.requestPostData);
                additionalImages.push({ id: asset.id });
              } catch (error) {
                console.warn(`Additional image upload failed:`, error);
              }
            }
          }

          // Only update if we have successfully uploaded assets
          if (featuredImage || additionalImages.length > 0) {
            const updateVariables = {
              id: projectId,
              ...(featuredImage && { 
                imageConnect: { id: featuredImage.id }
              }),
              ...(additionalImages.length > 0 && { 
                imagesConnect: additionalImages.map(img => ({ where: { id: img.id } }))
              })
            };

            console.log('Updating project with assets:', updateVariables);

            const updateResponse = await fetch(hygraphUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({
                query: updateProjectAssetsMutation,
                variables: updateVariables
              })
            });

            const updateResult = await updateResponse.json();
            if (updateResult.errors) {
              console.error('Asset update failed:', updateResult.errors);
            } else {
              console.log('Assets connected successfully:', updateResult.data);
            }
          }
        } catch (error) {
          console.warn('Asset handling failed:', error);
          // Continue with the process even if asset handling fails
        }
      }

      // 3. Handle publishing if needed
      if (shouldPublish) {
        await publishDraft(projectId);
        setSnackbar({
          open: true,
          message: 'Post published successfully!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Draft saved successfully!',
          severity: 'success'
        });
      }

      // Reset form
      setFormData({
        titleEn: '',
        titleVn: '',
        descriptionEn: '',
        descriptionVn: '',
        date: new Date(),
        image: null,
        images: []
      });
      editorEn.commands.setContent('');
      editorVn.commands.setContent('');
      setPreviews({ image: null, images: [] });

    } catch (error) {
      console.error('Error creating post:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${shouldPublish ? 'publish' : 'save draft'}: ${error.message}`,
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

      const query = `
        {
          drafts: projects(stage: DRAFT) {
            id
            title
            description {
              raw
            }
            date
            image {
              id
              stage
              url
            }
            images {
              id
              stage
              url
            }
            localizations {
              locale
              title
              description {
                raw
              }
            }
          }
          published: projects(stage: PUBLISHED) {
            id
            title
            description {
              raw
            }
            date
            image {
              id
              stage
              url
            }
            images {
              id
              stage
              url
            }
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

      const response = await fetch(hygraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ query })
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Add detailed logging for drafts and their assets
      console.log('All drafts:', result.data.drafts);
      result.data.drafts?.forEach(draft => {
        console.log('Draft ID:', draft.id);
        console.log('Draft Title:', draft.title);
        if (draft.image) {
          console.log('Draft featured image:', draft.image.id, 'Stage:', draft.image.stage);
        }
        if (draft.images) {
          console.log('Draft additional images:', draft.images.map(img => ({ id: img.id, stage: img.stage })));
        }
      });

      // Get all drafts and published posts
      const allDrafts = result.data.drafts || [];
      const publishedPosts = result.data.published || [];

      // True drafts are those that exist in DRAFT but not in PUBLISHED
      const trueDrafts = allDrafts.filter(draft => 
        !publishedPosts.some(pub => pub.id === draft.id)
      );

      setDrafts(trueDrafts);
      setPublishedPosts(publishedPosts);

    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to fetch posts: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Update useEffect to remove console.log
  useEffect(() => {
    fetchDrafts();
  }, [refreshKey]);

  // Update the publishDraft function to also publish connected assets
  const publishDraft = async (draftId) => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      const response = await fetch(hygraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: `
            mutation PublishProject($where: ProjectWhereUniqueInput!) {
              publishProject(
                where: $where, 
                to: PUBLISHED,
                locales: [en, vn]
              ) {
                id
                title
                date
                localizations {
                  locale
                }
              }
            }
          `,
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

      return result.data.publishProject;
    } catch (error) {
      console.error('Error publishing draft:', error);
      throw error; // Re-throw to be handled by the caller
    }
  };

  const handleEditDraft = (draft, source) => {
    console.log('Draft data:', draft);
    console.log('EN description raw:', draft.description?.raw);
    console.log('VN description raw:', draft.localizations?.[0]?.description?.raw);
    
    setEditingDraft({
      id: draft.id,
      titleEn: draft.title,
      titleVn: draft.localizations?.[0]?.title || '',
      date: new Date(`${draft.date}T12:00:00`),
      descriptionEn: draft.description?.raw,
      descriptionVn: draft.localizations?.[0]?.description?.raw || '',
      image: draft.image,
      images: draft.images || [],
      removedImages: [],
      newImages: []
    });
    setEditSource(source);

    // Wait for editors to be ready and mounted
    setTimeout(() => {
      if (editEditorEn && draft.description?.raw) {
        try {
          // Use the same simple transformation as VN content
          const enContent = {
            type: 'doc',
            content: draft.description.raw.children.map(node => {
              const text = node.children?.[0]?.text || ' ';
              const marks = [];
              const nodeMarks = node.children?.[0] || {};
              if (nodeMarks.bold) marks.push({ type: 'bold' });
              if (nodeMarks.italic) marks.push({ type: 'italic' });
              if (nodeMarks.underline) marks.push({ type: 'underline' });

              switch (node.type) {
                case 'heading-one':
                  return {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [{ type: 'text', text, marks }]
                  };
                case 'heading-two':
                  return {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text, marks }]
                  };
                case 'heading-three':
                  return {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text, marks }]
                  };
                case 'bulleted-list':
                  return {
                    type: 'bulletList',
                    content: node.children.map(item => ({
                      type: 'listItem',
                      content: [{
                        type: 'paragraph',
                        content: [{
                          type: 'text',
                          text: item.children?.[0]?.children?.[0]?.text || ' ',
                          marks: []
                        }]
                      }]
                    }))
                  };
                case 'numbered-list':
                  return {
                    type: 'orderedList',
                    content: node.children.map(item => ({
                      type: 'listItem',
                      content: [{
                        type: 'paragraph',
                        content: [{
                          type: 'text',
                          text: item.children?.[0]?.children?.[0]?.text || ' ',
                          marks: []
                        }]
                      }]
                    }))
                  };
                default:
                  return {
                    type: 'paragraph',
                    content: [{ type: 'text', text, marks }]
                  };
              }
            })
          };

          console.log('Setting EN content:', JSON.stringify(enContent, null, 2));
          editEditorEn.commands.setContent(enContent);
        } catch (error) {
          console.error('Error setting EN content:', error);
        }
      }

      if (editEditorVn && draft.localizations?.[0]?.description?.raw) {
        try {
          // Same logic for Vietnamese content
          const vnContent = {
            type: 'doc',
            content: draft.localizations[0].description.raw.children.map(node => {
              const text = node.children?.[0]?.text || ' ';
              const marks = [];
              const nodeMarks = node.children?.[0] || {};
              if (nodeMarks.bold) marks.push({ type: 'bold' });
              if (nodeMarks.italic) marks.push({ type: 'italic' });
              if (nodeMarks.underline) marks.push({ type: 'underline' });

              switch (node.type) {
                case 'heading-one':
                  return {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [{ type: 'text', text, marks }]
                  };
                case 'heading-two':
                  return {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text, marks }]
                  };
                case 'heading-three':
                  return {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text, marks }]
                  };
                case 'bulleted-list':
                  return {
                    type: 'bulletList',
                    content: node.children.map(item => ({
                      type: 'listItem',
                      content: [{
                        type: 'paragraph',
                        content: [{
                          type: 'text',
                          text: item.children?.[0]?.children?.[0]?.text || ' ',
                          marks: []
                        }]
                      }]
                    }))
                  };
                case 'numbered-list':
                  return {
                    type: 'orderedList',
                    content: node.children.map(item => ({
                      type: 'listItem',
                      content: [{
                        type: 'paragraph',
                        content: [{
                          type: 'text',
                          text: item.children?.[0]?.children?.[0]?.text || ' ',
                          marks: []
                        }]
                      }]
                    }))
                  };
                default:
                  return {
                    type: 'paragraph',
                    content: [{ type: 'text', text, marks }]
                  };
              }
            })
          };

          console.log('Setting VN content:', JSON.stringify(vnContent, null, 2));
          editEditorVn.commands.setContent(vnContent);
        } catch (error) {
          console.error('Error setting VN content:', error);
        }
      }
    }, 100); // Increased timeout to ensure editors are ready

    setEditModalOpen(true);
  };

  const handleUpdateDraft = async (shouldPublish) => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      console.log('Starting update with draft data:', {
        id: editingDraft.id,
        removedImage: editingDraft.removedImage,
        removedImages: editingDraft.removedImages,
        newImage: editingDraft.newImage,
        newImages: editingDraft.newImages,
        currentImage: editingDraft.image,
        currentImages: editingDraft.images
      });

      // Handle removed assets first
      const removedAssetIds = [];
      if (editingDraft.removedImage && editingDraft.image?.id) {
        removedAssetIds.push(editingDraft.image.id);
        console.log('Adding featured image to removal list:', editingDraft.image.id);
      }
      if (editingDraft.removedImages?.length > 0) {
        const additionalRemovedIds = editingDraft.removedImages.map(img => img.id).filter(Boolean);
        removedAssetIds.push(...additionalRemovedIds);
        console.log('Adding additional images to removal list:', additionalRemovedIds);
      }

      if (removedAssetIds.length > 0) {
        console.log('Attempting to delete assets:', removedAssetIds);
        const deleteResponse = await fetch(hygraphUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            query: deleteAssetsMutation,
            variables: {
              where: {
                id_in: removedAssetIds
              }
            }
          })
        });
        const deleteResult = await deleteResponse.json();
        console.log('Delete assets response:', deleteResult);
      }

      // Handle new assets
      let newFeaturedImage = null;
      let newAdditionalImages = [];

      // Upload new featured image if exists
      if (editingDraft.newImage) {
        console.log('Uploading new featured image:', editingDraft.newImage.name);
        try {
          const asset = await createAssetInHygraph(editingDraft.newImage, hygraphUrl, authToken);
          await uploadFileToS3(editingDraft.newImage, asset.upload.requestPostData);
          newFeaturedImage = { id: asset.id };
          console.log('New featured image uploaded successfully:', newFeaturedImage);
        } catch (error) {
          console.error('Failed to upload featured image:', error);
        }
      }

      // Upload new additional images if they exist
      if (editingDraft.newImages?.length > 0) {
        console.log('Uploading new additional images:', editingDraft.newImages.map(img => img.name));
        for (const image of editingDraft.newImages) {
          try {
            const asset = await createAssetInHygraph(image, hygraphUrl, authToken);
            await uploadFileToS3(image, asset.upload.requestPostData);
            newAdditionalImages.push({ id: asset.id });
            console.log('Additional image uploaded successfully:', asset.id);
          } catch (error) {
            console.error('Failed to upload additional image:', error);
          }
        }
      }

      // Prepare update variables
      const variables = {
        id: editingDraft.id,
        titleEn: editingDraft.titleEn,
        titleVn: editingDraft.titleVn,
        descriptionEn: transformToSlateAST(editEditorEn.getJSON()),
        descriptionVn: transformToSlateAST(editEditorVn.getJSON()),
        date: editingDraft.date.toISOString().split('T')[0],
        imageDisconnect: editingDraft.removedImage === true,
        imageConnect: newFeaturedImage ? { id: newFeaturedImage.id } : 
                       (editingDraft.removedImage ? null : 
                       (editingDraft.image ? { id: editingDraft.image.id } : null))
      };

      // Handle additional images connections and disconnections
      const existingImageIds = (editingDraft.images || [])
        .filter(img => !editingDraft.removedImages?.some(removed => removed.id === img.id))
        .map(img => ({ where: { id: img.id } }))
        .filter(connection => connection.where.id); // Ensure we have valid IDs

      const newImageConnections = newAdditionalImages
        .map(img => ({ where: { id: img.id } }))
        .filter(connection => connection.where.id); // Ensure we have valid IDs

      // Only add imagesConnect if we have valid connections to make
      if (existingImageIds.length > 0 || newImageConnections.length > 0) {
        variables.imagesConnect = [...existingImageIds, ...newImageConnections];
        console.log('Connecting images:', variables.imagesConnect);
      }

      // Handle disconnections for removed images
      if (editingDraft.removedImages?.length > 0) {
        variables.imagesDisconnect = editingDraft.removedImages
          .filter(img => img.id) // Ensure we have valid IDs
          .map(img => ({ id: img.id }));
        console.log('Disconnecting images:', variables.imagesDisconnect);
      }

      // Log the final variables for debugging
      console.log('Update variables:', {
        ...variables,
        imageStatus: {
          isRemoving: editingDraft.removedImage,
          currentImage: editingDraft.image,
          newImage: newFeaturedImage,
          existingImages: existingImageIds,
          newImages: newImageConnections,
          removedImages: variables.imagesDisconnect
        }
      });

      // Update the project
      const response = await fetch(hygraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: updateMutation,
          variables
        })
      });

      const result = await response.json();
      console.log('Update project response:', result);

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Handle publishing if needed
      if (shouldPublish) {
        console.log('Starting publish process...');
        const publishResult = await publishDraft(editingDraft.id);
        console.log('Publish result:', publishResult);
        
        // Immediately refresh after successful publish
        const currentTab = window.location.hash || '#drafts';
        window.location.href = `${window.location.pathname}${currentTab}`;
        window.location.reload();
        return; // Exit early since we're refreshing the page
      }

      setSnackbar({
        open: true,
        message: `Draft ${shouldPublish ? 'published' : 'updated'} successfully!`,
        severity: 'success'
      });

      setEditModalOpen(false);
      setSelectedDrafts([]);
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

  const unpublishSelectedPosts = async () => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      const unpublishMutation = `
        mutation UnpublishProject($where: ProjectWhereUniqueInput!) {
          unpublishProject(where: $where) {
            id
            title
            date
          }
        }
      `;

      // Track successful and failed unpublishes
      const results = await Promise.all(
        selectedPublished.map(async (postId) => {
          try {
            const response = await fetch(hygraphUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({
                query: unpublishMutation,
                variables: {
                  where: {
                    id: postId
                  }
                }
              })
            });

            const result = await response.json();
            if (result.errors) {
              throw new Error(result.errors[0].message);
            }
            return { success: true, id: postId };
          } catch (error) {
            return { success: false, id: postId, error: error.message };
          }
        })
      );

      // Check for any failures
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        throw new Error(`Failed to unpublish some posts: ${failures.map(f => f.error).join(', ')}`);
      }

      setSnackbar({
        open: true,
        message: 'Selected posts unpublished successfully!',
        severity: 'success'
      });

      setSelectedPublished([]);
      fetchDrafts(); // This will refresh both drafts and published posts
    } catch (error) {
      console.error('Error unpublishing posts:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const deleteSelectedPosts = async () => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      const deleteMutation = `
        mutation DeleteProject($where: ProjectWhereUniqueInput!) {
          deleteProject(where: $where) {
            id
          }
        }
      `;

      // Track successful and failed deletes
      const results = await Promise.all(
        selectedPublished.map(async (postId) => {
          try {
            const response = await fetch(hygraphUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({
                query: deleteMutation,
                variables: {
                  where: {
                    id: postId
                  }
                }
              })
            });

            const result = await response.json();
            if (result.errors) {
              throw new Error(result.errors[0].message);
            }
            return { success: true, id: postId };
          } catch (error) {
            return { success: false, id: postId, error: error.message };
          }
        })
      );

      // Check for any failures
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        throw new Error(`Failed to delete some posts: ${failures.map(f => f.error).join(', ')}`);
      }

      setSnackbar({
        open: true,
        message: 'Selected posts deleted successfully!',
        severity: 'success'
      });

      setSelectedPublished([]);
      fetchDrafts(); // This will refresh both drafts and published posts
    } catch (error) {
      console.error('Error deleting posts:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const publishSelectedDrafts = async () => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      // Get the selected drafts and their assets
      const selectedDraftsData = drafts.filter(draft => selectedDrafts.includes(draft.id));
      
      // Collect all asset IDs from selected drafts
      const assetIds = [];
      selectedDraftsData.forEach(draft => {
        if (draft.image?.id) {
          assetIds.push(draft.image.id);
        }
        if (draft.images) {
          assetIds.push(...draft.images.map(img => img.id));
        }
      });

      console.log('Assets to publish:', assetIds);

      // Publish each asset
      for (const assetId of assetIds) {
        const publishResponse = await fetch(hygraphUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            query: publishAssetsMutation,
            variables: {
              where: {
                id: assetId
              }
            }
          })
        });

        const publishResult = await publishResponse.json();
        console.log('Asset publish result:', assetId, publishResult);
      }

      // Then publish the selected drafts
      for (const draftId of selectedDrafts) {
        const publishResponse = await fetch(hygraphUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            query: `
              mutation PublishProject($where: ProjectWhereUniqueInput!) {
                publishProject(
                  where: $where, 
                  to: PUBLISHED,
                  locales: [en, vn]
                ) {
                  id
                  title
                  date
                  localizations {
                    locale
                  }
                }
              }
            `,
            variables: {
              where: {
                id: draftId
              }
            }
          })
        });

        const publishResult = await publishResponse.json();
        if (publishResult.errors) {
          throw new Error(`Failed to publish project ${draftId}: ${publishResult.errors[0].message}`);
        }
      }
    } catch (error) {
      console.error('Error publishing drafts:', error);
      setSnackbar({
        open: true,
        message: `Failed to publish: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Update the deleteSelectedDrafts function to also delete connected assets
  const deleteSelectedDrafts = async () => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      // First, get all connected assets for selected drafts
      const getProjectsAssetsQuery = `
        query GetProjectsAssets($ids: [ID!]) {
          projects(where: { id_in: $ids }) {
            id
            image {
              id
            }
            images {
              id
            }
          }
        }
      `;

      const assetsResponse = await fetch(hygraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: getProjectsAssetsQuery,
          variables: { ids: selectedDrafts }
        })
      });

      const assetsResult = await assetsResponse.json();
      
      // Collect all asset IDs
      const assetIds = [];
      assetsResult.data?.projects?.forEach(project => {
        if (project.image?.id) {
          assetIds.push(project.image.id);
        }
        if (project.images) {
          assetIds.push(...project.images.map(img => img.id));
        }
      });

      // Delete assets if there are any
      if (assetIds.length > 0) {
        const deleteAssetsResponse = await fetch(hygraphUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            query: deleteAssetsMutation,
            variables: {
              where: {
                id_in: assetIds
              }
            }
          })
        });

        const deleteAssetsResult = await deleteAssetsResponse.json();
        if (deleteAssetsResult.errors) {
          console.error('Error deleting assets:', deleteAssetsResult.errors);
        }
      }

      // Delete the projects
      const deleteMutation = `
        mutation DeleteProject($where: ProjectWhereUniqueInput!) {
          deleteProject(where: $where) {
            id
          }
        }
      `;

      // Track successful and failed deletes
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
                query: deleteMutation,
                variables: {
                  where: {
                    id: draftId
                  }
                }
              })
            });

            const result = await response.json();
            console.log('Delete result for draft:', draftId, result);

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
        throw new Error(`Failed to delete some drafts: ${failures.map(f => f.error).join(', ')}`);
      }

      setSnackbar({
        open: true,
        message: 'Selected drafts deleted successfully!',
        severity: 'success'
      });

      setSelectedDrafts([]);
      fetchDrafts();
    } catch (error) {
      console.error('Error deleting drafts:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

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
              <Tab label="Manage Published" value={3} />
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
                  </Stack>
                </Stack>
              )}
              {activeTab === 1 && (
                <div>
                  {/* Add Facebook Posts content will go here */}
                </div>
              )}
              {activeTab === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Manage Drafts</Typography>
                    <IconButton 
                      onClick={() => {
                        localStorage.setItem('adminActiveTab', activeTab.toString());
                        window.location.reload();
                      }}
                      sx={{ color: colorPalette.primary }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={publishSelectedDrafts}
                      disabled={selectedDrafts.length === 0}
                      sx={{
                        backgroundColor: colorPalette.primary,
                        '&:hover': {
                          backgroundColor: colorPalette.secondary,
                        }
                      }}
                    >
                      Publish Selected
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={deleteSelectedDrafts}
                      disabled={selectedDrafts.length === 0}
                    >
                      Delete Selected
                    </Button>
                  </Stack>

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
                              onClick={() => handleEditDraft(draft, 'drafts')}
                              sx={{ minWidth: 100 }}
                            >
                              Edit
                            </Button>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
              {activeTab === 3 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Manage Published</Typography>
                    <IconButton 
                      onClick={() => {
                        localStorage.setItem('adminActiveTab', activeTab.toString());
                        window.location.reload();
                      }}
                      sx={{ color: colorPalette.primary }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={unpublishSelectedPosts}
                      disabled={selectedPublished.length === 0}
                    >
                      Unpublish Selected
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={deleteSelectedPosts}
                      disabled={selectedPublished.length === 0}
                    >
                      Delete Selected
                    </Button>
                  </Stack>

                  {publishedPosts.map((post) => (
                    <Card key={post.id} sx={{ mb: 2, p: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Checkbox
                          checked={selectedPublished.includes(post.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPublished([...selectedPublished, post.id]);
                            } else {
                              setSelectedPublished(selectedPublished.filter(id => id !== post.id));
                            }
                          }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">{post.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Date: {new Date(post.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <IconButton
                          onClick={() => handleEditDraft(post, 'published')}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Stack>
                    </Card>
                  ))}
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
                    onClick={() => {
                      if (editEditorEn?.isActive('heading', { level: 1 })) {
                        editEditorEn?.chain().focus().setParagraph().run();
                      } else {
                        editEditorEn?.chain().focus().setHeading({ level: 1 }).run();
                      }
                    }}
                    color={editEditorEn?.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
                  >
                    H1
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (editEditorEn?.isActive('heading', { level: 2 })) {
                        editEditorEn?.chain().focus().setParagraph().run();
                      } else {
                        editEditorEn?.chain().focus().setHeading({ level: 2 }).run();
                      }
                    }}
                    color={editEditorEn?.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
                  >
                    H2
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (editEditorEn?.isActive('heading', { level: 3 })) {
                        editEditorEn?.chain().focus().setParagraph().run();
                      } else {
                        editEditorEn?.chain().focus().setHeading({ level: 3 }).run();
                      }
                    }}
                    color={editEditorEn?.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
                  >
                    H3
                  </IconButton>
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
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
                    onClick={() => {
                      if (editEditorVn?.isActive('heading', { level: 1 })) {
                        editEditorVn?.chain().focus().setParagraph().run();
                      } else {
                        editEditorVn?.chain().focus().setHeading({ level: 1 }).run();
                      }
                    }}
                    color={editEditorVn?.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
                  >
                    H1
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (editEditorVn?.isActive('heading', { level: 2 })) {
                        editEditorVn?.chain().focus().setParagraph().run();
                      } else {
                        editEditorVn?.chain().focus().setHeading({ level: 2 }).run();
                      }
                    }}
                    color={editEditorVn?.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
                  >
                    H2
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (editEditorVn?.isActive('heading', { level: 3 })) {
                        editEditorVn?.chain().focus().setParagraph().run();
                      } else {
                        editEditorVn?.chain().focus().setHeading({ level: 3 }).run();
                      }
                    }}
                    color={editEditorVn?.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
                  >
                    H3
                  </IconButton>
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
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
                    height: editingDraft?.image ? 'auto' : '120px',
                    border: '2px dashed rgba(0,0,0,0.12)',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    padding: editingDraft?.image ? '0' : '20px',
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
                  {editingDraft?.image ? (
                    <>
                      <img 
                        src={editingDraft.image.url || editingDraft.image} // Add .url check
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
                          onClick={async (e) => {
                            e.preventDefault();
                            const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
                            const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

                            // Delete the asset from Hygraph if it has an ID
                            if (editingDraft.image?.id) {
                              try {
                                const response = await fetch(hygraphUrl, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${authToken}`
                                  },
                                  body: JSON.stringify({
                                    query: deleteAssetMutation,
                                    variables: {
                                      id: editingDraft.image.id
                                    }
                                  })
                                });
                                const result = await response.json();
                                console.log('Asset deletion result:', result);
                              } catch (error) {
                                console.error('Error deleting asset:', error);
                              }
                            }

                            setEditingDraft(prev => ({ ...prev, image: null, removedImage: true }));
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
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditingDraft(prev => ({ 
                          ...prev, 
                          image: URL.createObjectURL(file), // Add this to show preview
                          newImage: file
                        }));
                      }
                    }}
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
                  {editingDraft?.images?.length > 0 && (
                    <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: 2,
                      mb: 2
                    }}>
                      {editingDraft.images.map((image, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: 'relative',
                            paddingTop: '100%',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <img
                            src={image.url || image} // Add .url check
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
                            onClick={async () => {
                              const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
                              const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;
                              const removedImage = editingDraft.images[index];

                              // Delete the asset from Hygraph if it has an ID
                              if (removedImage.id) {
                                try {
                                  const response = await fetch(hygraphUrl, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${authToken}`
                                    },
                                    body: JSON.stringify({
                                      query: deleteAssetMutation,
                                      variables: {
                                        id: removedImage.id
                                      }
                                    })
                                  });
                                  const result = await response.json();
                                  console.log('Asset deletion result:', result);
                                } catch (error) {
                                  console.error('Error deleting asset:', error);
                                }
                              }

                              const newImages = [...editingDraft.images];
                              newImages.splice(index, 1);
                              setEditingDraft(prev => ({ 
                                ...prev, 
                                images: newImages,
                                removedImages: [...(prev.removedImages || []), removedImage]
                              }));
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
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        const newImageUrls = files.map(file => ({
                          url: URL.createObjectURL(file),
                          file
                        }));
                        setEditingDraft(prev => ({ 
                          ...prev, 
                          images: [...(prev.images || []), ...newImageUrls],
                          newImages: [...(prev.newImages || []), ...files]
                        }));
                      }}
                      style={{ display: 'none' }}
                    />
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
          {editSource === 'drafts' ? (
            <Button 
              onClick={() => handleUpdateDraft(false)} 
              variant="contained"
              sx={{
                backgroundColor: colorPalette.primary,
                '&:hover': {
                  backgroundColor: colorPalette.secondary,
                }
              }}
            >
              Save Draft
            </Button>
          ) : (
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
              Update Published
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPanel;