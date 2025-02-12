import { useEffect } from 'react';
import * as api from "../Api";

export const ThemeHandler = () => {
  useEffect(() => {
    const controller = new AbortController();

    const loadTheme = async () => {
      try {
        console.log('Fetching theme...');
        const response = await api.get_theme({ 
          signal: controller.signal 
        });

        // Axios stores data in response.data
        console.log('Full response:', response);
        const data = response.data;

        if (!data.theme) {
          throw new Error('No theme property in response');
        }

        console.log('Theme received:', data.theme);
        document.documentElement.className = data.theme;

      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Theme load failed:', err);
          console.log('Error details:', {
            message: err.message,
            response: err.response,
            request: err.request
          });
          document.documentElement.className = 'dark-theme';
        }
      }
    };

    loadTheme();
    return () => controller.abort();
  }, []);

  return null;
};
