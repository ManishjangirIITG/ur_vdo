// reducers/videoReducer.js
const initialState = {
    videos: [],
    currentVideo: null,
    loading: false,
    error: null
  };
  
  function videoReducer(state = initialState, action) {
    switch (action.type) {
      case 'FETCH_VIDEOS_REQUEST':
        return { ...state, loading: true };
      case 'FETCH_VIDEOS_SUCCESS':
        return { ...state, videos: action.payload, loading: false };
      case 'FETCH_VIDEOS_FAILURE':
        return { ...state, error: action.payload, loading: false };
      case 'VIEW_VIDEO_REQUEST':
        return { ...state, loading: true };
      case 'VIEW_VIDEO_SUCCESS':
        return { ...state, currentVideo: action.payload, loading: false };
      case 'VIEW_VIDEO_FAILURE':
        return { ...state, error: action.payload, loading: false };
      default:
        return state;
    }
  }
  
  export default videoReducer;
  