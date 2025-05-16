import express from 'express';
import { deleteFile, downloadFile, getFileById, handleUpload, listFiles, upload } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const uploadRouter = express.Router();

uploadRouter.post('/', authenticate,upload.single('file'), handleUpload);
uploadRouter.get('/list',authenticate, listFiles);
uploadRouter.get('/:id', authenticate, getFileById);
uploadRouter.get('/:id/download', authenticate, downloadFile);
uploadRouter.delete('/:id/delete', authenticate, deleteFile);


export default uploadRouter;
