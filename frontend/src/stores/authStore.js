import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            login: async (email, password) => {
                try {
                    const { data } = await authApi.login({ email, password });
                    localStorage.setItem('accessToken', data.accessToken);
                    set({ user: data.user, isAuthenticated: true });
                } catch (error) {
                    set({ user: null, isAuthenticated: false });
                    throw error;
                }
            },

            register: async (registerData) => {
                try {
                    await authApi.register(registerData);
                    // Auto-login after registration
                    await get().login(registerData.email, registerData.password);
                } catch (error) {
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await authApi.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    localStorage.removeItem('accessToken');
                    set({ user: null, isAuthenticated: false });
                }
            },

            checkAuth: async () => {
                set({ isLoading: true });
                try {
                    const token = localStorage.getItem('accessToken');
                    if (!token) {
                        set({ user: null, isAuthenticated: false, isLoading: false });
                        return;
                    }

                    const { data } = await authApi.me();
                    set({ user: data.user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    localStorage.removeItem('accessToken');
                    set({ user: null, isAuthenticated: false, isLoading: false });
                }
            },

            setUser: (user) => {
                set({ user, isAuthenticated: !!user });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
