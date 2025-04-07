import React, { useState, useEffect, useRef } from 'react';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import DonationsDataTable from '../components/DonationsDataTable';

const transformToSlateAST = (editorContent) => {
  if (!editorContent || !editorContent.content) {
    return {
      children: [{
        type: 'paragraph',
        children: [{ text: '' }]
      }]
    };
  }

  const transformNode = (node) => {
    // Handle text nodes with emojis
    if (node.type === 'text') {
      return {
        text: node.text || '',
        ...(node.marks?.reduce((acc, mark) => ({
          ...acc,
          [mark.type]: true
        }), {}) || {})
      };
    }

    // Handle paragraphs and other block nodes
    const children = node.content?.map(transformNode) || [{ text: '' }];

    return {
      type: node.type,
      children
    };
  };

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
        children: node.content?.map(transformNode) || [{ text: '' }]
      };
    }

    if (node.type === 'bulletList') {
      return {
        type: 'bulleted-list',
        children: node.content.map(listItem => ({
          type: 'list-item',
          children: [{
            type: 'list-item-child',
            children: listItem.content?.[0]?.content?.map(transformNode) || [{ text: '' }]
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
            children: listItem.content?.[0]?.content?.map(transformNode) || [{ text: '' }]
          }]
        }))
      };
    }

    // Default paragraph case
    return {
      type: 'paragraph',
      children: node.content?.map(transformNode) || [{ text: '' }]
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
    $slugEn: String
    $slugVn: String
  ) {
    updateProject(
      where: { id: $id }
      data: {
        title: $titleEn
        description: $descriptionEn
        date: $date
        slug: $slugEn
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
              slug: $slugVn
            }
            update: {
              title: $titleVn
              description: $descriptionVn
              slug: $slugVn
            }
          }
        }
      }
    ) {
      id
      title
      slug
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
        slug
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

  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  if (!result.data?.createAsset?.upload?.requestPostData) {
    throw new Error('Invalid response format from asset creation');
  }

  return result.data.createAsset;
};

const createMutation = `
  mutation CreateProject(
    $titleEn: String!
    $titleVn: String!
    $descriptionEn: RichTextAST!
    $descriptionVn: RichTextAST!
    $date: Date!
    $slugEn: String
    $slugVn: String
  ) {
    createProject(
      data: {
        title: $titleEn
        description: $descriptionEn
        date: $date
        slug: $slugEn
        localizations: {
          create: {
            locale: vn
            data: {
              title: $titleVn
              description: $descriptionVn
              slug: $slugVn
            }
          }
        }
      }
    ) {
      id
      title
      slug
      date
      localizations {
        locale
        slug
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

// Add pagination to publishAssetsMutation
const publishAssetsMutation = `
  mutation PublishAsset($where: AssetWhereUniqueInput!) {
    publishAsset(where: $where, to: PUBLISHED) {
      id
    }
  }
`;

// Add pagination to deleteAssetsMutation
const deleteAssetsMutation = `
  mutation DeleteAssets($where: AssetManyWhereInput!, $first: Int = 100, $skip: Int = 0) {
    deleteManyAssets(where: $where, first: $first, skip: $skip) {
      count
    }
  }
`;

// Add pagination to deleteAssetMutation
const deleteAssetMutation = `
  mutation DeleteAsset($id: ID!) {
    deleteAsset(where: { id: $id }) {
      id
    }
  }
`;

// Update the deleteAssetsForProjects function to use the correct type
const deleteAssetsForProjects = async (assetIds, hygraphUrl, authToken, drafts, selectedDrafts, publishedPosts, selectedPublished) => {
  if (assetIds.length === 0) return;
  
  try {
    // Get the selected posts/drafts data to differentiate between feature image and multiple images
    const selectedDraftsData = drafts.filter(draft => selectedDrafts.includes(draft.id));
    const selectedPublishedData = publishedPosts.filter(post => selectedPublished.includes(post.id));
    const selectedData = [...selectedDraftsData, ...selectedPublishedData];

    // Separate feature images and additional images
    const featureImageIds = [];
    const additionalImageIds = [];

    selectedData.forEach(item => {
      if (item.image?.id) {
        featureImageIds.push(item.image.id);
      }
      if (item.images) {
        additionalImageIds.push(...item.images.map(img => img.id));
      }
    });

    // Delete all images one by one
    const allImageIds = [...featureImageIds, ...additionalImageIds];
    for (const imageId of allImageIds) {
      const response = await fetch(hygraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: deleteAssetMutation,
          variables: {
            id: imageId
          }
        })
      });
      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
    }
  } catch (error) {
    console.error('Error in asset deletion process:', error);
  }
};

function AdminPanel() {
  // Update the useState declarations
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('adminActiveTab');
    return savedTab ? parseInt(savedTab) : 0;
  });

  const [activeSubTab, setActiveSubTab] = useState(() => {
    const savedSubTab = localStorage.getItem('adminActiveSubTab');
    return savedSubTab ? parseInt(savedSubTab) : 0;
  });

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
  const [editingDraft, setEditingDraft] = useState({
    id: null,
    titleEn: '',
    titleVn: '',
    date: null,
    descriptionEn: '',
    descriptionVn: '',
    image: null,
    images: [],
    removedImages: [],
    newImages: [],
    newImage: null,  // Add this field
    removedImage: false  // Add this field if not already present
  });
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
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 100,
    aspect: 16 / 9 // This matches the aspect ratio of your project cards
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  // Add this near your other state declarations
  const [slugs, setSlugs] = useState(() => {
    const savedSlugs = localStorage.getItem('projectSlugs');
    return savedSlugs ? JSON.parse(savedSlugs) : {};
  });

  // Add these helper functions
  const generateSlug = (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/đ/g, 'd')  // Handle Vietnamese characters
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .trim() // Remove whitespace from both ends
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const saveSlugToStorage = (projectId, slugEn, slugVn) => {
    const newSlugs = {
      ...slugs,
      [projectId]: {
        en: slugEn,
        vn: slugVn
      }
    };
    localStorage.setItem('projectSlugs', JSON.stringify(newSlugs));
    setSlugs(newSlugs);
  };

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

  // Update the tab change handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    localStorage.setItem('adminActiveTab', newValue.toString());
  };

  // Update the subtab change handler
  const handleSubTabChange = (event, newValue) => {
    setActiveSubTab(newValue);
    localStorage.setItem('adminActiveSubTab', newValue.toString());
  };

  const handleInputChange = (field, value) => {
    if (field === 'titleEn') {
      // Generate slug from English title if slug hasn't been manually edited
      setFormData(prev => ({
        ...prev,
        [field]: value,
        slugEn: prev.slugEn === generateSlug(prev.titleEn) ? generateSlug(value) : prev.slugEn
      }));
    } else if (field === 'titleVn') {
      // Generate slug from Vietnamese title if slug hasn't been manually edited
      setFormData(prev => ({
        ...prev,
        [field]: value,
        slugVn: prev.slugVn === generateSlug(prev.titleVn) ? generateSlug(value) : prev.slugVn
      }));
    } else {
      // Handle all other fields normally
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileChange = (event, field) => {
    if (field === 'image') {
      const file = event.target.files[0];
      if (file) {
        setTempImage(URL.createObjectURL(file));
        setCropModalOpen(true);
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
      if (tempImage) URL.revokeObjectURL(tempImage);
      previews.images.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews, tempImage]);

  const handleSubmit = async (shouldPublish = false) => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      // Generate slugs if not provided
      const finalSlugEn = formData.slugEn || generateSlug(formData.titleEn);
      const finalSlugVn = formData.slugVn || generateSlug(formData.titleVn);

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
            date: formData.date.toISOString().split('T')[0],
            slugEn: finalSlugEn,
            slugVn: finalSlugVn
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

      // Add this line right before the end of the try block
      await fetchDrafts();

      // After successful creation, save the slugs:
      saveSlugToStorage(projectId, finalSlugEn, finalSlugVn);

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

      // Add pagination to the query that fetches both drafts and published posts
      const query = `
        query GetAllPosts($first: Int = 100, $skip: Int = 0) {
          drafts: projects(
            stage: DRAFT, 
            first: $first, 
            skip: $skip,
            orderBy: date_DESC
          ) {
            id
            title
            slug
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
              slug
              description {
                raw
              }
            }
          }
          published: projects(
            stage: PUBLISHED, 
            first: $first, 
            skip: $skip,
            orderBy: date_DESC
          ) {
            id
            title
            slug
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
              slug
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

  useEffect(() => {
    fetchDrafts();
  }, [refreshKey]);

  // Update the publishDraft function to also publish connected assets
  const publishDraft = async (draftId) => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      // First, fetch the latest draft data to get all asset IDs
      const getProjectAssetsQuery = `
        query GetProjectAssets($id: ID!) {
          project(where: { id: $id }) {
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
          query: getProjectAssetsQuery,
          variables: { id: draftId }
        })
      });

      const assetsResult = await assetsResponse.json();

      // Collect all asset IDs
      const assetIds = [];
      if (assetsResult.data?.project?.image?.id) {
        assetIds.push(assetsResult.data.project.image.id);
      }
      if (assetsResult.data?.project?.images) {
        assetIds.push(...assetsResult.data.project.images.map(img => img.id));
      }

      // Publish each asset first
      for (const assetId of assetIds) {
        const publishAssetResponse = await fetch(hygraphUrl, {
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
        const assetResult = await publishAssetResponse.json();
        if (assetResult.errors) {
          throw new Error(assetResult.errors[0].message);
        }
      }

      // Then publish the draft
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
      newImages: [],
      slugEn: draft.slug || '',
      slugVn: draft.localizations?.[0]?.slug || ''
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

      // Handle removed assets first
      const removedAssetIds = [];
      if (editingDraft.removedImage && editingDraft.image?.id) {
        removedAssetIds.push(editingDraft.image.id);
      }
      if (editingDraft.removedImages?.length > 0) {
        const additionalRemovedIds = editingDraft.removedImages.map(img => img.id).filter(Boolean);
        removedAssetIds.push(...additionalRemovedIds);
      }

      // Delete removed assets if any
      if (removedAssetIds.length > 0) {
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
        if (deleteResult.errors) {
          throw new Error(deleteResult.errors[0].message);
        }
      }

      // Handle new assets
      let newFeaturedImage = null;
      let newAdditionalImages = [];

      // When uploading new feature image
      if (editingDraft.newImage) {
        try {
          const asset = await createAssetInHygraph(editingDraft.newImage, hygraphUrl, authToken);
          
          await uploadFileToS3(editingDraft.newImage, asset.upload.requestPostData);
          
          // Publish the asset
          const publishResponse = await fetch(hygraphUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              query: publishAssetsMutation,
              variables: {
                where: { id: asset.id }
              }
            })
          });
          if (publishResponse.errors) {
            throw new Error(publishResponse.errors[0].message);
          }

          newFeaturedImage = asset.id;
          
          // Update editingDraft to clear removedImage flag and set new image
          setEditingDraft(prev => ({
            ...prev,
            removedImage: false,  // Clear the removedImage flag
            image: {             // Set the new image info
              id: asset.id,
              url: URL.createObjectURL(editingDraft.newImage)
            }
          }));
        } catch (error) {
          console.error('Failed to upload feature image:', error);
          throw error;
        }
      }

      // When uploading new additional images
      if (editingDraft.newImages?.length > 0) {
        for (const image of editingDraft.newImages) {
          try {
            const asset = await createAssetInHygraph(image, hygraphUrl, authToken);
            await uploadFileToS3(image, asset.upload.requestPostData);
            newAdditionalImages.push({ where: { id: asset.id } });
            
            // Add the new image to editingDraft.images with the correct structure
            setEditingDraft(prev => ({
              ...prev,
              images: [...(prev.images || []), {
                id: asset.id,
                url: URL.createObjectURL(image)
              }]
            }));
          } catch (error) {
            console.error('Failed to upload additional image:', error);
          }
        }
      }

      // Generate slugs if not provided
      const finalSlugEn = editingDraft.slugEn || generateSlug(editingDraft.titleEn);
      const finalSlugVn = editingDraft.slugVn || generateSlug(editingDraft.titleVn);

      // Prepare update variables
      const variables = {
        id: editingDraft.id,
        titleEn: editingDraft.titleEn,
        titleVn: editingDraft.titleVn,
        descriptionEn: transformToSlateAST(editEditorEn.getJSON()),
        descriptionVn: transformToSlateAST(editEditorVn.getJSON()),
        date: editingDraft.date.toISOString().split('T')[0],
        slugEn: finalSlugEn,
        slugVn: finalSlugVn,
      };

      // Handle feature image connection/disconnection
      if (editingDraft.removedImage === true && !newFeaturedImage) {
        variables.imageDisconnect = true;
      }

      if (newFeaturedImage) {
        variables.imageConnect = { id: newFeaturedImage };
      }

      // Handle additional images connection/disconnection
      if (editingDraft.removedImages?.length > 0) {
        variables.imagesDisconnect = editingDraft.removedImages.map(img => ({ id: img.id }));
      }

      if (newAdditionalImages.length > 0) {
        variables.imagesConnect = newAdditionalImages;
      }

      // Log the full response for debugging
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

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Handle publishing if needed
      if (shouldPublish) {
        const publishResult = await publishDraft(editingDraft.id);
        if (publishResult.errors) {
          throw new Error(publishResult.errors[0].message);
        }
        
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
      
      // Add refresh after saving
      await fetchDrafts();
      
      // After successful update, save the slugs:
      saveSlugToStorage(editingDraft.id, finalSlugEn, finalSlugVn);

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

      // Get connected assets
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
          variables: { ids: selectedPublished }
        })
      });

      const assetsResult = await assetsResponse.json();
      
      // Collect asset IDs
      const assetIds = [];
      assetsResult.data?.projects?.forEach(project => {
        if (project.image?.id) assetIds.push(project.image.id);
        if (project.images) assetIds.push(...project.images.map(img => img.id));
      });

      // Handle asset deletion with all required parameters
      await deleteAssetsForProjects(assetIds, hygraphUrl, authToken, drafts, selectedDrafts, publishedPosts, selectedPublished);

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
      fetchDrafts();
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
      await fetchAndPubDraftAssets();

      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      // Query to get complete project data including all assets
      const getProjectsQuery = `
        query GetProjectsWithAssets($ids: [ID!]) {
          projects(where: { id_in: $ids }) {
            id
            title
            image {
              id
              stage
            }
            images {
              id
              stage
            }
          }
        }
      `;

      // First get all project data
      const projectsResponse = await fetch(hygraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: getProjectsQuery,
          variables: {
            ids: selectedDrafts
          }
        })
      });

      const projectsResult = await projectsResponse.json();

      // Collect all asset IDs (both feature images and additional images)
      const assetIds = new Set();
      projectsResult.data?.projects?.forEach(project => {
        if (project.image?.id) {
          assetIds.add(project.image.id);
        }
        if (project.images) {
          project.images.forEach(img => {
            assetIds.add(img.id);
          });
        }
      });

      // Publish all assets first
      for (const assetId of assetIds) {
        try {
          const publishAssetResponse = await fetch(hygraphUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              query: `
                mutation PublishAsset($where: AssetWhereUniqueInput!) {
                  publishAsset(where: $where, to: PUBLISHED) {
                    id
                    stage
                  }
                }
              `,
              variables: {
                where: {
                  id: assetId
                }
              }
            })
          });

          const assetResult = await publishAssetResponse.json();
          if (assetResult.errors) {
            throw new Error(assetResult.errors[0].message);
          }
        } catch (error) {
          console.error(`Error publishing asset ${assetId}:`, error);
        }
      }

      // Then publish the drafts
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
                publishProject(where: $where, to: PUBLISHED, locales: [en, vn]) {
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

      setSnackbar({
        open: true,
        message: 'Selected drafts published successfully!',
        severity: 'success'
      });

      setSelectedDrafts([]);
      fetchDrafts(); // Refresh the data

    } catch (error) {
      console.error('Error publishing drafts:', error);
      setSnackbar({
        open: true,
        message: `Failed to publish: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Update the deleteSelectedDrafts function
  const deleteSelectedDrafts = async () => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      // First, get the draft data including assets
      const selectedDraftsData = drafts.filter(draft => selectedDrafts.includes(draft.id));

      // Collect asset IDs from the drafts data we already have
      const assetIds = [];
      selectedDraftsData.forEach(draft => {
        if (draft.image?.id) {
          assetIds.push(draft.image.id);
        }
        if (draft.images) {
          const imageIds = draft.images.map(img => img.id);
          assetIds.push(...imageIds);
        }
      });

      // Delete assets first if there are any
      if (assetIds.length > 0) {
        await deleteAssetsForProjects(assetIds, hygraphUrl, authToken, drafts, selectedDrafts, publishedPosts, selectedPublished);
      }

      // Then delete the drafts
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

  const fetchAndPubDraftAssets = async () => {
    try {
      const hygraphUrl = process.env.REACT_APP_HYGRAPH_API_URL;
      const authToken = process.env.REACT_APP_HYGRAPH_AUTH_TOKEN;

      // First fetch draft assets
      const query = `
        query GetDraftAssets {
          assets(
            stage: DRAFT
            where: {
              AND: [
                { publishedAt: null }
                { documentInStages_some: { stage: DRAFT } }
                { documentInStages_none: { stage: PUBLISHED } }
              ]
            }
          ) {
            id
            fileName
            size
            locale
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

      // Get the asset IDs
      const assetIds = result.data?.assets?.map(asset => asset.id) || [];

      // Publish each asset
      for (const assetId of assetIds) {
        try {
          const publishResponse = await fetch(hygraphUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              query: `
                mutation PublishAsset($where: AssetWhereUniqueInput!) {
                  publishAsset(where: $where, to: PUBLISHED) {
                    id
                    fileName
                    stage
                  }
                }
              `,
              variables: {
                where: {
                  id: assetId
                }
              }
            })
          });

          const publishResult = await publishResponse.json();
          if (publishResult.errors) {
            throw new Error(publishResult.errors[0].message);
          }
        } catch (error) {
          console.error(`Error publishing asset ${assetId}:`, error);
        }
      }

      setSnackbar({
        open: true,
        message: `Published ${assetIds.length} draft assets successfully!`,
        severity: 'success'
      });

    } catch (error) {
      console.error('Error in fetch and publish process:', error);
      setSnackbar({
        open: true,
        message: `Error publishing draft assets: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Add this function to handle the cropping process
  const getCroppedImg = async (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          blob.name = 'cropped.jpg';
          resolve(blob);
        }
      }, 'image/jpeg', 1);
    });
  };

  // Add this function to handle crop completion
  const handleCropComplete = async () => {
    if (imgRef.current && completedCrop?.width && completedCrop?.height) {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      // Create a better file name
      const fileName = editingDraft.id ? 
        `feature_image_${editingDraft.id}.jpg` : 
        `feature_image_new.jpg`;

      // Convert blob to file with the new name
      const croppedFile = new File([croppedImageBlob], fileName, { type: 'image/jpeg' });
      
      if (editingDraft.id) {
        // Edit mode
        setEditingDraft(prev => ({
          ...prev,
          newImage: croppedFile,
          removedImage: true // Mark to remove old image
        }));
      } else {
        // New post mode
        setFormData(prev => ({ ...prev, image: croppedFile }));
        setPreviews(prev => ({ 
          ...prev, 
          image: URL.createObjectURL(croppedFile)
        }));
      }
      
      setCropModalOpen(false);
      setTempImage(null);
    }
  };

  // Update the handleEditFileChange function
  const handleEditFileChange = (event, field) => {
    if (field === 'image') {
      const file = event.target.files[0];
      if (file) {
        setTempImage(URL.createObjectURL(file));
        setCropModalOpen(true);
      }
    } else if (field === 'images') {
      const files = Array.from(event.target.files);
      setEditingDraft(prev => ({
        ...prev,
        newImages: [...(prev.newImages || []), ...files] // Ensure prev.newImages exists
      }));
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

  const items = [
    {
      key: 'donations',
      label: 'Donations Data',
      children: <DonationsDataTable />
    }
  ];
  if (items.errors) {
    throw new Error(items.errors[0].message);
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
              <Tab label="Manual Posting" />
              <Tab label="Facebook Posting" />
              <Tab label="Donations Data" />
            </Tabs>

            <Box sx={{ p: { xs: 3, md: 6 } }}>
              {activeTab === 0 && (
                <Box>
                  <Tabs
                    value={activeSubTab}
                    onChange={handleSubTabChange}
                    sx={{
                      mb: 4,
                      borderBottom: '1px solid rgba(0,0,0,0.1)',
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        minHeight: '48px'
                      }
                    }}
                  >
                    <Tab label="Add Post" />
                    <Tab label="Manage Drafts" />
                    <Tab label="Manage Published" />
                  </Tabs>

                  {/* Original content for each sub-tab */}
                  {activeSubTab === 0 && (
                    // Original "Add Post" content
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

                      {/* URL Slug Fields */}
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          label="URL Slug (English)"
                          value={formData.slugEn || ''}
                          onChange={(e) => handleInputChange('slugEn', e.target.value)}
                          helperText="Leave empty to auto-generate from title"
                          InputProps={{
                            startAdornment: (
                              <Typography 
                                color="text.secondary" 
                                sx={{ whiteSpace: 'nowrap' }}
                              >
                                /projects/
                              </Typography>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          label="URL Slug (Vietnamese)"
                          value={formData.slugVn || ''}
                          onChange={(e) => handleInputChange('slugVn', e.target.value)}
                          helperText="Leave empty to auto-generate from title"
                          InputProps={{
                            startAdornment: (
                              <Typography 
                                color="text.secondary" 
                                sx={{ whiteSpace: 'nowrap' }}
                              >
                                /projects/
                              </Typography>
                            ),
                          }}
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
                                onChange={(e) => {
                                  const files = Array.from(e.target.files);
                                  setEditingDraft(prev => ({ 
                                    ...prev, 
                                    images: [...(prev.images || []), ...files.map(file => ({
                                      url: URL.createObjectURL(file),
                                      file
                                    }))],
                                    newImages: [...(prev.newImages || []), ...files]
                                  }));
                                }}
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
                  {activeSubTab === 1 && (
                    <>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              color: colorPalette.accent2,
                              fontWeight: 600 
                            }}
                          >
                            Manage Drafts
                          </Typography>
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
                    </>
                  )}
                  {activeSubTab === 2 && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: colorPalette.accent2,
                            fontWeight: 600 
                          }}
                        >
                          Manage Published
                        </Typography>
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
                            {/* Edit icon removed */}
                          </Stack>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3 }}>Facebook Posting</Typography>
                  {/* Facebook posting content will go here */}
                </Box>
              )}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3 }}>Donations Data</Typography>
                  <DonationsDataTable />
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
        maxWidth="lg"
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

            {/* URL Slug Fields */}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="URL Slug (English)"
                value={editingDraft?.slugEn || ''}
                onChange={(e) => setEditingDraft(prev => ({ 
                  ...prev, 
                  slugEn: e.target.value 
                }))}
                InputProps={{
                  startAdornment: (
                    <Typography 
                      color="text.secondary" 
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      /projects/
                    </Typography>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="URL Slug (Vietnamese)"
                value={editingDraft?.slugVn || ''}
                onChange={(e) => setEditingDraft(prev => ({ 
                  ...prev, 
                  slugVn: e.target.value 
                }))}
                InputProps={{
                  startAdornment: (
                    <Typography 
                      color="text.secondary" 
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      /projects/
                    </Typography>
                  ),
                }}
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Featured Image</Typography>
                <Button
                  component="label"
                  variant="outlined"
                  sx={{
                    width: '100%',
                    height: editingDraft.newImage || (editingDraft.image && !editingDraft.removedImage) ? 'auto' : '120px',
                    border: '2px dashed rgba(0,0,0,0.12)',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    padding: editingDraft.newImage || (editingDraft.image && !editingDraft.removedImage) ? '0' : '20px',
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
                  {editingDraft.newImage ? (
                    <>
                      <img 
                        src={URL.createObjectURL(editingDraft.newImage)}
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
                            setEditingDraft(prev => ({ ...prev, newImage: null }));
                          }}
                          sx={{ color: 'white' }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </>
                  ) : editingDraft.image && !editingDraft.removedImage ? (
                    <>
                      <img 
                        src={editingDraft.image.url}
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
                            setEditingDraft(prev => ({ ...prev, removedImage: true }));
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
                    onChange={(e) => handleEditFileChange(e, 'image')}
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
                            src={image.url || URL.createObjectURL(image)} // Handle both URL strings and File objects
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
                                  if (response.errors) {
                                    throw new Error(response.errors[0].message);
                                  }
                                  const result = await response.json();
                                  if (result.errors) {
                                    throw new Error(result.errors[0].message);
                                  }
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
                        setEditingDraft(prev => ({ 
                          ...prev, 
                          images: [...(prev.images || []), ...files.map(file => ({
                            url: URL.createObjectURL(file),
                            file
                          }))],
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
      <Dialog
        open={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false);
          setTempImage(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Crop Featured Image</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', mt: 2 }}>
            {tempImage && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={16/9}
              >
                <img
                  ref={imgRef}
                  src={tempImage}
                  style={{ maxWidth: '100%' }}
                  alt="Crop preview"
                />
              </ReactCrop>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setCropModalOpen(false);
              setTempImage(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCropComplete}
            variant="contained"
            color="primary"
          >
            Apply Crop
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPanel;