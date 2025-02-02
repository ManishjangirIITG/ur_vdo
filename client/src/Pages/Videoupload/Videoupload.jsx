import React, { useState } from 'react'
import './Videoupload.css'
import { buildStyles, CircularProgressbar } from "react-circular-progressbar"
import { useSelector, useDispatch } from 'react-redux'
import { uploadvideo } from '../../action/video'
import { useNavigate } from 'react-router-dom'

const Videoupload = ({ setvideouploadpage }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  // const [progress, setprogress] = useState(0)
  const dispatch = useDispatch();
  const currentuser = useSelector(state => state.currentuserreducer);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !videoFile) {
      alert("Please enter a title and select a video file");
      return;
    }

    // Add file size check
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit
    if (videoFile.size > MAX_FILE_SIZE) {
      alert("File size exceeds 100MB limit");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoFile);
    formData.append("channel", currentuser?.result?._id);
    formData.append("Uploader", currentuser?.result?.name);

    try {
      console.log("Attempting to upload video...");
      const response = await dispatch(uploadvideo(formData));
      console.log("Upload response:", response);
      if (response && response.data) {
        alert("Video uploaded successfully!");
        navigate('/');
      }
    } catch (error) {
      console.error("Upload error details: ", error);
      const errorMessage = error.message || "Error uploading video. Please try again.";
      alert(errorMessage);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="video">Video File</label>
          <input
            type="file"
            id="video"
            accept="video/*"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit">Upload</button>
      </form>
    </div>
  )
}

export default Videoupload