import {combineReducers} from "redux";
import authReducer from "./auth";
import currentuserreducer from "./currentuser";
import chanelreducer from "./chanel";
import videoReducer from './video';
import commentreducer from "./comment";
import historyreducer from "./history";
import likedvideoreducer from "./likedvideo";
import watchlaterreducer from "./watchlater";


export default combineReducers({
    auth: authReducer,
    currentuserreducer,
    video: videoReducer,
    chanelreducer,
    commentreducer,
    historyreducer,
    likedvideoreducer,
    watchlaterreducer
});