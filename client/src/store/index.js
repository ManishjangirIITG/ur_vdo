import { configureStore } from '@reduxjs/toolkit';
import {thunk} from 'redux-thunk';
import currentuserreducer from '../Reducers/currentuser';

export default configureStore({
  reducer: {
    currentuserreducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(thunk)
});