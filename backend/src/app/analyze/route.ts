import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Multer setup for /dataset
const datasetDir = path.join(__dirname, '../../../dataset');
console.log('Dataset directory path:', datasetDir);
console.log('Dataset directory exists:', fs.existsSync(datasetDir));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the dataset directory exists
    if (!fs.existsSync(datasetDir)) {
      fs.mkdirSync(datasetDir, { recursive: true });
    }
    cb(null, datasetDir);
  },
  filename: (req, file, cb) => {
    // Use original name, but you could randomize for collisions
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Upload endpoint
export const uploadImage = [
  upload.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    res.json({ filename: req.file.filename });
  },
];

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const analyzeImage = async (req: Request, res: Response) => {
  try {
    const { imagePath } = req.body;
    if (!imagePath) {
      res.status(400).json({ error: 'Image path is required. Please provide imagePath in the request body.' });
      return;
    }
    // Construct the full path to the image in the dataset directory
    const fullImagePath = path.join(__dirname, '../../../dataset', imagePath);
    // Check if the file exists
    if (!fs.existsSync(fullImagePath)) {
      res.status(404).json({ error: `Image not found: ${imagePath}` });
      return;
    }
    // Read the image file
    const imageBuffer = fs.readFileSync(fullImagePath);
    // Convert to base64 for Gemini API
    const base64Image = imageBuffer.toString('base64');
    // Create the image part for Gemini
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg',
      },
    };
    // Create the prompt
    const prompt = "List the total amount spent in this receipt and itemize it. Please provide a clear breakdown of all items and their individual costs, then give the total amount spent.";
    // Get the Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    // Generate content with Gemini
    const result = await model.generateContent([
      { text: prompt },
      imagePart,
    ]);
    const response = await result.response;
    const text = response.text();
    res.json({
      success: true,
      analysis: text,
      imagePath: imagePath,
    });
    return;
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({
      error: 'Failed to analyze image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

export const getModelStatus = async (req: Request, res: Response) => {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        status: 'error',
        message: 'Gemini API key not configured',
      });
      return;
    }
    // Test the model with a simple prompt
    const testModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await testModel.generateContent('Hello');
    await result.response;
    res.json({
      status: 'ok',
      message: 'Gemini AI model is working correctly',
      model: 'gemini-pro-vision',
    });
    return;
  } catch (error) {
    console.error('Error checking model status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to Gemini AI',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
}; 