// reducers/videoReducer.js
const initialState = {
  videos: [],
  currentVideo: null,
  loading: false,
  error: null
};

const videoReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'VIEW_VIDEO_REQUEST':
      return {
        ...state,
        loading: true,
        error: null // Clear previous errors
      };

    case 'VIEW_VIDEO_SUCCESS':
      return {
        ...state, // Maintain other state properties
        loading: false,
        currentVideo: action.payload,
        error: null
      };

    case 'VIEW_VIDEO_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
};

export default videoReducer;
