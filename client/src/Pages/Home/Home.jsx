import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getallvideo } from '../../action/video';
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar';
import VideoList from '../../Component/VideoList.js';
import "./Home.css";

const Home = () => {
  const dispatch = useDispatch();
  const { videos, loading, error } = useSelector((state) => state.video);

  useEffect(() => {
    dispatch(getallvideo());
  }, [dispatch]);

  if (loading) {
    return <p>Loading videos...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const filteredVids = videos?.filter(q => q).reverse();

  const navlist = [
    "All",
    "Python",
    "Java",
    "C++",
    "Movies",
    "Science",
    "Animation",
    "Gaming",
    "Comedy"
  ];

  return (
    <div className="container_Pages_App">
      <Leftsidebar />
      <div className="container2_Pages_App">
        <div className="navigation_Home">
          {navlist.map((m) => (
            <p key={m} className='btn_nav_home'>{m}</p>
          ))}
        </div>
        {filteredVids ? <VideoList videos={filteredVids} /> : <p>No videos found.</p>}
      </div>
    </div>
  );
};

export default Home;