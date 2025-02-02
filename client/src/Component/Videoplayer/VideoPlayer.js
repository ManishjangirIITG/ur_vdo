import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = ({ videoId }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const options = {
      controls: true,
      responsive: true,
      fluid: true,
      sources: [{
        src: `${videoId}?quality=720p`,
        type: 'video/mp4'
      }],
      controlBar: {
        children: [
          'playToggle',
          'progressControl',
          'volumePanel',
          'qualitySelector',
          'fullscreenToggle',
        ],
      },
    };

    // Initialize video.js player
    const player = videojs(videoRef.current, options);
    playerRef.current = player;

    // Add quality selector
    player.qualityLevels = [
      { label: '1080p', value: '1080p' },
      { label: '720p', value: '720p' },
      { label: '480p', value: '480p' },
      { label: '360p', value: '360p' }
    ];

    player.on('qualitySelected', function(event, quality) {
      player.src({
        src: `${videoId}?quality=${quality.value}`,
        type: 'video/mp4'
      });
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [videoId]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
};

export default VideoPlayer; 