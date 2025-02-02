import express from 'express'
import { processVideo } from '../services/videoProcessing';
import Video from '../models/Video.js'
import auth from '../middleware/auth.js';
import path from 'path';
import fs from 'fs'

const router = express.Router();
// Upload video
router.post('/upload', auth, async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const videoFile = req.files.video;
    const videoId = new mongoose.Types.ObjectId();
    const uploadDir = path.join(__dirname, '../uploads/videos');
    const tempPath = path.join(uploadDir, `${videoId}_original.mp4`);

    // Save original video
    await videoFile.mv(tempPath);

    // Process video into different qualities
    const processedVideos = await processVideo(
      tempPath,
      path.join(uploadDir, videoId.toString()),
      videoId
    );

    // Create video document
    const video = new Video({
      _id: videoId,
      title: req.body.title,
      description: req.body.description,
      uploadedBy: req.user._id,
      qualities: processedVideos
    });

    await video.save();

    // Delete original file
    fs.unlinkSync(tempPath);

    res.status(201).json({ message: 'Video uploaded successfully', videoId });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Error uploading video' });
  }
});

// Stream video
router.get('/stream/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { quality = '720p' } = req.query;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const videoQuality = video.qualities.find(q => q.quality === quality) || video.qualities[0];
    const videoPath = videoQuality.path;

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
    console.error('Error streaming video:', error);
    res.status(500).json({ message: 'Error streaming video' });
  }
});

// Get video details
router.get('/:videoId', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId)
      .populate('uploadedBy', 'username');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching video details' });
  }
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos' });
  }
});

module.exports = router; 