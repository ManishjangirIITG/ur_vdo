export const getLocation = async (ip) => {
    try {
      if(!ip || ip === '::1' || ip === '127.0.0.1') {
        return { 
          state: 'Tamil Nadu', // Default for local development
          timezone: 'Asia/Kolkata' 
        };
      }
  
      const { data } = await axios.get(`https://ipapi.co/${ip}/json/`, {
        timeout: 3000 // 3-second timeout
      });
  
      if(!data?.region || !data?.timezone) {
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
        hour: 'numeric'
      };
      const hour = parseInt(
        new Date().toLocaleString('en-US', options)
                  .split(',')[1]
                  ?.split(':')[0]
                  .trim()
      );
      return hour >= 10 && hour < 12;
    } catch {
      return false; // Fallback to dark theme
    }
  };
  