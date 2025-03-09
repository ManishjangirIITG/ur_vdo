import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import VideoPlayer from '../../Component/VideoPlayer.js';
import { viewvideo } from '../../action/video.js';

const Videopage = () => {
  const { filename } = useParams();
  const dispatch = useDispatch();
  const [selectedQuality, setSelectedQuality] = useState('720p');

  const videoState = useSelector((state) => state.video) || {};
  const { currentVideo, loading, error } = videoState;
  
  // Compute baseFilename by removing file extension (if currentVideo exists)
  const baseFilename = currentVideo?.filename
    ? currentVideo.filename.replace(/\.[^/.]+$/, "")
    : "";

  console.log("videoState is : ",videoState)
  console.log("currentVideo from videopage : ",currentVideo);
  console.log("basefilename is : ",baseFilename)

  useEffect(() => {
    console.log('fileaname from the useEffect of videopage : ',filename)
    if (filename) {
      dispatch(viewvideo(filename));
    }
    console.log('basefilename from videopage : ',baseFilename,'quality from the videopage : ',selectedQuality)
  }, [filename, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!currentVideo) return <div>Video not found</div>;

  return (
    <div className="video-container">
      <div className="quality-selector">
      </div>
      <div className="quality-controls">
        <select
          value={selectedQuality}
          onChange={(e) => setSelectedQuality(e.target.value)}
          className="quality-select"
        >
          <option value="480p">480p</option>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
        </select>

      </div>

      <div className="video-player-wrapper">
        <VideoPlayer
          baseFilename={baseFilename}
          quality={selectedQuality}
        />
      </div>

      <h1>{currentVideo.videotitle}</h1>
      <div className="video_metadata">
        <span>{currentVideo.views} views  </span>
        <span>
          Uploaded {new Date(currentVideo.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="description">
        {currentVideo.description}
      </div>
    </div>
  );
};

export default Videopage;
