import axiosInstance from "@/app/api/axiosInstance";


export interface RegionDTO {
  name: string;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface DepartementDTO {
  name: string;
  region : Object;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface DepartementDTO {
  name: string;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface VilleDTO {
  name: string;
  departement: Object;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface CentreEtatCivilDTO {
  name: string;
  code: string;
  departement: Object;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface SerieDTO {
  name: string;
  code: string;
  type_filiere: Object;
  type_serie: Object;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface MatiereDTO {
  name: string;
  code: string;
  coef_princ : number;
  coef_prat : number;
  memo : number;
  serie: Object;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface EtablissementDTO {
  name: string;
  code: string;
  insp_aca : Object;
  type_etab : Object;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface InspectionAcademieDTO {
  name: string;
  code: string;
  region : Object;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface UniversiteDTO {
  name: string;
  code: string;
  region : Object;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface ProgrammationDTO {
  edition : string;
  date_start : string;
  date_end : string;
  bfemEPI : number;
  bfemI : number;
  codeSup1 : string;
  codeSup2 : string
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface BaseMorteDTO {
  exclusionDuree : number;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface SujetDTO {
  wording: string;
  num_sujet : number;
  etab_id : string;
  spec_id: string;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface CandidatDTO {
  dos_number: string;
  session: number;
  firstname: string;
  lastname: string;
  date_birth: string; // Format attendu : 'yyyy-MM-dd'
  place_birth: string;
  gender: string; // Ou crée une enum si besoin
  phone1: string;
  phone2: string;
  email: string;
  year_registry_num: number;
  registry_num: number;
  bac_do_count: number;
  year_bfem: number;
  subject: string;
  handicap: boolean;
  type_handicap: string;
  eps: string;
  cdt_is_cgs: boolean;
  decision: number; // 1 = En cours, 2 = Validé, 3 = Rejeté
  origine_bfem : string;
  
  eprFacListA : string;
  eprFacListB : Object;

  //options: Option[];

  matiere1 : Object;
  matiere2 : Object;
  matiere3 : Object; 
  typeCandidat : Object;
  etablissement : Object;
  centreEtatCivil : Object;
  serie : Object;
  nationality : Object;
  countryBirth : Object;
  concoursGeneral : Object;
}

export interface CandidatDecisionDTO {
  decision: number;
  motif: string;
}

// Si tu as un type pour Option (exemple minimal) :
export interface Option {
  id: string;
  name: string;
}


export interface SerieDTO {
  id: string;
  name: string;
  code: string;
}

export interface GroupedSeriesDTO {
  filiereName: string;
  series: SerieDTO[];
}

export interface ActeurDTO {
  etablissement : Object;
}

export interface ProfilDTO {
  name : string;
}

export interface UserDTO {
  firstname: string;
  lastname: string;
  login: string; // Format attendu : 'yyyy-MM-dd'
  password: string;
  phone: string; // Ou crée une enum si besoin
  email: string;
  state_account : boolean;
  profil : ProfilDTO;
  acteur : ActeurDTO;
}

export interface EtabDTO {
  code : string;
  name : string;
  type_cdts : object;
  type_ens : object;
  type_etab : object;
  zone : number;
  insp_aca : object;
  dep : object;
  centre_exam : object;
  ville : object,
  capacity: number,
  nb_of_jury: number,
  capacity_eps: number,
  nb_act_sur_site: number
  
}


export interface Candidat {
  _id: string;
  firstname: string;
  lastname: string;
  date_birth: string;
  place_birth: string;
  nationality: string;
  age: number;
  tableNum: number;
  session: number;
  jury: number;
  serie: string;
  gender: string;
  etablissement: string;
  centreEcritPrincipal: string;
  centreExamen: string;
  matiere1?: string;
  matiere2?: string;
  matiere3?: string;
  acaEtab: string;
  acaCentEcrit: string;
}

export interface CandidatPage {
  content: Candidat[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface CandidatGrouped {
  [aca: string]: CandidatPage;
}

export interface RespCandidats {
  data: CandidatGrouped;
  total: number;
  totalPages: number;
  size: number;
  page: number;
}

export interface LazyParams {
  page?: number;
  rows?: number;
}





export const ParametrageService = {

  uploadFile(file) 
  {
    const formData = new FormData();
    formData.append('file', file);

    return axiosInstance.post(`/import-data/data-candidats`, formData, {headers: {'Content-Type': 'multipart/form-data'}})
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

  getUsers() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/users')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getAllCandidats(page: number, size: number) 
  {
  
        return axiosInstance.get(`/import-data/get-all-candidats/${page}/${size}`, {})
            .then(response => {
                console.log('Archives trouvées avec succès:', response.data);
  
                return {
                    data: response.data.content,
                    total: response.data.totalElements
                };
            })
            .catch(error => {
                console.error('❌ Erreur chargement archives:', error);
                console.error('Code HTTP:', error.response?.status);
                console.error('Message serveur:', error.response?.data);
                throw error;
            });
  },




  getDataRepCP() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/import-data/repCP-by-aca')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },



  getDataRepCS() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/import-data/repCS-by-aca')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getAllDataCP() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/import-data/repCP-all')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getDataFeuilleCP() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/import-data/feuilleCP-by-aca')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getDataFeuilleCS() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/import-data/feuilleCS-by-aca')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  doRepCEP() {
      // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
      return axiosInstance.post(`/import-data/repartition-cep`)
      .then(response => {
          console.log('Données reçues:', response.data);
          return response.data; // <-- ici, on retourne les données
      })
      .catch(error => {
          console.error('Erreur Axios:', error);
          console.error('Code HTTP:', error.response?.status);
          console.error('Message:', error.response?.data);
          return []; // on peut retourner un tableau vide pour éviter un crash
      });
  },

  doRepCS() {
      // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
      return axiosInstance.post(`/import-data/repartition-cs`)
      .then(response => {
          console.log('Données reçues:', response.data);
          return response.data; // <-- ici, on retourne les données
      })
      .catch(error => {
          console.error('Erreur Axios:', error);
          console.error('Code HTTP:', error.response?.status);
          console.error('Message:', error.response?.data);
          return []; // on peut retourner un tableau vide pour éviter un crash
      });
  },


  doDecompteFeuilleCEP() {
      // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
      return axiosInstance.post(`/import-data/feuille-cep`)
      .then(response => {
          console.log('Données reçues:', response.data);
          return response.data; // <-- ici, on retourne les données
      })
      .catch(error => {
          console.error('Erreur Axios:', error);
          console.error('Code HTTP:', error.response?.status);
          console.error('Message:', error.response?.data);
          return []; // on peut retourner un tableau vide pour éviter un crash
      });
  },

  doDecompteFeuilleCS() {
      // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
      return axiosInstance.post(`/import-data/feuille-cs`)
      .then(response => {
          console.log('Données reçues:', response.data);
          return response.data; // <-- ici, on retourne les données
      })
      .catch(error => {
          console.error('Erreur Axios:', error);
          console.error('Code HTTP:', error.response?.status);
          console.error('Message:', error.response?.data);
          return []; // on peut retourner un tableau vide pour éviter un crash
      });
  },


  createUser(userDTO : UserDTO, is_go_by_smtp : boolean) {
    return axiosInstance.post('/parametrage/create-user', userDTO, {
      params: { send_access_smtp : is_go_by_smtp }
    })
      .then(response => {
        console.log('Prog créé avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création sujet:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  updateUser(idUsr, userDTO) {
    return axiosInstance.put('/parametrage/update-user', userDTO, {
      params: { idUsr: idUsr.current }
    })
      .then(response => {
        console.log('User mis à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour user:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

  createCentreEtatCivil(cecDTO : CentreEtatCivilDTO) {
    return axiosInstance.post('/parametrage/create-cec', cecDTO)
      .then(response => {
        console.log('Data créé avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création :', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  updateCentreEtatCivil(idCeC, cecDTO) {
    return axiosInstance.put('/parametrage/update-cec', cecDTO, {
      params: { idCeC : idCeC.current }
    })
      .then(response => {
        console.log('Donnée mise à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour :', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

  createVille(villeDTO : VilleDTO) {
    return axiosInstance.post('/parametrage/create-ville', villeDTO)
      .then(response => {
        console.log('Donnée créée avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création donnée:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  updateVille(idV, villeDTO) {
    return axiosInstance.put('/parametrage/update-ville', villeDTO, {
      params: { idV: idV.current }
    })
      .then(response => {
        console.log('Data mis à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour data:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

  createEtab(etabDTO : EtabDTO) {
    return axiosInstance.post('/parametrage/create-etablissement', etabDTO)
      .then(response => {
        console.log('Etablissement créé avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création etab :', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  updateEtab(idEt, etabDTO) {
    return axiosInstance.put('/parametrage/update-etablissement', etabDTO, {
      params: { idEt: idEt.current }
    })
      .then(response => {
        console.log('Data mise à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour user:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

  updatePassword(email) {
    return axiosInstance.put(`/parametrage/update-password?email=${encodeURIComponent(email)}`)
      .then(response => {
        console.log('Mot de passe mis à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour user:', error);
        throw error;
      });
  },

  deleteUser(id_user) {
    return axiosInstance.delete(`/parametrage/delete-user?idUsr=${encodeURIComponent(id_user)}`)
      .then(response => {
        console.log('Compte supprimé :', response.data);
      })
      .catch(error => {
        console.error('Erreur mise à jour user:', error);
        throw error;
      });
  },

  desactiveUser(id_user, state) 
  {
    return axiosInstance.patch(`/parametrage/update-account?idUsr=${encodeURIComponent(id_user)}&state=${encodeURIComponent(state)}`)
      .then(response => {
        console.log('Compte retouché :', response.data);
        return response.data
      })
      .catch(error => {
        console.error('Erreur mise à jour user :', error);
        throw error;
      });
  },

  changedPassword(idUsr, changedPasswordDTO) 
  {
    console.log(idUsr)
    return axiosInstance.put('/security/changed-password', changedPasswordDTO, {
      params: { usrId: idUsr }
    })
      .then(response => {
        console.log('User mis à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour user:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

  getRegions() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/regions')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getTypeCdts() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/type-candidats')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getTypeEns() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/type-enseignements')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getTypeEtabs() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/type-etablissements')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  createRegion(regionDTO: RegionDTO) {
    return axiosInstance.post('/parametrage/create-region', regionDTO)
      .then(response => {
        console.log('Data créé avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création sujet:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  updateRegion(idR, regionDTO) {
    console.log(idR, " ", regionDTO);
    return axiosInstance.put('/parametrage/update-region', regionDTO, {
      params: { idR: idR.current }
    })
      .then(response => {
        console.log('Region mise à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour :', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

  createDepartement(departementDTO: DepartementDTO) {
    return axiosInstance.post('/parametrage/create-departement', departementDTO)
      .then(response => {
        console.log('Data créé avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création data :', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  updateDepartement(idD, departementDTO) {
    return axiosInstance.put('/parametrage/update-departement', departementDTO, {
      params: { idD : idD.current }
    })
      .then(response => {
        console.log('Département mis à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mis à jour :', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

  getDepartements() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/departements')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getVilles() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/villes')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getMatieres() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/matieres')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getIAs() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/inspection-academies')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getUnivs() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/univs')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getSeries() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/series')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

   getCentreEtatCivils() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/centre-etat-civil')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getEtablissements() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/etablissements')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getPays() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/nationality')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getMatiereOptions() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/options')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  
  getSeriesByFiliere() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/grouped-by-filiere')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getMatieresByType() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/grouped-by-type-matiere')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getEtabsByIA() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/etab-grouped-by-aca')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getIAByRegion() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/ia-grouped-by-reg')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getCExam() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/centres-examen')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getCECByDep() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/parametrage/cec-grouped-by-dep')
    .then(response => {
        console.log('Données reçues:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getProg() {
    return axiosInstance.get('/parametrage/programmations')
      .then(response => {
        console.log('Programmations trouvées avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création sujet:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  createProg(programmationDTO: ProgrammationDTO) {
    return axiosInstance.post('/parametrage/create-prog', programmationDTO)
      .then(response => {
        console.log('Prog créé avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création sujet:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  updateProg(idPrg, programmationDTO) {
    return axiosInstance.put('/parametrage/update-prog', programmationDTO, {
      params: { idPrg: idPrg.current }
    })
      .then(response => {
        console.log('Prog mis à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour user:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

  
  getLastProg() {
    return axiosInstance.get('/parametrage/programmation-last')
      .then(response => {
        console.log('Programmations trouvée avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création sujet:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  getArchives(page: number, size: number, search: string) {
      // Si search est vide, on ne l'inclut pas dans les paramètres de la requête
      const params = search ? { search } : {};

      return axiosInstance.get(`/import-data/get-archives/${page}/${size}`, { params })
          .then(response => {
              console.log('Archives trouvées avec succès:', response.data);

              return {
                  data: response.data.content,
                  total: response.data.totalElements
              };
          })
          .catch(error => {
              console.error('❌ Erreur chargement archives:', error);
              console.error('Code HTTP:', error.response?.status);
              console.error('Message serveur:', error.response?.data);
              throw error;
          });
  },

  getNotifications() 
  {
    return axiosInstance.get('/notifications/unseen')
      .then(response => {
        console.log('Notifications trouvées avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur reception notifications :', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  notifRead(id: string) {
  return axiosInstance.post(`/notifications/${id}/seen`)
    .then((response) => {
      console.log('Notification marquée comme lue:', response.data);
    })
    .catch((error) => {
      console.error('Erreur lors de la mise à jour de la notification :', error);
      throw error;
    });
},

  getStatByDepartment(session : number) {
      // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
      return axiosInstance.get(`/stats/stats-nationales/${session}`)
      .then(response => {
          console.log('Données reçues:', response.data);
          return response.data; // <-- ici, on retourne les données
      })
      .catch(error => {
          console.error('Erreur Axios:', error);
          console.error('Code HTTP:', error.response?.status);
          console.error('Message:', error.response?.data);
          return []; // on peut retourner un tableau vide pour éviter un crash
      });
    },

  getStatGlobales(session : number) {
      // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
      return axiosInstance.get(`/stats/stats-globales/${session}`)
      .then(response => {
          console.log('Données reçues:', response.data);
          return response.data; // <-- ici, on retourne les données
      })
      .catch(error => {
          console.error('Erreur Axios:', error);
          console.error('Code HTTP:', error.response?.status);
          console.error('Message:', error.response?.data);
          return []; // on peut retourner un tableau vide pour éviter un crash
      });
  },

  getStatAcademies(session : number) {
      // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
      return axiosInstance.get(`/stats/stats-by-academie/${session}`)
      .then(response => {
          console.log('Données reçues:', response.data);
          return response.data; // <-- ici, on retourne les données
      })
      .catch(error => {
          console.error('Erreur Axios:', error);
          console.error('Code HTTP:', error.response?.status);
          console.error('Message:', error.response?.data);
          return []; // on peut retourner un tableau vide pour éviter un crash
      });
  },

  getStatHandicap(session : number) {
      // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
      return axiosInstance.get(`/stats/stats-by-handicap/${session}`)
      .then(response => {
          console.log('Données reçues:', response.data);
          return response.data; // <-- ici, on retourne les données
      })
      .catch(error => {
          console.error('Erreur Axios:', error);
          console.error('Code HTTP:', error.response?.status);
          console.error('Message:', error.response?.data);
          return []; // on peut retourner un tableau vide pour éviter un crash
      });
  },

  getStatSerie(session : number) {
      // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
      return axiosInstance.get(`/stats/stats-by-serie/${session}`)
      .then(response => {
          console.log('Données reçues:', response.data);
          return response.data; // <-- ici, on retourne les données
      })
      .catch(error => {
          console.error('Erreur Axios:', error);
          console.error('Code HTTP:', error.response?.status);
          console.error('Message:', error.response?.data);
          return []; // on peut retourner un tableau vide pour éviter un crash
      });
  },

  getInfoUsers() {
      // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
      return axiosInstance.get(`/parametrage/users/stats`)
      .then(response => {
          console.log('Users Infos reçues:', response.data);
          return response.data; // <-- ici, on retourne les données
      })
      .catch(error => {
          console.error('Erreur Axios:', error);
          console.error('Code HTTP:', error.response?.status);
          console.error('Message:', error.response?.data);
          return []; // on peut retourner un tableau vide pour éviter un crash
      });
  },


  updateDureeMention(idBm, dureeMention) 
  {
    return axiosInstance.patch(`/import-data/updateDureeMention?idBm=${encodeURIComponent(idBm)}&dureeMention=${encodeURIComponent(dureeMention)}`)
      .then(response => {
        console.log('Compte retouché :', response.data);
        return response.data
      })
      .catch(error => {
        console.error('Erreur mise à jour user :', error);
        throw error;
      });
  },








 
};