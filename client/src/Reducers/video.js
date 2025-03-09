const initialState = {
  currentVideo: null,
  loading: false,
  error: null
};

const videoReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'VIEW_VIDEO_REQUEST':
      return { ...state, loading: true, error: null };
    case 'VIEW_VIDEO_SUCCESS':
      return { ...state, loading: false, currentVideo: action.payload };
    case 'VIEW_VIDEO_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default videoReducer;
