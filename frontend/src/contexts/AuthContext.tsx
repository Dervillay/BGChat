import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    username: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState<string | null>(null);

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/check-auth', {
                credentials: 'include',
            });
            const data = await response.json();
            setIsAuthenticated(data.authenticated);
            setUsername(data.username || null);
        } catch (error) {
            console.error('Auth check failed:', error);
            setIsAuthenticated(false);
            setUsername(null);
        }
        setIsLoading(false);
    };

    const login = async (username: string, password: string) => {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        await checkAuth();
    };

    const logout = async () => {
        await fetch('/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setIsAuthenticated(false);
        setUsername(null);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, username, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 