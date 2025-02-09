import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import './VideoPlayer.css'

const VideoPlayer = ({ baseFilename, quality }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Only initialize if we have valid parameters
    if (!baseFilename || !quality) return;

    // Cleanup previous player
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // Create new video element
    const newVideoElement = document.createElement('video-js');
    newVideoElement.classList.add('vjs-default-skin');
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(newVideoElement);

    // Initialize Video.js player
    playerRef.current = videojs(newVideoElement, {
      controls: true,
      fluid: true,
      responsive: true,
      muted: true,
      sources: [{
        src: `http://localhost:5000/video/stream/${baseFilename}/${quality}`,
        type: 'video/mp4'
      }],
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false
      }
    });

    // Add error handler
    playerRef.current.on('error', () => {
      console.error('Player error:', playerRef.current.error());
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [baseFilename, quality]);

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto'
      }}
    />
  );
};

export default VideoPlayer;
