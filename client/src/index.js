import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from "react-redux";
import { legacy_createStore as createStore, applyMiddleware, compose } from 'redux';
import { thunk } from "redux-thunk";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Reducers from './Reducers';
import './styles/dark-theme.css';
import './styles/white-theme.css';
import store from './store';



const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <div className="theme-wrapper">
          <App />
        </div>
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);
