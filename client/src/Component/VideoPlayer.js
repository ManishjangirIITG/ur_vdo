import React, { useEffect, useRef } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ videoPath }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    console.log("Video path received:", videoPath);
  }, [videoPath]);

  return (
    <div className="video-player-container">
      <video 
        ref={videoRef}
        controls
        width="100%"
        height="auto"
        preload="metadata"
        className="video-player"
      >
        <source 
          src={`http://localhost:5000/video/stream/${videoPath}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer; 