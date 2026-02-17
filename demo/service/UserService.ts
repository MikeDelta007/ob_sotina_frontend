'use client';

export const userService = {
    getUser(): any {
        const userData = sessionStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },

    setUser(user: any): void {
        sessionStorage.setItem('user', JSON.stringify(user));
    },

    clearUser(): void {
        sessionStorage.removeItem('user');
    },

    isAuthenticated(): boolean {
        return !!this.getUser();
    }
};
