import videofile from "../models/videofile.js";
import Ffmpeg from "fluent-ffmpeg";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
// import videojs from 'video.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadvideo = async (req, res) => {
    try {
        console.log("Processing upload request...");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        console.log("User:", req.user);
        
        if (!req.file) {
            return res.status(400).json({ message: "No video file provided" });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // Validate file type
        // if (!req.file.mimetype.startsWith('video/')) {
        //     // Remove the uploaded file
        //     fs.unlinkSync(req.file.path);
        //     return res.status(400).json({
        //         message: "Invalid file type. Only video files are allowed."
        //     });
        // }

        // // Validate required fields
        // if (!req.body.title) {
        //     // Remove the uploaded file
        //     fs.unlinkSync(req.file.path);
        //     return res.status(400).json({
        //         message: "Title is required"
        //     });
        // }

        // Generate a unique filename
        const fileExt = path.extname(req.file.originalname);
        const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
        
        const newVideo = new videofile({
            videotitle: req.body.title || 'Untitled',
            description: req.body.description || '',
            filename: uniqueFilename,
            filepath: `/uploads/${uniqueFilename}`,
            filetype: req.file.mimetype,
            filesize: req.file.size,
            videochanel: req.body.channel || req.user._id.toString(),
            uploadedBy: req.user._id,
            createdAt: new Date()
        });

        // Rename the file to use the unique filename
        const newPath = path.join(path.dirname(req.file.path), uniqueFilename);
        fs.renameSync(req.file.path, newPath);

        const savedVideo = await newVideo.save();
        
        res.status(201).json({
            message: "Video uploaded successfully",
            data: savedVideo
        });
    } catch (error) {
        console.error("Error in uploadvideo controller:", error);
        // Clean up the uploaded file if there's an error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error("Error removing uploaded file:", unlinkError);
            }
        }
        res.status(500).json({ 
            message: "Error uploading video",
            error: error.message 
        });
    }
};

export const getvideos = async (req, res) => {
    try {
        // Get videos from database with populated user data
        const dbVideos = await videofile.find()
            .populate('uploadedBy', 'username email')
            .lean();
        console.log('Found videos in DB:', dbVideos.length);

        // Get videos from uploads folder
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        const files = fs.readdirSync(uploadsDir)
            .filter(file => file.match(/\.(mp4|webm|mov)$/i));

        // Create or update MongoDB records for files in uploads folder
        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            
            // Check if video already exists in DB
            const existingVideo = dbVideos.find(v => v.filename === file);
            
            if (!existingVideo) {
                // Create new video record if it doesn't exist
                const newVideo = new videofile({
                    videotitle: file.split('.')[0],
                    filename: file,
                    filepath: `/uploads/${file}`,
                    filetype: 'video/mp4',
                    filesize: stats.size,
                    uploadedBy: req.user?._id || null, // If available
                    videochanel: 'Uncategorized',
                    createdAt: stats.ctime
                });
                await newVideo.save();
                dbVideos.push(newVideo);
            }
        }

        // Remove DB entries for files that no longer exist
        for (const video of dbVideos) {
            const filePath = path.join(uploadsDir, video.filename);
            if (!fs.existsSync(filePath)) {
                await videofile.findByIdAndDelete(video._id);
            }
        }

        // Fetch updated list
        const updatedVideos = await videofile.find()
            .populate('uploadedBy', 'username email')
            .lean();

        res.status(200).json(updatedVideos);
    } catch (error) {
        console.error('Error in getvideos:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add a streaming endpoint
export const streamVideo = async (req, res) => {
    try {
        const { filename } = req.params;
        const videoPath = path.join(__dirname, '..', 'uploads', filename);

        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ message: "Video not found" });
        }

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
    } catch (error) {
        console.error('Error in streamVideo:', error);
        res.status(500).json({ message: error.message });
    }
};

