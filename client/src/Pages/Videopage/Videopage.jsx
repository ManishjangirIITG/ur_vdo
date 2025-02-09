import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import VideoPlayer from '../../Component/VideoPlayer.js';
import { viewvideo } from '../../action/video.js';

const Videopage = () => {
  const { filename } = useParams();
  const dispatch = useDispatch();
  const [selectedQuality, setSelectedQuality] = useState('720p');

  const { currentVideo, loading, error } = useSelector(state => ({
    currentVideo: state.video.currentVideo,
    loading: state.video.loading,
    error: state.video.error
  }));

  const baseFilename = currentVideo?.filename?.replace(/\.[^/.]+$/, "");

  useEffect(() => {
    if (filename) {
      dispatch(viewvideo(filename));
    }
  }, [filename, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!currentVideo) return <div>Video not found</div>;

  return (
    <div className="video-container">
      {/* <video src={`http://localhost:5000/video/stream/${baseFilename}/720p`} controls></video> */}
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

      <VideoPlayer
        baseFilename={baseFilename}
        quality={selectedQuality}
      />

      <h1>{currentVideo.videotitle}</h1>
      <div className="metadata">
        <span>{currentVideo.views} views</span>
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
