import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileQueue } from '../jobs/fileQueue.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({ storage });

export const handleUpload = async (req, res) => {
    const { title, description } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        const fileData = {
            originalName: req.file.originalname,
            storagePath: req.file.path,
            title,
            description,
            userId,
        };

        const savedFile = await prisma.file.create({ data: fileData });
        await fileQueue.add('process-file', {
            fileId: savedFile.id,
            storagePath: savedFile.storagePath
        });

        res.json({ file: savedFile });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Unauthorized' });
    }
};

export const listFiles = async (req, res) => {
    try {
        const userId = req.user.userId;

        const files = await prisma.file.findMany({
            where: { userId },
            orderBy: { uploadedAt: 'desc' },
        });

        res.json({ files });
    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
};

export const getFileById = async (req, res) => {
    const fileId = parseInt(req.params.id);
    const userId = req.user.userId;

    try {
        const file = await prisma.file.findFirst({
            where: {
                id: fileId,
                userId: userId, // ensure users can only view their own files
            },
        });

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.json(file);
    } catch (err) {
        console.error('Error fetching file:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const downloadFile = async (req, res) => {
    const fileId = parseInt(req.params.id);

    const file = await prisma.file.findUnique({
        where: { id: fileId },
    });

    if (!file) {
        return res.status(404).json({ error: 'File not found' });
    }

    // Remove leading "uploads/" or "uploads\" from the stored path
    const sanitizedPath = file.storagePath.replace(/^uploads[\\/]/, '');

    const filePath = path.join(process.cwd(), 'uploads', sanitizedPath);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Stored file not found' });
    }

    res.download(filePath, file.originalName);
};

export const deleteFile = async (req, res) => {
    const fileId = parseInt(req.params.id);

    const file = await prisma.file.findUnique({
        where: { id: fileId },
    });

    if (!file) {
        return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const filePath = path.join(process.cwd(), 'uploads', file.storagePath.replace(/^uploads[\/]/, ''));

    // Delete file from filesystem if it exists
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    // Delete file record from DB
    await prisma.file.delete({
        where: { id: fileId },
    });

    res.json({ message: 'File deleted successfully' });
};