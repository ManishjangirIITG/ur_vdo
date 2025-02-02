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

const routes = express.Router();

// Video listing and streaming
// routes.get("/videos", async (req, res) => {
//   try {
//       const uploadsDir = path.join(process.cwd(), 'uploads');
//       const files = fs.readdirSync(uploadsDir)
//           .filter(file => file.match(/\.(mp4|webm|mov)$/i))
//           .map(file => ({
//               filename: file,
//               filepath: `/video/${file}`,
//               title: file.split('.')[0],
//               createdAt: fs.statSync(path.join(uploadsDir, file)).ctime
//           }));
//       res.json(files);
//   } catch (error) {
//       res.status(500).json({ message: error.message });
//   }
// });
routes.get("/videos", getvideos);
routes.get("/stream/:filename", (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(process.cwd(), 'uploads', filename);
        
        console.log('Streaming video:', filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Video not found" });
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
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
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        console.error('Error streaming video:', error);
        res.status(500).json({ message: 'Error streaming video' });
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