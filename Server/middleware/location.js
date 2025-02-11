export const locationMiddleware = async (req, _, next) => {
    try {
        // Improved IP detection for proxy environments
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.socket?.remoteAddress ||
            '127.0.0.1'; // Fallback for local development

        // Validate IP format
        if (!isValidIp(ip)) throw new Error('Invalid IP format');

        req.userLocation = await getLocation(ip);
    } catch (error) {
        console.error('Location detection error:', error);
        req.userLocation = {
            state: null,
            timezone: 'Asia/Kolkata' // Fallback to Indian timezone
        };
    } finally {
        next();
    }
};

// Add IP validation helper
const isValidIp = (ip) => {
    /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip) ||
        ip === '::1' || // IPv6 localhost
        ip === '127.0.0.1';
}