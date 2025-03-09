import { configureStore } from '@reduxjs/toolkit';
import {thunk} from 'redux-thunk';
import currentuserreducer from '../Reducers/currentuser';
import videoReducer from '../Reducers/video';
import authReducer from '../Reducers/auth';
import chanelreducer from '../Reducers/chanel';
import commentreducer from '../Reducers/comment';
import historyreducer from '../Reducers/history';
import likedvideoreducer from '../Reducers/likedvideo';
import watchlaterreducer from '../Reducers/watchlater';

export default configureStore({
  reducer: {
    auth: authReducer,
    currentuserreducer,
    video: videoReducer,
    chanelreducer,
    commentreducer,
    historyreducer,
    likedvideoreducer,
    watchlaterreducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(thunk)
});