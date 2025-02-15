export const getLocation = async (ip) => {
  try {
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      return {
        state: 'Tamil Nadu', // Default for local development
        timezone: 'Asia/Kolkata'
      };
    }

    const { data } = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: 3000 // 3-second timeout
    });

    if (!data?.region || !data?.timezone) {
      throw new Error('Invalid geolocation response');
    }

    return {
      state: data.region,
      timezone: data.timezone
    };
  } catch (error) {
    console.error('Geolocation API error:', error.message);
    return {
      state: null,
      timezone: 'Asia/Kolkata' // Fallback to Indian timezone
    };
  }
};

export const isMorningInTimezone = (timezone) => {
  try {
    const options = {
      timeZone: timezone,
      hour12: false,
      hour: 'numeric',
      minute: 'numeric'
    };
    const [hours, minutes] = new Date().toLocaleString('en-US', options).split(':');
    console.log('hours:minutes from isMorningInTimezone is : ',hours,':',minutes);
    const hour = parseInt(hours);
    return hour >= 0 && hour < 8;
  } catch (error) {
    console.error('Error determining time:', error);
    return false; // Fallback to dark theme
  }
};

