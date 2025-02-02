import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';

const VideoDetail = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        console.log("VideoId: ",videoId)
        const response = await axios.get(`http://localhost:5000/uploads/${videoId}`);
        setVideo(response.data);
      } catch (error) {
        console.error('Error fetching video details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  if (loading) return <div>Loading...</div>;
  if (!video) return <div>Video not found</div>;
  // const videoPath = 

  return (
    <div className="max-w-6xl mx-auto p-4">
      <VideoPlayer videoId = {videoId} />
      <div className="mt-4">
        <h1 className="text-2xl font-bold">{video.title}</h1>
        <p className="text-gray-600 mt-2">
          Uploaded by {video.uploadedBy.username} on {new Date(video.createdAt).toLocaleDateString()}
        </p>
        <p className="mt-4">{video.description}</p>
      </div>
    </div>
  );
};

export default VideoDetail; 