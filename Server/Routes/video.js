import express from "express"
import { likevideocontroller } from "../Controllers/like.js";
import { viewscontroller } from "../Controllers/views.js";
import { getalllikedvideo, deletelikedvideo, likedvideocontroller } from "../Controllers/likedvideo.js";
import { uploadvideo, getvideos, streamVideo } from "../Controllers/video.js";
import { historycontroller, deletehistory, getallhistorycontroller } from "../Controllers/History.js";
import { watchlatercontroller, getallwatchlatercontroller, deletewatchlater } from "../Controllers/watchlater.js";
import upload from "../Helper/filehelper.js";
import auth from "../middleware/auth.js"
import path from 'path';
import fs from 'fs';
import Video from '../models/Video.js'
import mongoose from "mongoose";
import videofile from "../models/videofile.js";
import cors from 'cors'

const routes = express.Router();
// const videofiles = mongoose.model('videofiles')

// Get all videos
routes.get('/', async (req, res) => {
    try {
        const videos = await videofile.find()
            .populate('uploadedBy', 'username')
            .sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Error fetching videos' });
    }
});
routes.get('/videos', getvideos)

// routes.get('/details/:videoId', async (req, res) => {
//     try {
//         const { videoId } = req.params; // ✅ Fix: Get videoId correctly
//         console.log("Fetching video from database for ID:", videoId);

//         const video = await Video.findById(videoId); // ✅ Ensure `Video` model is used

//         if (!video) {
//             console.error("Video not found for ID:", videoId);
//             return res.status(404).json({ message: "Video not found" });
//         }

//         console.log("Video found:", video);
//         res.json(video);
//     } catch (error) {
//         console.error("Error fetching video details:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// });

routes.get('/details/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const video = await videofile.findOneAndUpdate({ filename: filename },{ $inc: { views: 1 } },
            { new: true });

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.json(video);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
});

routes.options('/stream/:baseFilename/:quality', cors());
routes.get('/stream/:baseFilename/:quality', cors(), (req, res) => {
    try {
        const { baseFilename, quality } = req.params;
        const validQualities = ['original', '480p', '720p', '1080p'];

        if (!validQualities.includes(quality)) {
            return res.status(400).json({
                error: 'Invalid quality format',
                validQualities
            });
        }

        const videoFilename = quality === 'original'
            ? `${baseFilename}.mp4`
            : `${baseFilename}_${quality}.mp4`;

        const filePath = path.join(process.cwd(), 'uploads', videoFilename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: 'Requested quality not available',
                suggestedQuality: 'original'
            });
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        res.header({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD',
            'Access-Control-Expose-Headers': 'Content-Length,Content-Range',
            'Cross-Origin-Resource-Policy': 'cross-origin',
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes'
        });

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            const chunksize = end - start + 1;
            const file = fs.createReadStream(filePath, { start, end });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Content-Length': chunksize
            });

            file.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': fileSize
            });
            fs.createReadStream(filePath).pipe(res);
        }

    } catch (error) {
        console.error('Streaming error:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});



// Video interactions
routes.patch('/like/:id', auth, likevideocontroller);
routes.patch('/view/:id', viewscontroller);
routes.post('/likevideo', auth, likedvideocontroller);
routes.get('/getalllikedvideo', getalllikedvideo);
routes.delete('/deletelikevideo/:videoid/:viewer', auth, deletelikedvideo);

// History
routes.post('/history', auth, historycontroller);
routes.get('/getallhistory', getallhistorycontroller);
routes.delete('/deletehistory/:userid', auth, deletehistory);

// Watch later
routes.post('/watchlater', auth, watchlatercontroller);
routes.get('/getallwatchlater', getallwatchlatercontroller);
routes.delete('/deletewatchlater/:videoid/:viewer', auth, deletewatchlater);

// Upload
routes.post('/uploadvideo', auth, upload, uploadvideo);

export default routes;