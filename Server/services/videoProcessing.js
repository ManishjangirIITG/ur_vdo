import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

export function processVideo(inputPath, outputPath, quality) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions('-vf', `scale=-2:${quality.replace('p', '')}`)
      .outputOptions('-c:v', 'libx264')
      .outputOptions('-crf', '23')
      .outputOptions('-c:a', 'aac')
      .outputOptions('-b:a', '128k')
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

export async function processAllQualities(inputPath, baseOutputPath, qualities) {
  const qualityFiles = [];
  const fileExt = path.extname(inputPath);

  for (const quality of qualities) {
    const qualityFilename = `${path.parse(baseOutputPath).name}_${quality}${fileExt}`;
    const outputPath = path.join(path.dirname(baseOutputPath), qualityFilename);
    
    await processVideo(inputPath, outputPath, quality);
    qualityFiles.push({
      quality,
      filename: qualityFilename,
      filepath: `/uploads/${qualityFilename}`
    });
  }

  return qualityFiles;
}
