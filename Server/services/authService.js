import { isMorningInTimezone } from '../utils/location.js';

const SOUTH_INDIAN_STATES = new Set([
    'Tamil Nadu', 'Kerala', 'Karnataka',
    'Andhra Pradesh', 'Telangana'
]);

export const determineTheme = (location) => {
    // Handle null/undefined location
    if (!location || !location.state || !location.timezone) {
        return 'dark-theme';
    }
    
    // Explicit return with proper error handling
    try {
        console.log('is south_indian_states? : ',SOUTH_INDIAN_STATES.has(location.state.trim()));
        console.log('value of function isMorningInTimezone : ',isMorningInTimezone(location.timezone));
        return SOUTH_INDIAN_STATES.has(location.state.trim()) && 
               isMorningInTimezone(location.timezone)
            ? 'white-theme'
            : 'dark-theme';
    } catch (error) {
        console.error('Theme determination error:', error);
        return 'dark-theme';
    }
};

export const getOtpMethod = (location) => {
    // Handle null/undefined location
    if (!location || !location.state) {
        return 'sms';
    }
    
    try {
        return SOUTH_INDIAN_STATES.has(location.state.trim())
            ? 'email'
            : 'sms';
    } catch (error) {
        console.error('OTP method determination error:', error);
        return 'sms';
    }
};
