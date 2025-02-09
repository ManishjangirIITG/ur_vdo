import * as api from '../Api/index';

export const uploadvideo = (videoData) => async (dispatch) => {
  try {
    console.log("Attempting to upload video...");
    const { data } = await api.uploadVideo(videoData);
    console.log("Upload response:", data);
    dispatch({
      type: 'POST_VIDEO',
      payload: data
    });
    return data;
  } catch (error) {
    console.error("Error in upload action:", error);
    throw error;
  }
};

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

// action/video.js
export const viewvideo = (filename) => async (dispatch) => {
  try {
    dispatch({ type: 'VIEW_VIDEO_REQUEST' });

    const { data } = await api.getvideodetails(filename);
    console.log('data from viewvideo action : ',data)
    if (!data) {
      throw new Error('Video data not found in response');
    }

    dispatch({
      type: 'VIEW_VIDEO_SUCCESS',
      payload: {
        ...data,
      }
    });

  } catch (error) {
    const errorMessage = error.response?.data?.error ||
      error.message ||
      'Failed to fetch video details';
    dispatch({
      type: 'VIEW_VIDEO_FAIL',
      payload: errorMessage
    });
  }
};


