import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { patientService } from '../services/patientService';
import type { Patient } from '../types';

const STORAGE_KEY = 'patientProfile';

interface PatientProfileContextType {
    profile: Patient | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const PatientProfileContext = createContext<PatientProfileContextType | undefined>(undefined);

export const PatientProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Patient | null>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(!profile);

    const fetchAndStore = useCallback(async () => {
        try {
            const data = await patientService.getOwnProfile();
            setProfile(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to load patient profile', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'PATIENT') {
            if (!profile) {
                // No cached profile — fetch from API
                fetchAndStore();
            } else {
                setLoading(false);
            }
        } else {
            // Not a patient — clear any stale data
            localStorage.removeItem(STORAGE_KEY);
            setProfile(null);
            setLoading(false);
        }
    }, [user?.id]);

    // Called after profile edit — fetches fresh data and updates localStorage
    const refreshProfile = useCallback(async () => {
        await fetchAndStore();
    }, [fetchAndStore]);

    return (
        <PatientProfileContext.Provider value={{ profile, loading, refreshProfile }}>
            {children}
        </PatientProfileContext.Provider>
    );
};

export const usePatientProfile = (): PatientProfileContextType => {
    const context = useContext(PatientProfileContext);
    if (!context) {
        throw new Error('usePatientProfile must be used within a PatientProfileProvider');
    }
    return context;
};
