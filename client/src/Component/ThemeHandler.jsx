import { useEffect } from 'react';
import * as api from "../Api";
import '../styles/dark-theme.css';
import '../styles/white-theme.css';

export const ThemeHandler = () => {
    useEffect(() => {
      const controller = new AbortController();
  
      const loadTheme = async () => {
        try {
          console.log('Fetching theme...');
          const response = await api.get_theme({ 
            signal: controller.signal 
          });
  
          const data = response.data;
  
          if (!data.theme) {
            throw new Error('No theme property in response');
          }
  
          console.log('Theme received:', data.theme);
          document.documentElement.classList.remove('white-theme', 'dark-theme');
          document.documentElement.classList.add(data.theme);
  
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Theme load failed:', err);
            document.documentElement.classList.remove('white-theme', 'dark-theme');
            document.documentElement.classList.add('dark-theme');
          }
        }
      };
  
      loadTheme();
      return () => controller.abort();
    }, []);
  
    return null;
  };
  
