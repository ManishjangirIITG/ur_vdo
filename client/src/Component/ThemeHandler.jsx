import { useEffect } from 'react';
import * as api from "../Api"

export const ThemeHandler = () => {
  useEffect(() => {
    const controller = new AbortController();
    
    const loadTheme = async () => {
      try {
        const res = await api.get_theme({signal: controller.signal})
        const { theme } = await res.json();
        console.log('theme from loadTheme',theme);
        document.documentElement.className = theme;
      } catch (err) {
        if (!err.name === 'AbortError') {
          console.error('Theme load failed:', err);
        }
      }
    };

    loadTheme();
    return () => controller.abort();
  }, []);

  return null;
};
