import axios from "axios"

const BASE_URL = 'http://localhost:5000';

// Create API instance
export const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increase timeout to 30 seconds
  maxRedirects: 5,
  withCredentials: true
});

// Add this near the top of your file
const pendingRequests = new Map();

API.interceptors.request.use((req) => {
  if (localStorage.getItem('Profile')) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('Profile')).token}`;
  }
  return req;
});

API.interceptors.request.use((config) => {
  const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.data)}`;
  if (pendingRequests.has(requestKey)) {
    return Promise.reject({
      __CANCEL__: true,
      promise: pendingRequests.get(requestKey)
    });
  }
  const promise = new Promise((resolve) => {
    config.__resolveRequest = resolve;
  });
  pendingRequests.set(requestKey, promise);

  if (localStorage.getItem("Profile")) {
    config.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem("Profile")).token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

API.interceptors.response.use((response) => {
  const requestKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.data)}`;
  const promise = pendingRequests.get(requestKey);
  if (promise && response.config.__resolveRequest) {
    response.config.__resolveRequest(response);
  }
  pendingRequests.delete(requestKey);
  return response;
}, async (error) => {
  if (error.__CANCEL__) {
    return error.promise;
  }
  const { config, response } = error;
  if (!response && error.code === 'ERR_NETWORK') {
    console.error('Network error - please check if the server is running on', BASE_URL);
  }
  if (!config || !config.retry) {
    return Promise.reject(error);
  }
  config.retry -= 1;
  if (config.retry === 0) {
    return Promise.reject(error);
  }
  const delayRetryRequest = new Promise((resolve) => {
    setTimeout(() => {
      console.log('Retrying request...');
      resolve();
    }, config.retryDelay || 3000);
  });
  return delayRetryRequest.then(() => API(config));
});

// In index.js API configuration
API.interceptors.response.use(null, async (error) => {
  if (error.config && error.response?.status === 404) {
    const originalRequest = error.config;
    originalRequest.retryCount = (originalRequest.retryCount || 0) + 1;

    if (originalRequest.retryCount <= 3) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return API(originalRequest);
    }
  }
  return Promise.reject(error);
});


export const uploadVideo = async (formData) => {
  try {
    const profileData = localStorage.getItem('Profile');
    if (!profileData) {
      throw new Error('No authentication data found');
    }
    const { token } = JSON.parse(profileData);
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Upload Progress:', progress);
      },
      maxContentLength: 100 * 1024 * 1024,
      maxBodyLength: 100 * 1024 * 1024
    };
    const response = await API.post('/video/uploadvideo', formData, config);
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    if (error.response?.status === 413) {
      throw new Error('File size too large. Maximum size is 100MB.');
    }
    throw error;
  }
};

export const streamVideo = (filename) => {
  return API.get(`/video/stream/${filename}`, {
    responseType: 'blob', // Ensure correct response type
    headers: { 'Range': 'bytes=0-' }
  });
};

try {
  const response = await API.get("/video/videos");
  console.log('response form api/index.js', response)
} catch (error) {
  if (error.response) {
    console.error("Server responded with an error:", error.response.data);
  } else if (error.request) {
    console.error("No response received:", error.request);
  } else {
    console.error("Error setting up request:", error.message);
  }
}

export const streamVideoWithQuality = (filename, quality) => {
  const endpoint = quality ? `/stream/${filename}/${quality}` : `/stream/${filename}`;
  return API.get(endpoint, {
    responseType: 'stream',
    headers: {
      'Range': 'bytes=0-'
    }
  });
};

export const streamVideoRange = (filename, start, end) => {
  return API.get(`video/stream/${filename}`, {
    headers: {
      Range: `bytes=${start}-${end}`
    },
    responseType: 'arraybuffer'
  });
};

// Simplify request interceptor
API.interceptors.request.use(config => {
  const profile = JSON.parse(localStorage.getItem('Profile'));
  if (profile?.token) {
    config.headers.Authorization = `Bearer ${profile.token}`;
  }
  config.withCredentials = true; // Add this for session cookies
  return config;
});

// Add proper error handling
API.interceptors.response.use(
  response => response,
  error => {
      if (error.response?.status === 400) {
          return Promise.reject({
              payload: {
                  status: 400,
                  ...error.response.data
              }
          });
      }
      return Promise.reject(error);
  }
);


export const getvideodetails = (filename) => API.get(`video/details/${filename}`);
export const checkLoginRequirements = () => API.get('/auth/check-login-requirements');

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await API.post('/auth/login', credentials);
    return dispatch({ type: 'LOGIN_SUCCESS', payload: data });
  } catch (error) {
    return dispatch({ type: 'LOGIN_ERROR', error });
  }
};

export const verifyOTP = (otpData) => async (dispatch) => {
  try {
    const { data } = await API.post('/auth/verify-otp', otpData);
    return dispatch({ type: 'VERIFY_OTP_SUCCESS', payload: data });
  } catch (error) {
    return dispatch({ type: 'VERIFY_OTP_ERROR', error });
  }
};

export const updatechaneldata = (id, updatedata) => API.patch(`/user/update/${id}`, updatedata)
export const fetchallchannel = () => API.get("/user/getallchannel");

export const getvideos = () => API.get("/video/videos");

export const likevideo = (id, Like) => API.patch(`/video/like/${id}`, { Like });
export const viewsvideo = (id) => API.patch(`/video/view/${id}`);
export const viewvideo = (filename, quality) => API.get(`/video/stream/${filename}/${quality}`);
export const getVideoStream = (baseFilename, quality) => {
  API.get(`/video/stream/${baseFilename}/${quality}`, {
    responseType: 'blob' // Important for streaming
  });
}

export const get_theme = (ip) => API.get(`/get_theme/`)

export const postcomment = (commentdata) => API.post('/comment/post', commentdata)
export const deletecomment = (id) => API.delete(`/comment/delete/${id}`)
export const editcomment = (id, commentbody) => API.patch(`/comment/edit/${id}`, { commentbody })
export const getallcomment = () => API.get('/comment/get')

export const addtohistory = (historydata) => API.post("/video/history", historydata)
export const getallhistory = () => API.get('/video/getallhistory')
export const deletehistory = (userid) => API.delete(`/video/deletehistory/${userid}`)

export const addtolikevideo = (likedvideodata) => API.post('/video/likevideo', likedvideodata)
export const getalllikedvideo = () => API.get('/video/getalllikedvideo')
export const deletelikedvideo = (videoid, viewer) => API.delete(`/video/deletelikevideo/${videoid}/${viewer}`)

export const addtowatchlater = (watchlaterdata) => API.post('/video/watchlater', watchlaterdata)
export const getallwatchlater = () => API.get('/video/getallwatchlater')
export const deletewatchlater = (videoid, viewer) => API.delete(`/video/deletewatchlater/${videoid}/${viewer}`)
