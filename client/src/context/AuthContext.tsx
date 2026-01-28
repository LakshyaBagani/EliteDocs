import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import type { User, AuthResponse } from '../types';
import { authService } from '../services/authService';
import { getTimeUntilRefresh, isTokenExpired, shouldRefreshToken } from '../utils/tokenUtils';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: AuthResponse) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clear refresh timer
    const clearRefreshTimer = useCallback(() => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
    }, []);

    // Perform token refresh
    const performTokenRefresh = useCallback(async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.log('[Auth] No refresh token available, logging out');
            authService.logout();
            setUser(null);
            return;
        }

        try {
            console.log('[Auth] Proactively refreshing tokens...');
            const response = await authService.refreshToken(refreshToken);

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.user));
            setUser(response.user);

            console.log('[Auth] Tokens refreshed successfully');

            // Schedule next refresh
            scheduleTokenRefresh(response.accessToken);
        } catch (error) {
            console.error('[Auth] Failed to refresh token:', error);
            // Refresh failed, logout user
            authService.logout();
            setUser(null);
            window.location.href = '/login';
        }
    }, []);

    // Schedule token refresh
    const scheduleTokenRefresh = useCallback((accessToken: string) => {
        clearRefreshTimer();

        const timeUntilRefresh = getTimeUntilRefresh(accessToken);

        if (timeUntilRefresh <= 0) {
            // Token should be refreshed immediately
            performTokenRefresh();
            return;
        }

        console.log(`[Auth] Scheduling token refresh in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);

        refreshTimerRef.current = setTimeout(() => {
            performTokenRefresh();
        }, timeUntilRefresh);
    }, [clearRefreshTimer, performTokenRefresh]);

    // Initialize auth state and token refresh on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const storedUser = authService.getStoredUser();
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (storedUser && accessToken && refreshToken) {
                // Check if access token is expired
                if (isTokenExpired(accessToken)) {
                    console.log('[Auth] Access token expired, attempting refresh...');
                    try {
                        const response = await authService.refreshToken(refreshToken);
                        localStorage.setItem('accessToken', response.accessToken);
                        localStorage.setItem('refreshToken', response.refreshToken);
                        localStorage.setItem('user', JSON.stringify(response.user));
                        setUser(response.user);
                        scheduleTokenRefresh(response.accessToken);
                    } catch {
                        console.log('[Auth] Refresh failed, clearing auth state');
                        authService.logout();
                    }
                } else if (shouldRefreshToken(accessToken)) {
                    // Token is still valid but should be refreshed soon
                    setUser(storedUser);
                    performTokenRefresh();
                } else {
                    // Token is valid, schedule refresh
                    setUser(storedUser);
                    scheduleTokenRefresh(accessToken);
                }
            }
            setIsLoading(false);
        };

        initializeAuth();

        return () => {
            clearRefreshTimer();
        };
    }, [scheduleTokenRefresh, performTokenRefresh, clearRefreshTimer]);

    const login = (data: AuthResponse) => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        // Schedule proactive token refresh
        scheduleTokenRefresh(data.accessToken);
    };

    const logout = () => {
        clearRefreshTimer();
        authService.logout();
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
