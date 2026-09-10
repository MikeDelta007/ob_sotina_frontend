// Racine de l'API (sans version), ex: http://localhost:8080/ob/api/
const API_ROOT = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/ob/api/';

// Base complète utilisée par axios/fetch, avec la version ajoutée ici (un seul endroit)
export const API_BASE_URL = `${API_ROOT}v1/`;
