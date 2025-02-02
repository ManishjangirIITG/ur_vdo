import * as api from '../Api/index';

// Upload Video
export const uploadvideo = (videoData) => async (dispatch) => {
    try {
        console.log("Attempting to upload video...");
        const { data } = await api.uploadVideo(videoData);
        console.log("Upload response:", data);

        dispatch({ 
            type: 'POST_VIDEO', 
            payload: data 
        });

        return data; // Return the data so we can handle success in the component
    } catch (error) {
        console.error("Error in upload action:", error);
        throw error; // Re-throw to handle in component
    }
};

// Get All Videos
export const getallvideo = () => async (dispatch) => {
    dispatch({ type: 'FETCH_VIDEOS_REQUEST' });
  try {
    const response = await api.getvideos();
    dispatch({ type: 'FETCH_VIDEOS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_VIDEOS_FAILURE', payload: error.message });
  }
};

// Like Video
export const likevideo = (likedata) => async (dispatch) => {
    try {
        const { id, Like } = likedata;
        console.log("Liking video with ID:", id);

        const { data } = await api.likevideo(id, Like);
        console.log("Like response:", data);

        dispatch({ 
            type: "POST_LIKE", 
            payload: data 
        });

        dispatch(getallvideo()); // Refresh the video list
    } catch (error) {
        console.error("Error in likevideo action:", error);
        throw error; // Re-throw to handle in component
    }
};

// View Video

export const viewvideo = (id) => async (dispatch) => {
  dispatch({ type: 'VIEW_VIDEO_REQUEST' });
  try {
    const response = await api.viewsvideo(id);
    dispatch({ type: 'VIEW_VIDEO_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'VIEW_VIDEO_FAILURE', payload: error.message });
  }
};
