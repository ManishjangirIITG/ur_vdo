import { isMorningInTimezone } from '../utils/location.js';

const SOUTH_INDIAN_STATES = new Set([
    'Tamil Nadu', 'Kerala', 'Karnataka',
    'Andhra Pradesh', 'Telangana'
]);

export const determineTheme = (location) => {
    SOUTH_INDIAN_STATES.has(location?.state) &&
        isMorningInTimezone(location.timezone) ?
        'white-theme' : 'dark-theme';
}

export const getOtpMethod = (location) => {
    SOUTH_INDIAN_STATES.has(location?.state) ? 'email' : 'sms';
}