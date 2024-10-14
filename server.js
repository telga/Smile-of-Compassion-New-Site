const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000'
}));

// Add this logging middleware
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

app.get('/api/getGooglePhotos', async (req, res) => {
  console.log('API route hit');
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Google Photos share URL is required' });
  }

  console.log('Received request for Google Photos URL:', url);

  try {
    const response = await axios.get(url);
    const html = response.data;
    console.log('Received HTML content length:', html.length);
    const imageUrls = extractImageUrlsFromHtml(html);
    console.log('Extracted image URLs:', imageUrls.length);
    
    res.json({ images: imageUrls.map(url => ({ url })) });
  } catch (error) {
    console.error('Error fetching Google Photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos', details: error.message });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  console.log('Catch-all route hit');
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

function extractImageUrlsFromHtml(html) {
  const regex = /\["(https:\/\/lh3\.googleusercontent\.com\/[^"]+)"/g;
  const matches = html.matchAll(regex);
  return Array.from(matches, m => m[1]);
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Add this error handling middleware at the end of your server.js file
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
