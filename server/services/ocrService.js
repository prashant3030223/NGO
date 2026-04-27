const Tesseract = require('tesseract.js');
const fs = require('fs');
const pdf = require('pdf-parse');

const processImage = async (filePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
};

const processPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF Parse Error:', error);
    throw error;
  }
};

module.exports = {
  processImage,
  processPDF
};
