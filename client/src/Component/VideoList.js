import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getvideos } from '../Api';
import './VideoList.css'

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log('Fetching videos...');
        const response = await getvideos();
        console.log('Response:', response);

        if (Array.isArray(response.data) && response.data.length > 0) {
          console.log('Setting videos:', response.data);
          setVideos(response.data);
        } else {
          console.warn('No videos found in response');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!videos.length) return <div>No videos found</div>;

  console.log('videos from videoList.js : ',videos)

  return (
    <div className="grid grid_cols_1 md:grid_cols_2 lg:grid_cols_3 gap_4 p_4">
      {videos.map((video, index) => (
        <Link to={`video/${video.filename || index}`} key={video.filename || index} className="hover:opacity_90">
          <div className="bg-white rounded-lg shadow-md overflow-hidden videos_in_list">
            <video className="w-full h-48 object-cover video_tag_in_list" preload="metadata">
              <source src={`http://localhost:5000/uploads/${video.filename}`} type="video/mp4" />
            </video>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{video.videotitle || "Untitled Video"}</h3>
              {video.uploadedBy && (
                <p className="text-gray-600 text-sm">{video.uploadedBy.username}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {video.views ? `${video.views} views • ` : ""}{new Date(video.createdAt).toLocaleDateString()}
              </p>
              {video.description && (
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{video.description}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default VideoList; 