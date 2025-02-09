import React, { useEffect, useState } from 'react';
import { BsThreeDots } from "react-icons/bs";
import { AiFillDislike, AiFillLike, AiOutlineDislike, AiOutlineLike } from "react-icons/ai";
import { MdPlaylistAddCheck } from "react-icons/md";
import { RiShareForwardLine } from "react-icons/ri";
import "./Likewatchlatersavebtn.css";
import { useSelector, useDispatch } from 'react-redux';
import { likevideo } from '../../action/video';
import { addtolikedvideo, deletelikedvideo } from "../../action/likedvideo";
import { addtowatchlater, deletewatchlater } from '../../action/watchlater';

const Likewatchlatersavebtns = ({ video }) => {
  const dispatch = useDispatch();
  const [saveVideo, setSaveVideo] = useState(false);
  const [dislikeBtn, setDislikeBtn] = useState(false);
  const [likeBtn, setLikeBtn] = useState(false);

  const currentuser = useSelector((state) => state.currentuserreducer);
  const likedVideoList = useSelector((state) => state.likedvideoreducer);
  const watchlaterList = useSelector((state) => state.watchlaterreducer);

  useEffect(() => {
    if (currentuser?.result?._id && video) {
      likedVideoList?.data
        ?.filter(q => q.videoid === video._id && q.viewer === currentuser.result._id)
        .forEach(() => setLikeBtn(true));
      watchlaterList?.data
        ?.filter(q => q.videoid === video._id && q.viewer === currentuser.result._id)
        .forEach(() => setSaveVideo(true));
    }
  }, [currentuser, video, likedVideoList, watchlaterList]);

  const toggleSavedVideo = () => {
    if (currentuser) {
      if (saveVideo) {
        setSaveVideo(false);
        dispatch(deletewatchlater({ videoid: video._id, viewer: currentuser.result._id }));
      } else {
        setSaveVideo(true);
        dispatch(addtowatchlater({ videoid: video._id, viewer: currentuser.result._id }));
      }
    } else {
      alert("please login to save video");
    }
  };

  const toggleLikeVideo = (e, lk) => {
    if (currentuser) {
      if (likeBtn) {
        setLikeBtn(false);
        dispatch(likevideo({ id: video._id, Like: lk - 1 }));
        dispatch(deletelikedvideo({ videoid: video._id, viewer: currentuser.result._id }));
      } else {
        setLikeBtn(true);
        dispatch(likevideo({ id: video._id, Like: lk + 1 }));
        dispatch(addtolikedvideo({ videoid: video._id, viewer: currentuser.result._id }));
        setDislikeBtn(false);
      }
    } else {
      alert("please login to like video");
    }
  };

  const toggleDislikeVideo = (e, lk) => {
    if (currentuser) {
      if (dislikeBtn) {
        setDislikeBtn(false);
      } else {
        setDislikeBtn(true);
        if (likeBtn) {
          dispatch(likevideo({ id: video._id, Like: lk - 1 }));
          dispatch(deletelikedvideo({ videoid: video._id, viewer: currentuser.result._id }));
        }
        setLikeBtn(false);
      }
    } else {
      alert("please login to dislike video");
    }
  };

  return (
    <div className="action-buttons">
      <button onClick={(e) => toggleLikeVideo(e, video.Like)}>
        {likeBtn ? <AiFillLike /> : <AiOutlineLike />}
      </button>
      <button onClick={(e) => toggleDislikeVideo(e, video.Like)}>
        {dislikeBtn ? <AiFillDislike /> : <AiOutlineDislike />}
      </button>
      <button onClick={toggleSavedVideo}>
        <MdPlaylistAddCheck />
      </button>
      <button>
        <RiShareForwardLine />
      </button>
      <button>
        <BsThreeDots />
      </button>
    </div>
  );
};

export default Likewatchlatersavebtns;
