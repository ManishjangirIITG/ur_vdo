import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs'

const qualities = [
  { name: '1080p', height: 1080, bitrate: '4000k' },
  { name: '720p', height: 720, bitrate: '2500k' },
  { name: '480p', height: 480, bitrate: '1000k' },
  { name: '360p', height: 360, bitrate: '600k' }
];

const processVideo = async (inputPath, outputDir, videoId) => {
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const processPromises = qualities.map(quality => {
      return new Promise((resolve, reject) => {
        const outputPath = path.join(outputDir, `${videoId}_${quality.name}.mp4`);
        
        ffmpeg(inputPath)
          .size(`?x${quality.height}`)
          .videoBitrate(quality.bitrate)
          .format('mp4')
          .on('end', () => resolve({
            quality: quality.name,
            path: outputPath
          }))
          .on('error', (err) => reject(err))
          .save(outputPath);
      });
    });

    const results = await Promise.all(processPromises);
    return results;
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
};

module.exports = { processVideo }; 