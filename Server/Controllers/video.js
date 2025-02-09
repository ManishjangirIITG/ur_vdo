import videofile from "../models/videofile.js";
import ffmpeg from "fluent-ffmpeg";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { processAllQualities } from "../services/videoProcessing.js";
// import videojs from 'video.js'

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

        // Generate a unique filename
        const fileExt = path.extname(req.file.originalname);
        const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
        
        // Define quality versions
        const qualities = ['480p', '720p', '1080p'];

        // Process video for different qualities
        const qualityFiles = await processAllQualities(req.file.path, path.join('uploads', uniqueFilename), qualities);

        const newVideo = new videofile({
            videotitle: req.body.title || 'Untitled',
            description: req.body.description || '',
            filename: uniqueFilename,
            filepath: `/uploads/${uniqueFilename}`,
            filetype: req.file.mimetype,
            filesize: req.file.size,
            videochanel: req.body.channel || req.user._id.toString(),
            uploadedBy: req.user._id,
            createdAt: new Date(),
            qualities: qualityFiles
        });

        // Save the original file
        const originalPath = path.join('uploads', uniqueFilename);
        fs.renameSync(req.file.path, originalPath);

        const savedVideo = await newVideo.save();
        
        res.status(201).json({
            message: "Video uploaded successfully",
            data: savedVideo
        });
    } catch (error) {
        console.error("Error in uploadvideo controller:", error);
        // Clean up the uploaded files if there's an error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
                // Also remove any quality versions that might have been created
                const fileExt = path.extname(req.file.originalname);
                const qualities = ['480p', '720p', '1080p'];
                for (const quality of qualities) {
                    const qualityFilename = `${path.parse(req.file.filename).name}_${quality}${fileExt}`;
                    const qualityPath = path.join('uploads', qualityFilename);
                    if (fs.existsSync(qualityPath)) {
                        fs.unlinkSync(qualityPath);
                    }
                }
            } catch (unlinkError) {
                console.error("Error removing uploaded files:", unlinkError);
            }
        }
        res.status(500).json({ 
            message: "Error uploading video",
            error: error.message 
        });
    }
};


export const getvideos = async (req, res) => {
    console.log("Received request for videos");
    try {
      const videos = await videofile.find();
      res.json(videos);
    } catch (error) {
      console.error('Error in getvideos:', error);
      res.status(500).json({ message: "Error fetching videos", error: error.message });
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

