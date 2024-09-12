// Dependencies
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// File system module for handling file operations
const writeFileAsync = fs.promises.writeFile;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imageUpload = async (imageData, imageName) => {
  const imagePath = path.join(__dirname, `../../../public/images/${imageName}`);
  // Save image to file system
  try {
    // Buffer is a global object that can be used to convert data to different encoding types
    await writeFileAsync(imagePath, Buffer.from(imageData, 'base64'));
    console.log('Image saved successfully');
    return true;
  } catch (error) {
    console.error('Error while saving image', error.message);
    return { error: error.message };
  }
};

export default imageUpload;
