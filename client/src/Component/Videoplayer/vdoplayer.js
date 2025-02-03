import React, { useState } from 'react';
import ReactPlayer from 'react-player';

const vdoplayer = ({ videoSources }) => {
  const [quality, setQuality] = useState('480p');

  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
  };

  return (
    <div>
      <ReactPlayer
        url={videoSources[quality]}
        controls={true}
        width="100%"
        height="auto"
      />
      <div>
        <button onClick={() => handleQualityChange('480p')}>480p</button>
        <button onClick={() => handleQualityChange('720p')}>720p</button>
        <button onClick={() => handleQualityChange('1080p')}>1080p</button>
      </div>
    </div>
  );
};

export default vdoplayer;
