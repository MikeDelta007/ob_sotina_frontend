import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from '@/demo/service/AuthService'; // Chemin à adapter

//EN PROD DECOMMENTER CETTE PARTIE
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/ob/api/v1/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
});

// const axiosInstance: AxiosInstance = axios.create({
//   baseURL: 'http://192.168.60.51/ob/api/v1/',
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': '*/*',
//   },
// });

// const axiosInstance: AxiosInstance = axios.create({
//   baseURL: 'http://localhost:8080/ob/api/v1/',
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': '*/*',
//   },
// });

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig  {
  _retry?: boolean;
}

// Interceptor pour ajouter le token dans chaque requête
axiosInstance.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = authService.getToken();
     // Initialisation de _retry si elle n'existe pas
    if (!config._retry) {
      config._retry = false; // Si le champ _retry n'existe pas, on l'initialise à false
    }

    if (token) 
    {
      //config.headers.set('Authorization', `Bearer ${token}`);
      config.headers['Authorization'] =  `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor pour gérer le refresh token en cas de 401
axiosInstance.interceptors.response.use(
  (response) => response, // Si OK, on retourne directement
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig & { _retry?: boolean };
    console.log("Status : ", error.response?.status);
    console.log("originalRequest : ", originalRequest._retry);
    // Si 401 + pas déjà tenté de refresh
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry)  
      {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshToken();

        if (newToken) {
          // Mise à jour du header Authorization avec le nouveau token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          // On rejoue la requête avec le nouveau token
          return axiosInstance(originalRequest);
        }
      } 
      catch (refreshError) 
      {
        console.error('Echec du refresh token:', refreshError.response?.data || refreshError.message);
        authService.logout();
        return Promise.reject(refreshError);
      }
    }
    // Si autre erreur ou déjà tenté → rejet
    return Promise.reject(error);
  }
);

export default axiosInstance;

