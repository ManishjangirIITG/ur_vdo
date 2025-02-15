import * as api from '../Api';

export const login = (authData) => async (dispatch) => {
  try {
    const { data } = await api.login(authData);
    if (data.requiresOTP) {
      return { requiresOTP: true, method: data.method };
    } else {
      dispatch({ type: 'AUTH', data });
      return data;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const verifyOTP = (otpData) => async (dispatch) => {
  try {
    const { data } = await api.verifyOTP(otpData);
    dispatch({ type: 'AUTH', data });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
