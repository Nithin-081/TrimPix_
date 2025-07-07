import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// API Configuration
const API_CONFIG = {
  // Remove.bg API (replace with your actual API key)
  REMOVE_BG_API_KEY: process.env.REMOVE_BG_API_KEY || 'dummy-remove-bg-api-key-replace-with-actual',
  REMOVE_BG_URL: 'https://api.remove.bg/v1.0/removebg',
  
  // Alternative: Clipdrop API (replace with your actual API key)
  CLIPDROP_API_KEY: process.env.CLIPDROP_API_KEY || 'dummy-clipdrop-api-key-replace-with-actual',
  CLIPDROP_URL: 'https://clipdrop-api.co/remove-background/v1',
  
  // Alternative: PhotoRoom API (replace with your actual API key)
  PHOTOROOM_API_KEY: process.env.PHOTOROOM_API_KEY || 'dummy-photoroom-api-key-replace-with-actual',
  PHOTOROOM_URL: 'https://sdk.photoroom.com/v1/segment'
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TrimPix API is running',
    timestamp: new Date().toISOString()
  });
});

// Get API status
app.get('/api/status', (req, res) => {
  const hasRemoveBgKey = API_CONFIG.REMOVE_BG_API_KEY !== 'dummy-remove-bg-api-key-replace-with-actual';
  const hasClipdropKey = API_CONFIG.CLIPDROP_API_KEY !== 'dummy-clipdrop-api-key-replace-with-actual';
  const hasPhotoroomKey = API_CONFIG.PHOTOROOM_API_KEY !== 'dummy-photoroom-api-key-replace-with-actual';
  
  res.json({
    apis: {
      removeBg: {
        configured: hasRemoveBgKey,
        status: hasRemoveBgKey ? 'ready' : 'needs_api_key'
      },
      clipdrop: {
        configured: hasClipdropKey,
        status: hasClipdropKey ? 'ready' : 'needs_api_key'
      },
      photoroom: {
        configured: hasPhotoroomKey,
        status: hasPhotoroomKey ? 'ready' : 'needs_api_key'
      }
    },
    recommendation: !hasRemoveBgKey && !hasClipdropKey && !hasPhotoroomKey 
      ? 'Please configure at least one API key in your .env file'
      : 'API keys configured successfully'
  });
});

// Remove background using Remove.bg API
async function removeBackgroundWithRemoveBg(imagePath, options = {}) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    
    const formData = new FormData();
    formData.append('image_file', new Blob([imageBuffer]), 'image.jpg');
    formData.append('size', options.size || 'auto');
    
    if (options.type) {
      formData.append('type', options.type);
    }
    
    if (options.format) {
      formData.append('format', options.format);
    }

    const response = await axios.post(API_CONFIG.REMOVE_BG_URL, formData, {
      headers: {
        'X-Api-Key': API_CONFIG.REMOVE_BG_API_KEY,
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'arraybuffer'
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Remove.bg API error:', error.response?.data || error.message);
    throw new Error(`Remove.bg API failed: ${error.response?.status || error.message}`);
  }
}

// Remove background using Clipdrop API
async function removeBackgroundWithClipdrop(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    
    const formData = new FormData();
    formData.append('image_file', new Blob([imageBuffer]), 'image.jpg');

    const response = await axios.post(API_CONFIG.CLIPDROP_URL, formData, {
      headers: {
        'x-api-key': API_CONFIG.CLIPDROP_API_KEY,
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'arraybuffer'
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Clipdrop API error:', error.response?.data || error.message);
    throw new Error(`Clipdrop API failed: ${error.response?.status || error.message}`);
  }
}

// Remove background using PhotoRoom API
async function removeBackgroundWithPhotoroom(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    
    const formData = new FormData();
    formData.append('image_file', new Blob([imageBuffer]), 'image.jpg');

    const response = await axios.post(API_CONFIG.PHOTOROOM_URL, formData, {
      headers: {
        'X-API-Key': API_CONFIG.PHOTOROOM_API_KEY,
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'arraybuffer'
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error('PhotoRoom API error:', error.response?.data || error.message);
    throw new Error(`PhotoRoom API failed: ${error.response?.status || error.message}`);
  }
}

// Main background removal endpoint
app.post('/api/remove-background', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { 
      provider = 'removebg',
      size = 'auto',
      type = 'auto',
      format = 'png',
      backgroundColor,
      edgeSmoothing = 0,
      feathering = 0
    } = req.body;

    console.log(`Processing image with ${provider} provider...`);

    let processedImageBuffer;

    // Choose API provider
    switch (provider) {
      case 'removebg':
        if (API_CONFIG.REMOVE_BG_API_KEY === 'dummy-remove-bg-api-key-replace-with-actual') {
          return res.status(400).json({ 
            error: 'Remove.bg API key not configured',
            message: 'Please add your Remove.bg API key to the .env file'
          });
        }
        processedImageBuffer = await removeBackgroundWithRemoveBg(req.file.path, {
          size, type, format
        });
        break;
        
      case 'clipdrop':
        if (API_CONFIG.CLIPDROP_API_KEY === 'dummy-clipdrop-api-key-replace-with-actual') {
          return res.status(400).json({ 
            error: 'Clipdrop API key not configured',
            message: 'Please add your Clipdrop API key to the .env file'
          });
        }
        processedImageBuffer = await removeBackgroundWithClipdrop(req.file.path);
        break;
        
      case 'photoroom':
        if (API_CONFIG.PHOTOROOM_API_KEY === 'dummy-photoroom-api-key-replace-with-actual') {
          return res.status(400).json({ 
            error: 'PhotoRoom API key not configured',
            message: 'Please add your PhotoRoom API key to the .env file'
          });
        }
        processedImageBuffer = await removeBackgroundWithPhotoroom(req.file.path);
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid provider specified' });
    }

    // Apply post-processing if requested
    let finalImageBuffer = processedImageBuffer;

    if (backgroundColor || edgeSmoothing > 0 || feathering > 0) {
      const sharpImage = sharp(processedImageBuffer);
      
      // Apply background color if specified
      if (backgroundColor && backgroundColor !== 'transparent') {
        const { width, height } = await sharpImage.metadata();
        const background = sharp({
          create: {
            width,
            height,
            channels: 4,
            background: backgroundColor
          }
        });
        
        finalImageBuffer = await background
          .composite([{ input: processedImageBuffer }])
          .png()
          .toBuffer();
      } else {
        // Apply edge smoothing/feathering
        if (edgeSmoothing > 0 || feathering > 0) {
          const blur = Math.max(edgeSmoothing, feathering) / 10;
          finalImageBuffer = await sharpImage
            .blur(blur)
            .png()
            .toBuffer();
        }
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Return processed image
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="trimpix-background-removed.png"'
    });
    
    res.send(finalImageBuffer);

  } catch (error) {
    console.error('Background removal error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Background removal failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Base64 image processing endpoint
app.post('/api/remove-background-base64', async (req, res) => {
  try {
    const { 
      image,
      provider = 'removebg',
      size = 'auto',
      type = 'auto',
      format = 'png',
      backgroundColor,
      edgeSmoothing = 0,
      feathering = 0
    } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Convert base64 to buffer and save temporarily
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const tempFilePath = path.join(uploadsDir, `temp-${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, imageBuffer);

    let processedImageBuffer;

    // Choose API provider
    switch (provider) {
      case 'removebg':
        if (API_CONFIG.REMOVE_BG_API_KEY === 'dummy-remove-bg-api-key-replace-with-actual') {
          return res.status(400).json({ 
            error: 'Remove.bg API key not configured',
            message: 'Please add your Remove.bg API key to the .env file'
          });
        }
        processedImageBuffer = await removeBackgroundWithRemoveBg(tempFilePath, {
          size, type, format
        });
        break;
        
      case 'clipdrop':
        if (API_CONFIG.CLIPDROP_API_KEY === 'dummy-clipdrop-api-key-replace-with-actual') {
          return res.status(400).json({ 
            error: 'Clipdrop API key not configured',
            message: 'Please add your Clipdrop API key to the .env file'
          });
        }
        processedImageBuffer = await removeBackgroundWithClipdrop(tempFilePath);
        break;
        
      case 'photoroom':
        if (API_CONFIG.PHOTOROOM_API_KEY === 'dummy-photoroom-api-key-replace-with-actual') {
          return res.status(400).json({ 
            error: 'PhotoRoom API key not configured',
            message: 'Please add your PhotoRoom API key to the .env file'
          });
        }
        processedImageBuffer = await removeBackgroundWithPhotoroom(tempFilePath);
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid provider specified' });
    }

    // Apply post-processing if requested
    let finalImageBuffer = processedImageBuffer;

    if (backgroundColor || edgeSmoothing > 0 || feathering > 0) {
      const sharpImage = sharp(processedImageBuffer);
      
      if (backgroundColor && backgroundColor !== 'transparent') {
        const { width, height } = await sharpImage.metadata();
        const background = sharp({
          create: {
            width,
            height,
            channels: 4,
            background: backgroundColor
          }
        });
        
        finalImageBuffer = await background
          .composite([{ input: processedImageBuffer }])
          .png()
          .toBuffer();
      } else if (edgeSmoothing > 0 || feathering > 0) {
        const blur = Math.max(edgeSmoothing, feathering) / 10;
        finalImageBuffer = await sharpImage
          .blur(blur)
          .png()
          .toBuffer();
      }
    }

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    // Return base64 encoded result
    const base64Result = finalImageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Result}`;

    res.json({
      success: true,
      image: dataUrl,
      provider: provider,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Background removal error:', error);
    
    res.status(500).json({ 
      error: 'Background removal failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TrimPix API server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 API status: http://localhost:${PORT}/api/status`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});