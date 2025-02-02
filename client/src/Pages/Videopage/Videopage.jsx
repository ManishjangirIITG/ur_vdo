import React, { useEffect } from 'react';
import "./Videopage.css";
import moment from 'moment';
import Likewatchlatersavebtns from './Likewatchlatersavebtns';
import { useParams, Link } from 'react-router-dom';
import Comment from '../../Component/Comment/Comment.jsx';
import { viewvideo } from '../../action/video.js';
import { addtohistory } from '../../action/history.js';
import { useSelector, useDispatch } from 'react-redux';
import VideoPlayer from '../../Component/VideoPlayer.js';

const Videopage = () => {
    const { vid } = useParams();
    const dispatch = useDispatch();
    
    const { currentVideo: vv, loading, error } = useSelector(state => state.video);
    const currentuser = useSelector(state => state.currentuserreducer);

    useEffect(() => {
        if (vid) {
            dispatch(viewvideo(vid));
        }
    }, [vid, dispatch]);

    useEffect(() => {
        if (currentuser && vv) {
            dispatch(addtohistory({
                videoid: vid,
                viewer: currentuser?.result._id,
            }));
        }
    }, [currentuser, vv, vid, dispatch]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!vv) {
        return <div>Video not found. Please check the URL or try again later.</div>;
    }

    return (
        <div className="container_videoPage">
            <div className="container2_videoPage">
                <div className="video_display_screen_videoPage">
                    {vv?.filepath && (
                        <VideoPlayer 
                            videoPath={vv.filepath.split(/[/\\]/).pop()}
                        />
                    )}
                    <div className="video_details_videoPage">
                        <div className="video_btns_title_VideoPage_cont">
                            <p className="video_title_VideoPage">{vv?.title}</p>
                            <div className="views_date_btns_VideoPage">
                                <div className="views_videoPage">
                                    {vv?.views} views <div className="dot"></div>{" "}
                                    {moment(vv?.createdat).fromNow()}
                                </div>
                                <Likewatchlatersavebtns vv={vv} vid={vid} />
                            </div>
                        </div>
                        {vv?.uploader && (
                            <Link to={'/'} className='chanel_details_videoPage'>
                                <b className="chanel_logo_videoPage">
                                    <p>{vv.uploader.charAt(0).toUpperCase()}</p>
                                </b>
                                <p className="chanel_name_videoPage">{vv.uploader}</p>
                            </Link>
                        )}
                        <div className="comments_VideoPage">
                            <h2><u>Comments</u></h2>
                            <Comment videoid={vv._id} />
                        </div>
                    </div>
                </div>
                <div className="moreVideoBar">More videos</div>
            </div>
        </div>
    );
};

export default Videopage;
