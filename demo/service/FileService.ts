import axiosInstance2 from "@/app/api/axiosInstance2";

export const FileService = {
  uploadFile(file, session = null, establishmentId = null, code) 
  {
    const formData = new FormData();
    // Ajout des métadonnées si elles existent
    if (session) 
    {
      formData.append('session', session);
    }
    if (establishmentId) 
    {
      formData.append('establishmentId', establishmentId);
    }
    formData.append('file', file);
    formData.append('code', code)

    return axiosInstance2.post(`/files/upload`, formData)
      .then(response => {
        console.log('Fichier uploadé avec succès:', response.data);
        return response.data; // ID du fichier ou autre réponse
      })
      .catch(error => {
        console.error('Erreur lors de l’upload du fichier :', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return null; // ou {} ou throw error selon le choix
      });
  },

  getViewUrl(fileId) 
  {
    return axiosInstance2.get(`files/view/${fileId}`, {
      responseType: 'blob' 
      })
      .then(response => {
        console.log('Fichier recupéré avec succès:', response);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur lors du chargement du fichier :', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return null;
      });
  },


  deleteFile(fileId) {
  return axiosInstance2.delete(`files/delete/${fileId}`)
    .then(response => {
      console.log('Fichier supprimé avec succés :', response.data);
    })
    .catch(error => {
      console.error('Erreur Cdt trouvé:', error);
      throw error;
    });
  },

  getFiles(establishmentId: string) {
    console.log(establishmentId);
    return axiosInstance2.get('files/by-etab', {
      params: { establishmentId : establishmentId }
    })
      .then(response => {
        console.log('Données retrouvées avec succés :', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur recuperation files :', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },


    getMetrics() {
        return fetch('/demo/data/file-management.json', {
            headers: { 'Cache-Control': 'no-cache' }
        })
            .then((res) => res.json())
            .then((d) => d.metrics);
    },

    getFoldersSmall() {
        return fetch('/demo/data/file-management.json', {
            headers: { 'Cache-Control': 'no-cache' }
        })
            .then((res) => res.json())
            .then((d) => d.folders_small);
    },

    getFoldersLarge() {
        return fetch('/demo/data/file-management.json', {
            headers: { 'Cache-Control': 'no-cache' }
        })
            .then((res) => res.json())
            .then((d) => d.folders_large);
    }
};