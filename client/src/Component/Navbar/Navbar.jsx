import React, { useState, useEffect, useCallback } from 'react';
import logo from "./logo.ico";
import "./Navbar.css";
import { useDispatch, useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import { RiVideoAddLine } from "react-icons/ri";
import { IoMdNotificationsOutline } from "react-icons/io";
import { BiUserCircle } from "react-icons/bi";
import Searchbar from './Searchbar/Searchbar';
import Auth from '../../Pages/Auth/Auth';
import axios from "axios";
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { setcurrentuser } from '../../action/currentuser';
import { login, verifyOTP, checkLoginRequirements } from '../../Api';
import { jwtDecode } from "jwt-decode";


const Navbar = ({ toggledrawer, seteditcreatechanelbtn }) => {
  const [authbtn, setauthbtn] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginRequirements, setLoginRequirements] = useState(null);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpMethod, setOtpMethod] = useState('');
  const [googleProfile, setGoogleProfile] = useState(null)
  const [loginPhase, setLoginPhase] = useState('init');
  const [googleEmail, setGoogleEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const dispatch = useDispatch();
  const currentuser = useSelector(state => state.currentuserreducer);

  // Google login handler - Step 1: Get email
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        setError(null);

        // Step 1: Get Google email
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v1/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
              Accept: 'application/json'
            }
          }
        );

        // Store email and check requirements
        setGoogleEmail(userInfo.data.email);
        const requirements = await checkLoginRequirements();

        if (requirements.data?.requiresPhoneNumber) {
          setLoginPhase('phone-input');
        } else {
          // Proceed directly to OTP if no phone needed
          const result = await dispatch(login({
            email: userInfo.data.email,
            phoneNumber: ''
          }));
          if (result.payload?.requiresOTP) {
            setLoginPhase('otp-input');
            setOtpMethod(result.payload.method);
          }
        }
      } catch (error) {
        setError("Google login failed");
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Update handlePhoneSubmit
  const handlePhoneSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!phoneNumber.startsWith('+')) {
        throw new Error('Include country code (e.g. +91...)');
      }

      // Step 2: Submit phone number with stored email
      const result = await dispatch(login({
        email: googleEmail,
        phoneNumber: phoneNumber
      }));

      console.log('result.payload is : ', result.payload);

      setLoginPhase('otp-input');
      setOtpMethod(result.payload.method);
    } catch (error) {
      setError(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };


  // OTP verification handler
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      const result = await dispatch(verifyOTP({
        otp,
        method: otpMethod
      }));

      if (result.payload?.token) {
        localStorage.setItem('Profile', JSON.stringify(result.payload));
        dispatch(setcurrentuser(result.payload));
        setLoginPhase('complete');
      } else {
        setError("Invalid OTP");
      }
    } catch (error) {
      setError("OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch login requirements on component mount
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const { data } = await checkLoginRequirements();
        setLoginRequirements(data);
        document.documentElement.className = data.theme;
      } catch (error) {
        setError("Failed to load login requirements");
      }
    };
    fetchRequirements();
  }, []);

  // Successful login handler
  const handleLoginSuccess = (payload) => {
    localStorage.setItem('Profile', JSON.stringify(payload));
    dispatch(setcurrentuser(payload));
    setOtpRequired(false);
    setLoginPhase('complete');
  };

  // Logout functionality
  const logout = useCallback(() => {
    dispatch(setcurrentuser(null));
    googleLogout();
    localStorage.clear();
  }, [dispatch]);

  // Token expiration check
  useEffect(() => {
    const token = currentuser?.token;
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) logout();
    }
    dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
  }, [currentuser?.token, dispatch, logout]);

  return (
    <>
      <div className="Container_Navbar">
        <div className="Burger_Logo_Navbar">
          <div className="burger" onClick={toggledrawer}>
            <p></p>
            <p></p>
            <p></p>
          </div>
          <Link to="/" className='logo_div_Navbar'>
            <img src={logo} alt="Logo" />
            <p className="logo_title_navbar">Your-Tube</p>
          </Link>
        </div>

        <Searchbar />

        <div className="nav-icons">
          <RiVideoAddLine size={22} className="icon" />
          <div className="apps_Box">
            {[...Array(9)].map((_, i) => <p key={i} className="appBox"></p>)}
          </div>
          <IoMdNotificationsOutline size={22} className="icon" />
        </div>

        <div className="Auth_cont_Navbar">
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : currentuser ? (
            <div className="Chanel_logo_App" onClick={() => setauthbtn(true)}>
              <p className="fstChar_logo_App">
                {currentuser?.result?.name?.charAt(0).toUpperCase() ||
                  currentuser?.result?.email?.charAt(0).toUpperCase() ||
                  '?'}
              </p>
            </div>
          ) : (
            <>
              {!currentuser && loginPhase === 'init' && (
                <button
                  className="google-login-btn"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <BiUserCircle size={18} />
                  <span>Sign in with Google</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>


      {/* Phone Number Input */}
      {loginPhase === 'phone-input' && (
        <div className="phone-modal">
          <div className="modal-content">
            <h3>Phone Verification Required</h3>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+911234567890"
              pattern="^\+[1-9]{1}[0-9]{3,14}$"
            />
            <button
              onClick={handlePhoneSubmit}
              disabled={!phoneNumber || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Submit Phone'}
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      )}


      {/* OTP Verification */}
      {loginPhase === 'otp-input' && (
        <div className="otp-modal">
          <form onSubmit={handleOtpSubmit}>
            <h2>Enter OTP</h2>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              maxLength={6}
            />
            <button
              type="submit"
              disabled={otp.length < 6 || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {authbtn && (
        <Auth
          seteditcreatechanelbtn={seteditcreatechanelbtn}
          setauthbtn={setauthbtn}
          user={currentuser}
        />
      )}
    </>
  );
};

export default Navbar;
