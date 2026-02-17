'use client';

import useIdleLogout from '@/app/useIdleLogout';
import { jwtDecode } from 'jwt-decode';

// EN PROD DECOMMENTER CETTE PARTIE
// const API_URL = 'https://portailbac.ucad.sn/ob/api/v1/authentification/sign-in';
// const REFRESH_URL = 'https://portailbac.ucad.sn/ob/api/v1/authentification/refresh-token';
// const PSW_FORGOT_URL = 'https://portailbac.ucad.sn/ob/api/v1/authentification/update-password-for-public';

// const API_URL = 'https://196.1.95.120/ob/api/v1/authentification/sign-in';
// const REFRESH_URL = 'https://196.1.95.120/ob/api/v1/authentification/refresh-token';

const API_URL = 'http://localhost:8080/ob/api/v1/authentification/sign-in';
const REFRESH_URL = 'http://localhost:8080/ob/api/v1/authentification/refresh-token';
const PSW_FORGOT_URL = 'http://localhost:8080/ob/api/v1/authentification/update-password-for-public';

export const authService = {
    getToken(): string | null {
        return sessionStorage.getItem('token');
    },

    getRefreshToken(): string | null {
        return sessionStorage.getItem('refreshToken');
    },

    getUserFromToken(token: string): any {
        try {
            return jwtDecode(token);
        } catch (error) {
            console.error('Erreur de décodage du token:', error);
            return null;
        }
    },

    saveTokens(token: string, refreshToken: string, user: any): void {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('user', JSON.stringify(user));
    },

    async login(credentials: { login: string; password: string }): Promise<any> {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            if (data.token && data.refreshToken && data.user) {
                this.saveTokens(data.token, data.refreshToken, data.user);
            }

            return data;
        } catch (error) {
            console.error('Erreur pendant le login:', error);
            throw error;
        }
    },

    async refreshToken(): Promise<string> {
        const refreshToken = this.getRefreshToken();

        console.log("Is refreshToken a string?", typeof refreshToken === "string");
        console.log("Is refreshToken empty or invalid?", refreshToken.trim() === "");

        if (!refreshToken) {
            this.logout();
            throw new Error('No refresh token available');
        }

        try 
        {
            const response = await fetch(REFRESH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: refreshToken }),
            });

            console.log("JSON TOKEN...", JSON.stringify({ token: refreshToken }));
            console.log("REFRESH...", response);

            if (!response.ok) {
                throw new Error('Refresh token failed');
            }

            const data = await response.json();
            const newAccessToken = data.token;

            sessionStorage.setItem('token', newAccessToken);
            console.log('New Access Token:', newAccessToken);

            return newAccessToken;
        } catch (error) {
            console.error('Erreur pendant le refresh token:', error);
            this.logout();
            throw error;
        }
    },

    async password_forgot(email: string): Promise<any> {
        try {
            const response = await fetch(
                `${PSW_FORGOT_URL}?email=${encodeURIComponent(email)}`,
                { method: 'PUT' }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    return { error: "Utilisateur introuvable pour cet email." };
                } else {
                    return { error: `Erreur serveur ${response.status}` };
                }
            }

            // Vérifie si le corps est vide
            const text = await response.text();
            if (!text) return { success: true }; // corps vide → succès implicite
            return JSON.parse(text);

        } 
        catch (error) 
        {
            console.error("Erreur réseau:", error);
            return { error: "Impossible de contacter le serveur" };
        }
    },

    logout(): void {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        // Redirection côté client
        // Redirection + rafraîchissement complet
        window.location.replace('/'); // remplace la page actuelle dans l’historique
        //window.location.reload();
    },


    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    getUser(): any {
        const userData = sessionStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }
};
