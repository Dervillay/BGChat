import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { gradients } from '../theme/gradients';
import { useFetchWithAuth } from '../utils/fetchWithAuth';

interface ThemeContextType {
    themeId: number;
    setTheme: (themeId: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'bgchat-selected-theme';

const clampThemeId = (value: number): number => 
    Math.max(0, Math.min(value, gradients.length - 1));

const parseThemeId = (value: string | null): number => {
    const parsed = parseInt(value ?? '', 10);
    return isNaN(parsed) ? 0 : clampThemeId(parsed);
};

function updateFavicon(themeId: number, image: HTMLImageElement | null) {
    if (!image) return;

    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get original image alpha mask
    ctx.drawImage(image, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);

    // Draw gradient
    const colors = gradients[themeId].match(/#[A-Fa-f0-9]{6}/g) || ["#667eea", "#764ba2"];
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    colors.forEach((color, i) => gradient.addColorStop(i / (colors.length - 1), color));
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Apply alpha mask
    const gradientData = ctx.getImageData(0, 0, size, size);
    for (let i = 3; i < imageData.data.length; i += 4) {
        gradientData.data[i] = imageData.data[i];
    }
    ctx.putImageData(gradientData, 0, 0);

    // Update favicon
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = canvas.toDataURL("image/png");
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeId, setThemeId] = useState<number>(() => 
        parseThemeId(localStorage.getItem(THEME_STORAGE_KEY))
    );
    
    const fetchWithAuth = useFetchWithAuth();
    const hasSynced = useRef(false);
    const faviconImage = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            faviconImage.current = img;
            updateFavicon(themeId, img);
        };
        img.src = `${process.env.PUBLIC_URL || ""}/images/favicon.ico`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        updateFavicon(themeId, faviconImage.current);
    }, [themeId]);

    useEffect(() => {
        if (hasSynced.current) return;
        hasSynced.current = true;
        
        fetchWithAuth(`${process.env.REACT_APP_BACKEND_URL}/user-theme`)
        .then(res => res.json())
            .then(({ data }) => {
                if (typeof data === 'number') {
                    const id = clampThemeId(data);
                    setThemeId(id);
                    localStorage.setItem(THEME_STORAGE_KEY, String(id));
                }
            })
            .catch(err => console.error('Failed to sync theme:', err));
    }, [fetchWithAuth]);

    const setTheme = useCallback((themeId: number) => {
        setThemeId(themeId);
        localStorage.setItem(THEME_STORAGE_KEY, String(themeId));
        fetchWithAuth(`${process.env.REACT_APP_BACKEND_URL}/user-theme`, {
            method: 'POST',
            body: JSON.stringify({ theme: themeId }),
        }).catch(err => console.error('Failed to save theme:', err));
    }, [fetchWithAuth]);

    return (
        <ThemeContext.Provider value={{ themeId, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
