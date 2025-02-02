import axios from "axios"

const BASE_URL = 'http://localhost:5000';

// Create API instance
export const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Increase timeout to 15 seconds
  retry: 3,
  retryDelay: 1000,
  withCredentials: true // Enable credentials
});

// Add this near the top of your file
const pendingRequests = new Map();

// Modify your request interceptor
API.interceptors.request.use((config) => {
  const requestKey = `${config.method}:${config.url}`;
  
  if (pendingRequests.has(requestKey)) {
    // Return the existing promise for this request
    return Promise.reject({
      __CANCEL__: true,
      promise: pendingRequests.get(requestKey)
    });
  }

  // Store the promise for this request
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

// Modify your response interceptor
API.interceptors.response.use((response) => {
  const requestKey = `${response.config.method}:${response.config.url}`;
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
    // You could dispatch an action here to show a global error message
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
    }, config.retryDelay || 1000);
  });

  return delayRetryRequest.then(() => API(config));
});

export const login = (authdata) => API.post("/user/login", authdata);
export const updatechaneldata = (id, updatedata) => API.patch(`/user/update/${id}`, updatedata)
export const fetchallchannel = () => API.get("/user/getallchannel");

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
            maxContentLength: 100 * 1024 * 1024, // 100MB limit
            maxBodyLength: 100 * 1024 * 1024 // 100MB limit
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

export const getvideos = () => API.get("/video/videos");
export const likevideo = (id, Like) => API.patch(`/video/like/${id}`, { Like });
export const viewsvideo = (id) => API.patch(`/video/view/${id}`);

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