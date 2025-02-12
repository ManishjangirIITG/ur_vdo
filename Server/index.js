import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from "cors";
import bodyParser from "body-parser";
import videoRoutes from './Routes/video.js';
import userRoutes from './Routes/user.js';
import path from 'path';
import commentRoutes from './Routes/comment.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GridFSBucket } from 'mongodb';
import { conn } from './db.js';
import { errorHandler } from './middleware/error.js';
import fileUpload from "express-fileupload";
import Ffmpeg from "fluent-ffmpeg";
import get_theme from './Routes/theme.js'
import {locationMiddleware} from "./middleware/location.js";
// import Video from "../Server/models/Video.js"

dotenv.config(); // Ensure this is at the top to load environment variables
const app = express();
app.set('trust proxy', true);

// Connect to MongoDB first
mongoose.connect(process.env.DB_URL, {
    serverSelectionTimeoutMS: 90000,
    socketTimeoutMS: 150000,
    connectTimeoutMS: 90000,
})
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
});

// CORS configuration with specific options
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'Content-Range']
}));

app.use(locationMiddleware);
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Remove previous /uploads middleware and add this new one
app.use('/uploads', (req, res) => {
    const filename = req.url.split('/').pop();
    const filePath = path.join(__dirname, 'uploads', filename);

    console.log('Requested video:', filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Video not found');
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;

        const stream = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Cross-Origin-Resource-Policy': 'cross-origin'
        });

        stream.pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Cross-Origin-Resource-Policy': 'cross-origin'
        });
        fs.createReadStream(filePath).pipe(res);
    }
});

app.get('/', (req, res) => {
    res.send("Your tube is working")
})

app.use((req, res, next) => {
    res.removeHeader('Cross-Origin-Opener-Policy');
    next();
});

// Add this before your routes but after CORS
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Add this after your existing middleware but before routes
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request body:', req.body);
    next();
});

app.use(bodyParser.json())
app.use('/user', userRoutes)
app.use('/video', videoRoutes)
app.use('/comment', commentRoutes)
app.use(`/get_theme`,get_theme)

// Add this after your routes
app.use(errorHandler);

// Update your error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
});


// Add this route for debugging
app.get('/check-video/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    console.log('Checking file:', filePath);
    if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        res.json({
            exists: true,
            size: stat.size,
            path: filePath
        });
    } else {
        res.json({
            exists: false,
            checkedPath: filePath
        });
    }
});

app.get('/video/videos', async (req, res) => {
    try {
        const videos = await videofiles.find({})
            .select('videotitle description filename filepath filetype filesize uploadedBy videochanel views likes createdAt updatedAt')
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        console.log('Videos fetched:', videos);
        res.status(200).json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Error fetching videos', error: error.toString() });
    }
});
// app.get('/api/video/:id', async (req, res) => {
//     const video = await Video.findById(req.params.id);
//     if (!video) return res.status(404).send('Video not found');
//     res.json(video);
// });

app.get('/api/video/:id/:quality', (req, res) => {
    const { id, quality } = req.params;
    const videoPath = `./uploads/${id}_${quality}.mp4`;

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});


// Add a route to check video availability
app.get('/video/check/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    const exists = fs.existsSync(filePath);
    res.json({
        exists,
        filename: req.params.filename,
        path: filePath
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});

