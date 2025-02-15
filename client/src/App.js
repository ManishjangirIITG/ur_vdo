import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from "react"
import Navbar from './Component/Navbar/Navbar';
import Home from './Pages/Home/Home.jsx';
import { useDispatch } from 'react-redux';
import Allroutes from "../src/Allroutes"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Drawersliderbar from '../src/Component/Leftsidebar/Drawersliderbar'
import Createeditchannel from './Pages/Channel/Createeditchannel';
import Videoupload from './Pages/Videoupload/Videoupload';
import { fetchallchannel } from './action/channeluser';
import { getallvideo } from './action/video';
import { getallcomment } from './action/comment';
import { getallhistory } from './action/history';
import { getalllikedvideo } from './action/likedvideo';
import { getallwatchlater } from './action/watchlater';
import axios from 'axios';
import Videopage from './Pages/Videopage/Videopage.jsx';
import VideoList from './Component/VideoList.js';
import VideoDetail from './Component/VideoDetail.js';
import { ThemeHandler } from './Component/ThemeHandler.jsx';
import './styles/dark-theme.css';
import './styles/white-theme.css';

axios.defaults.baseURL = 'http://localhost:5000';

function App() {
  const [toggledrawersidebar, settogledrawersidebar] = useState({
    display: "none"
  });
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchallchannel())
    dispatch(getallvideo())
    dispatch(getallcomment())
    dispatch(getallhistory())
    dispatch(getalllikedvideo())
    dispatch(getallwatchlater())
  }, [dispatch])

  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        await axios.get('http://localhost:5000/');
        console.log('Server connection successful');
      } catch (error) {
        console.error('Server connection failed:', error);
        alert('Unable to connect to server. Please ensure the server is running.');
      }
    };

    checkServerConnection();
  }, []);

  const toggledrawer = () => {
    settogledrawersidebar(prev => ({
      display: prev.display === "none" ? "flex" : "none"
    }));
  }

  const [editcreatechanelbtn, seteditcreatechanelbtn] = useState(false);
  const [videouploadpage, setvideouploadpage] = useState(false);
  
  return (
    <Router>
      <ThemeHandler />
      <div className="app-container">
        <Navbar 
          seteditcreatechanelbtn={seteditcreatechanelbtn} 
          toggledrawer={toggledrawer} 
        />
        <Drawersliderbar 
          toggledraw={toggledrawer} 
          toggledrawersidebar={toggledrawersidebar} 
        />
        
        {videouploadpage && <Videoupload setvideouploadpage={setvideouploadpage} />}
        {editcreatechanelbtn && (
          <Createeditchannel seteditcreatechanelbtn={seteditcreatechanelbtn} />
        )}
        
        <Allroutes 
          seteditcreatechanelbtn={seteditcreatechanelbtn} 
          setvideouploadpage={setvideouploadpage} 
        />
      </div>
    </Router>
  );
}

export default App;
