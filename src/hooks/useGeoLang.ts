import { useState, useEffect } from 'react';

type Language = 'en' | 'id';

export function useGeoLang() {
  const [lang, setLang] = useState<Language>('en'); // Default to English
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchGeoLang = async () => {
      try {
        // Check cache first
        const cachedLang = localStorage.getItem('geo_lang');
        if (cachedLang === 'en' || cachedLang === 'id') {
          setLang(cachedLang);
          setIsLoaded(true);
          return;
        }

        // Fetch from free IP API
        const res = await fetch('https://api.country.is/');
        const data = await res.json();
        
        const detectedLang = data.country === 'ID' ? 'id' : 'en';
        setLang(detectedLang);
        localStorage.setItem('geo_lang', detectedLang);
      } catch (error) {
        console.error('Failed to fetch geo IP:', error);
        // Fallback to English
        setLang('en');
      } finally {
        setIsLoaded(true);
      }
    };

    fetchGeoLang();
  }, []);

  return { lang, isLoaded };
}
