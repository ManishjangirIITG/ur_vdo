import React from 'react'
import { BiLogOut } from 'react-icons/bi'
import { Link } from 'react-router-dom'
import { googleLogout } from '@react-oauth/google';
import "./Auth.css"
import { useDispatch } from "react-redux"
import { setcurrentuser } from '../../action/currentuser';
import { API } from '../../Api/index';
import { useNavigate } from 'react-router-dom';
import { FaCrown } from 'react-icons/fa'

const Auth = ({ user, setauthbtn, seteditcreatechanelbtn }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate();

    const logout = () => {
        dispatch(setcurrentuser(null))
        localStorage.clear()
        googleLogout()
    }

    const googleSuccess = async (response) => {
        try {
            const token = response?.credential;
            if (!token) {
                throw new Error('Google Sign In was unsuccessful');
            }

            let retries = 3;
            while (retries > 0) {
                try {
                    const { data } = await API.post('/user/google', { token });
                    dispatch({ type: 'AUTH', data });
                    navigate('/');
                    break;
                } catch (error) {
                    retries--;
                    if (retries === 0) throw error;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (error) {
            console.error('Google Sign In Error:', error);
            alert('Failed to sign in with Google. Please try again.');
        }
    };

    if (!user || !user.result) {
        return <div className="Auth_container">Loading user data...</div>;
    }

    return (
        <div className="Auth_container" onClick={() => setauthbtn(false)}>
            <div className="Auth_container2">
                <p className="User_Details">
                    <div className="Chanel_logo_App">
                        <p className="fstChar_logo_App">
                            {user.result.name ?
                                user.result.name.charAt(0).toUpperCase() :
                                user.result.email.charAt(0).toUpperCase()
                            }
                        </p>
                    </div>
                    <div className="email_auth">{user.result.email}</div>
                </p>
                <div className="btns_Auth">
                    {user.result.name ? (
                        <Link to={`/channel/${user.result._id}`} className='btn_Auth'>Your Channel</Link>
                    ) : (
                        <input
                            type="submit"
                            className='btn_Auth'
                            value="Create Your Own Channel"
                            onClick={() => seteditcreatechanelbtn(true)}
                        />
                    )}
                    <div className="upgrade_plan_button">
                        <Link to="/upgrade-plan" className="menu_links upgrade-plan-link">
                            <FaCrown /> Upgrade Plan
                        </Link>
                    </div>
                    <div className="btn_Auth" onClick={logout}>
                        <BiLogOut />
                        Log Out
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth
