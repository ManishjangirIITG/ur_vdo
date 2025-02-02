import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = ({ vid }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      sources: [{
        src: `http://localhost:5000${vid.filepath}?quality=720p`,
        type: 'video/mp4'
      }]
    });

    // Add quality selector menu
    const qualityLevels = [
      { label: '1080p', value: '1080p' },
      { label: '720p', value: '720p' },
      { label: '480p', value: '480p' },
      { label: '360p', value: '360p' }
    ];

    const qualityMenu = player.controlBar.addChild('MenuButton', {
      controlText: 'Quality',
      className: 'vjs-quality-selector'
    });

    const menu = qualityMenu.createMenu();
    qualityMenu.addChild(menu);

    qualityLevels.forEach(quality => {
      menu.addChild('MenuItem', {
        label: quality.label,
        handler: () => {
          player.src({
            src: `http://localhost:5000${vid.filepath}?quality=${quality.value}`,
            type: 'video/mp4'
          });
          const currentTime = player.currentTime();
          player.one('loadedmetadata', () => {
            player.currentTime(currentTime);
            player.play();
          });
        }
      });
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [vid]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
};

export default VideoPlayer;