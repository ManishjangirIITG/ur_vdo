import React from 'react';
import { Link } from 'react-router-dom';
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar';
import VideoList from '../../Component/VideoList.js'; // Import VideoList component
import './Home.css'

const Home = () => {
  return (
    <div className="home_container"> 
      <Leftsidebar />
      <div className="video_container">
        <VideoList 
        //   listClassName="video_grid"
        //   itemClassName="video_box"
        //   renderItem={(video) => (
        //     <>
        //       <Link to={`/video/${video?.filename}`}>
        //         <video muted src={video?.videoUrl} />
        //       </Link>
        //       <div className="video_details">
        //         <h3>{video?.title || 'Untitled Video'}</h3>
        //         <p>{video?.description}</p>
        //         <div className="video_meta">
        //           <span>Views: {video?.views || 0}</span>
        //           {video?.createdAt && (
        //             <span> • {new Date(video.createdAt).toLocaleDateString()}</span>
        //           )}
        //         </div>
        //       </div>
        //     </>
        //   )}
          emptyComponent={
            <div className="empty_state">
              <h3>No videos found</h3>
              <p>Upload your first video to get started</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Home;

