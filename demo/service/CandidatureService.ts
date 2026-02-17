import axiosInstance from "@/app/api/axiosInstance";
import { Candidat } from "@/types/candidat";
import { SujetCandidatsDTO } from "@/types/sujetToCandidats";
import { saveAs } from 'file-saver';


export interface ProgrammationDTO {
  edition: string;
  date_start: string;
  date_end: string;
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface SujetDTO {
  wording: string;
  num_sujet : number;
  etab_id : string;
  spec_id: string;
  session : number
  // Ajoute ici les autres champs attendus par ton SujetDTO
}

export interface CandidatDTO {
  dosNumber: string;
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
  registry_num: string;
  bac_do_count: number;
  year_bfem: number;
  subject: string;
  handicap: boolean;
  type_handicap: string;
  eps: string;
  alreadyBac : boolean;
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
  centreExamen : Object;
  serie : Object;
  nationality : Object;
  countryBirth : Object;
  concoursGeneral : Object;
  codeEnrolementEC : String
}

export interface ConcoursGeneralDTO {
  firstname: string;
  lastname: string;
  date_birth: string; // Format attendu : 'yyyy-MM-dd'
  place_birth: string;
  phone : string;
  gender: string; // Ou crée une enum si besoin
  serie : Object;
  classe_0 : String;
  classe_1 : String;
  note_student_disc : Number;
  note_classe_disc : Number;
  firstname_prof : String;
  lastname_prof : String;
  session : number;
  etablissement : String;
  level : String,
  specialite : String
}

export interface SpecialiteCgsDTO
{
    specialite : object;
    candidats : any[]
}


export interface VignetteAddDTO {
  v1000: number;
  v5000: number;
}

export interface FormData {
  tableNum: string;
  yearBac: string;
  hasBac: 'yes' | 'no'; // ✅ ajout ici
}


export interface CandidatDecisionDTO {
  dosNumber: string;
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
  motif: string[];
  operator : string;
}

// Si tu as un type pour Option (exemple minimal) :
export interface Option {
  id: string;
  name: string;
}

export interface AutorisationReception {
  representative : string;
  enabled : boolean;
}

const formatDateToLocalDate = (date: Date | null): string => {
  if (!date) return "";
  return date.toISOString().split("T")[0]; // garde seulement yyyy-MM-dd
};


export const CandidatureService = {

  getLastProg() {
    return axiosInstance.get('/enrollment-candidats/programmation-last')
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

  getSeries() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/enrollment-candidats/series')
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
    return axiosInstance.get('/enrollment-candidats/centre-etat-civil')
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

  getCentreExamen() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/enrollment-candidats/centres-examen')
    .then(response => {
        console.log('Données reçues CEXAMEN:', response.data);
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
    return axiosInstance.get('/enrollment-candidats/etablissements')
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
    return axiosInstance.get('/enrollment-candidats/nationality')
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
    return axiosInstance.get('/enrollment-candidats/options')
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

  getSpecialites() {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get('/enrollment-candidats/specialites')
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

  createCandidat(candidatDTO: CandidatDTO) {
    return axiosInstance.post('/enrollment-candidats/add-candidat', candidatDTO)
      .then(response => {
        console.log('Candidat créé avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création sujet:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  updateCandidat(idCdt, candidatDTO) {
    return axiosInstance.put('/enrollment-candidats/update-candidat', candidatDTO, {
      params: { idCdt: idCdt.current }
    })
      .then(response => {
        console.log('Candidat mis à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour candidat:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

  updateDecision(idCdt, candidatDecisionDTO) {
    return axiosInstance.patch('/validation-candidats/update-decision-cdt', candidatDecisionDTO, {
      params: { idCdt: idCdt.current }
    })
      .then(response => {
        console.log('Candidat validé avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour candidat:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

  updateCoupons(idEV, vignetteAddDTO, firstname, lastname) {
    return axiosInstance.patch('/validation-candidats/update-coupons-etab', vignetteAddDTO, {
      params: { idEV: idEV.current, f : firstname, l : lastname }
    })
      .then(response => {
        console.log('Coupons validés avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  correctionVignettes(idEV, motif, firstname, lastname) {
    return axiosInstance.patch('/validation-candidats/correction-coupons-etab', {}, {
      params: { idEV: idEV.current, motif : motif, f : firstname, l : lastname }
    })
      .then(response => {
        console.log('Coupons corrigés avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  updateAutorisationReception(idCmptDroitInsc, autorisationReception) {
    console.log(idCmptDroitInsc);
    return axiosInstance.patch('/validation-candidats/autorisation-reception', autorisationReception, {
      params: { idCmptDroitInsc : idCmptDroitInsc }
    })
      .then(response => {
        console.log('Compte mis à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour candidat:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },


  getCandidats() {
    return axiosInstance.get('/enrollment-candidats/found-cdts')
      .then(response => {
        console.log('Candidats trouvés avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création sujet:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  getCandidatsByEtablissement(id_etab: string, session : number) {
  return axiosInstance.get(`/enrollment-candidats/candidats/etablissement/${id_etab}/${session}`)
    .then(response => {
      console.log('Candidats trouvés pour l\'établissement:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des candidats par établissement:', error);
      throw error;
    });
  },

  getAuditReceptionDossier(id_cdt: string) {
  return axiosInstance.get(`/validation-candidats/get-audit-reception-dosssier/${id_cdt}`)
    .then(response => {
      console.log('Audit du candidat :', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des candidats par établissement:', error);
      throw error;
    });
  },


  getDispoCGS(specialite, classe, session, etablissement) {
    return axiosInstance.get('/enrollment-candidats/count-dispo-cgs', {
      params: {
        specialite : specialite,
        //serieCode: serieCode,
        classe: classe,
        session: session,
        etablissement: etablissement,
      }
    })
      .then(response => {
        console.log('Candidats filtrés avec succès :', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur lors du filtrage des candidats :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  filterCandidats(etablissementId, session) {
    return axiosInstance.get('/validation-candidats/candidats/filter', {
      params: {
        etablissementId: etablissementId,
        //serieCode: serieCode,
        session: session
      }
    })
      .then(response => {
        console.log('Candidats filtrés avec succès :', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur lors du filtrage des candidats :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  getListByEtab(etablissementId, session, etablissementName, login, serie, cleDeTri) {
  return axiosInstance.get('/pdf/generate', {
    params: {
      etablissementId: etablissementId,
      session: session,
      user : login,
      sortBy : cleDeTri,
      serie : serie
    },
    responseType: 'blob'
    })
      .then(response => {
        const filename = `liste_des_candidats_${etablissementName}_bac_edition_${session}_serie_${serie}.pdf`;
        saveAs(response.data, filename);
        console.log('PDF téléchargé avec succès');
        return filename;
      })
      .catch(error => {
        console.error('Erreur lors du téléchargement du PDF :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  getSujetsByEtab(etablissementId, session, etablissementName, login, sujet) {
  return axiosInstance.get('/pdf/generate-cdts-with-sujets', {
    params: {
      etablissementId: etablissementId,
      session: session,
      user : login,
      subject : sujet,
    },
    responseType: 'blob'
    })
      .then(response => {
        const filename = `liste_des_soutenance_de_projet_candidats_${etablissementName}_bac_edition_${session}_sujet_${sujet}.pdf`;
        saveAs(response.data, filename);
        console.log('PDF téléchargé avec succès');
        return filename;
      })
      .catch(error => {
        console.error('Erreur lors du téléchargement du PDF :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  getListOLByEtab(etablissementId, session, etablissementName, login, serie) {
  return axiosInstance.get('/pdf/generate-officielle-liste', {
    params: {
      etablissementId: etablissementId,
      session: session,
      user : login,
      serie : serie
    },
    responseType: 'blob'
    })
      .then(response => {
        const filename = `liste_officielle_des_candidats_${etablissementName}_bac_edition_${session}_serie_${serie}.pdf`;
        saveAs(response.data, filename);
        console.log('PDF téléchargé avec succès');
        return filename;
      })
      .catch(error => {
        console.error('Erreur lors du téléchargement du PDF :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  getListContactsByEtab(etablissementId, session, etablissementName, login) {
  return axiosInstance.get('/pdf/generate-liste-des-contacts', {
    params: {
      etablissementId: etablissementId,
      session: session,
      user : login
    },
    responseType: 'blob'
    })
      .then(response => {
        const filename = `liste_de_contact_des_candidats_${etablissementName}_bac_edition_${session}.pdf`;
        saveAs(response.data, filename);
        console.log('PDF téléchargé avec succès');
        return filename;
      })
      .catch(error => {
        console.error('Erreur lors du téléchargement du PDF :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  getListCGS(etablissementId, session, etablissementName, login, specialite, level) {
  return axiosInstance.get('/pdf/generate-cgs', {
    params: {
      etablissementId: etablissementId,
      session: session,
      user : login,
      specialite : specialite,
      level : level
    },
    responseType: 'blob'
    })
      .then(response => {
        const filename = `liste_des_candidats_${etablissementName}_cgs_edition_${session}_discipline_${specialite}_classe_${level}.pdf`;
        saveAs(response.data, filename);
        console.log('PDF téléchargé avec succès');
        return filename;
      })
      .catch(error => {
        console.error('Erreur lors du téléchargement du PDF :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  getListRejetByEtab(etablissementId, session, etablissementName, login) {
  return axiosInstance.get('/pdf/generate-rejets', {
    params: {
      etablissementId: etablissementId,
      session: session,
      user : login
    },
    responseType: 'blob'
    })
      .then(response => {
        const filename = `liste_des_rejets_${etablissementName}_bac_edition_${session}.pdf`;
        saveAs(response.data, filename);
        console.log('PDF téléchargé avec succès');
        return filename;
      })
      .catch(error => {
        console.error('Erreur lors du téléchargement du PDF :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  filterEtatsVersements(session) 
  {
    return axiosInstance.get('/validation-candidats/etat-versements', {
      params: {
        session: session
      }
    })
      .then(response => {
        console.log('EVs filtrés avec succès :', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur lors du filtrage des candidats :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  filterEtatsVersements_(etablissementId, session) 
  {
    return axiosInstance.get('/validation-candidats/etat-versements/filter', {
      params: {
        etablissementId: etablissementId,
        session: session  
      }
    })
      .then(response => {
        console.log('EVs filtrés avec succès :', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur lors du filtrage des candidats :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  compteFAEBS(establishmentId, session) {
    return axiosInstance.get('/validation-candidats/compte-droits-inscription', {
      params: {
        establishmentId : establishmentId,
        session : session
      }
    })
      .then(response => {
        console.log('Compte FAEB recupéré avec succès :', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur lors du load FAEB :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  compteFAEBS_(establishmentId, session) {
    return axiosInstance.get('/enrollment-candidats/compte-droits-inscription', {
      params: {
        establishmentId : establishmentId,
        session : session
      }
    })
      .then(response => {
        console.log('Compte FAEB recupéré avec succès :', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur lors du load FAEB :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  // C'est le decompte à la fois du nombre total de candidats inscrits et des epreuves facultatives
  compteEF(session, establishmentId) {
    return axiosInstance.get('/validation-candidats/decompte-nombre-epFac', {
      params: {
        session : session,
        establishmentId : establishmentId
      }
    })
      .then(response => {
        console.log('Décompte EF recupéré avec succès :', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur lors du filtrage des EF :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  compteEF_(session, establishmentId) {
    return axiosInstance.get('/enrollment-candidats/decompte-nombre-epFac', {
      params: {
        session : session,
        establishmentId : establishmentId
      }
    })
      .then(response => {
        console.log('Décompte EF recupéré avec succès :', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur lors du filtrage des EF :', error);
        console.error('Code HTTP :', error.response?.status);
        console.error('Message :', error.response?.data);
        throw error;
      });
  },

  getProgs() {
    return axiosInstance.get('/validation-candidats/programmations')
      .then(response => {
        console.log('Progs trouvés avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création sujet:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  createSujet(sujetDTO: SujetDTO) {
    return axiosInstance.post('/enrollment-candidats/create-sujet', sujetDTO)
      .then(response => {
        console.log('Sujet créé avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création sujet:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  updateSujet(id_sujet, sujetDTO) {
    return axiosInstance.put('/enrollment-candidats/update-sujet', sujetDTO, {
      params: { idS : id_sujet.current }
    })
      .then(response => {
        console.log('Sujet mis à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour candidat:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

  getSujets() {
    return axiosInstance.get('/enrollment-candidats/sujets')
      .then(response => {
        console.log('Sujets trouvés avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création sujet:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  getCEC(cecName: string) {
    return axiosInstance.post('/enrollment-candidats/found-cec', cecName)
      .then(response => {
        console.log('CEC trouvé avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })  
      .catch(error => {
        console.error('Erreur CEC trouvé:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  asignSujetToCandidat(sujetCandidatsDTO : SujetCandidatsDTO) {
    return axiosInstance.put('/enrollment-candidats/assign-sujet-to-candidats', sujetCandidatsDTO)
      .then(response => {
        console.log('Assignation effectuée avec succés:');
        return response;
      })
      .catch(error => {
        console.error('Erreur mise à jour candidat:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },


  createCdtCgs(concoursGeneral : ConcoursGeneralDTO) {
    return axiosInstance.post('/enrollment-candidats/add-candidat-cgs', concoursGeneral)
      .then(response => {
        console.log('Candidat créé avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur création sujet:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },

  updateCdtCgs(idCgs, concoursGeneralDTO) {
    return axiosInstance.put('/enrollment-candidats/update-candidat-cgs', concoursGeneralDTO, {
      params: { idCgs : idCgs.current }
    })
      .then(response => {
        console.log('Candidat mis à jour avec succès:', response.data);
        return response.data;
      })
      .catch(error => {
        console.error('Erreur mise à jour candidat:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

    asignSpecialiteToCandidatCGS(specialiteCgsDTO : SpecialiteCgsDTO) {
    return axiosInstance.put('/enrollment-candidats/assign-specialite-to-candidats-cgs', specialiteCgsDTO)
      .then(response => {
        console.log('Assignation effectuée avec succés:');
        return response;
      })
      .catch(error => {
        console.error('Erreur mise à jour candidat:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;
      });
  },

  getCdtsCgsBySpecialite(level: string, specName: string) {
  return axiosInstance.post(`/enrollment-candidats/found-cdtcgs-by-specialite?level=${encodeURIComponent(level)}&specialite=${encodeURIComponent(specName)}`)
    .then(response => {
      console.log('Cdts trouvés avec leur sujet:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Erreur Cdt trouvé:', error);
      throw error;
    });
  },

  getCdtsCgsByEtablissement(id_etab: string, session : number) {
  return axiosInstance.get(`/enrollment-candidats/candidats-cgs/${id_etab}/${session}`)
    .then(response => {
      console.log('Candidats trouvés pour le CGS :', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des candidats par établissement:', error);
      throw error;
    });
  },

  getCdtsCgsByClasse(id_etab: string, session : number) {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get(`/enrollment-candidats/candidats-cgs/grouped-by-classe/${id_etab}/${session}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },


  getAllSpecialite() {
  return axiosInstance.get(`/enrollment-candidats/cgs/listeSpecialite`)
    .then(response => {
      console.log('Spécialités trouvées :', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des sujets par établissement:', error);
      throw error;
    });
  },

  getCdtsBySujet(sujetName: string) {
  return axiosInstance.post(`/enrollment-candidats/found-cdt-by-subject?sujet=${encodeURIComponent(sujetName)}`)
    .then(response => {
      console.log('Cdts trouvés avec leur sujet:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Erreur Cdt trouvé:', error);
      throw error;
    });
  },

  getSujetsByEtablissement(id_etab: string, session : number) {
  return axiosInstance.get(`/enrollment-candidats/sujets/etablissement/${id_etab}/${session}`)
    .then(response => {
      console.log('Sujets trouvés pour l’établissement:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des sujets par établissement:', error);
      throw error;
    });
  },

  getNombreCandidatsSerieByEtab(id_etab: string, session: number) {
  return axiosInstance.get(`/enrollment-candidats/stat-series-etab/${id_etab}/session/${session}`)
    .then(response => {
      console.log('XXXXXX:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('XXXXX:', error);
      throw error;
    });
  },

  getNombreCandidatsSexeByEtab(id_etab: string, session: number) {
  return axiosInstance.get(`/enrollment-candidats/stat-sexe-etab/${id_etab}/session/${session}`)
    .then(response => {
      console.log('XXXXXX:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('XXXXX:', error);
      throw error;
    });
  },

  getNombreCandidatsEPSByEtab(id_etab: string, session: number) {
  return axiosInstance.get(`/enrollment-candidats/stat-eps-etab/${id_etab}/session/${session}`)
    .then(response => {
      console.log('YOUSSOU:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('YOUSSOU:', error);
      throw error;
    });
  },

  getNombreCandidatsHandicapByEtab(id_etab: string, session: number) {
  return axiosInstance.get(`/enrollment-candidats/stat-handicap-etab/${id_etab}/session/${session}`)
    .then(response => {
      console.log('YOUSSOU:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('YOUSSOU:', error);
      throw error;
    });
  },

  getNombreCandidatsEFLAByEtab(id_etab: string, session: number) {
  return axiosInstance.get(`/enrollment-candidats/stat-epFac-etab/${id_etab}/session/${session}`)
    .then(response => {
      console.log('YOUSSOU:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('YOUSSOU:', error);
      throw error;
    });
  },

  getNombreCandidatsOptionsByEtab(id_etab: string, session: number) {
  return axiosInstance.get(`/enrollment-candidats/stat-options-etab/${id_etab}/session/${session}`)
    .then(response => {
      console.log('YOUSSOU:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('YOUSSOU:', error);
      throw error;
    });
  },
  

  getRejets() {
    return axiosInstance.get('/enrollment-candidats/rejets')
      .then(response => {
        console.log('Rejets trouvés avec succès:', response.data);
        return response.data;  // Retourne le sujet créé
      })
      .catch(error => {
        console.error('Erreur:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        throw error;  // Ou bien tu peux return null ou un objet vide si tu préfères
      });
  },


  getCdtsBySerie(id_etab: string, session : number) {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get(`/enrollment-candidats/candidats/${id_etab}/${session}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getCdtsGroupedBySujet(id_etab: string, session : number) {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get(`/enrollment-candidats/candidats-sujets/${id_etab}/${session}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getDIByEtab(id_etab: string, session : number) {
      console.log("Ok", id_etab, " ", session);
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get(`/payment-FAEB3/getDroitsInscription/${id_etab}/${session}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  checkRedoublantOrFraude(tableNum : number, exYearBac : number) {
    console.log("Ok", tableNum, " ", exYearBac);
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.post(`/import-data/checkRedoublantOrFraude/${tableNum}/${exYearBac}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  retreiveDataByDosNumber(dos_number : String, session : number, etablissementId : String) {
    console.log("Ok", dos_number);
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.post(`/enrollment-candidats/checkByDosNumber/${dos_number}/${session}/${etablissementId}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  checkByEtatCivil(codeCentreEtatCivil : string, yearRegistryNum : number, registryNum : string) {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.post(`/import-data/checkRedoublantByEtatCivil/${codeCentreEtatCivil}/${yearRegistryNum}?registryNum=${encodeURIComponent(registryNum)}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },


  checkDoublon(yearRegistryNum : number, registryNum : string, cec : string, session : number) {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get(`/enrollment-candidats/doublon/${yearRegistryNum}/${cec}/${session}?registryNum=${encodeURIComponent(registryNum)}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => 
      {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },


  checkDoublonTel(phone1 : String, session : number) {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get(`/enrollment-candidats/doublon-by-tel/${phone1}/${session}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => 
      {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },


  checkDoublonEmail(email : String, session : number) {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get(`/enrollment-candidats/doublon-by-email/${email}/${session}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => 
      {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },
  

  checkReception(startStr : Date, endStr : Date, session : number) {
    const start = formatDateToLocalDate(startStr);
    const end = formatDateToLocalDate(endStr);
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get(`/validation-candidats/operator-daily/${start}/${end}/${session}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => 
      {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getSummarizeOperations(session : number) {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get(`/validation-candidats/operations-reception/${session}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => 
      {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  getSummarizeOperations_(session : number) {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get(`/validation-candidats/all-operations-reception/${session}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => 
      {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },


  getVignettes_(session : number) {
    // axiosInstance utilise déjà baseURL, donc on met juste le path relatif
    return axiosInstance.get(`/stats/stats-globales-vignettes/${session}`)
    .then(response => {
        console.log('EHEHEHEHE:', response.data);
        return response.data; // <-- ici, on retourne les données
    })
    .catch(error => 
      {
        console.error('Erreur Axios:', error);
        console.error('Code HTTP:', error.response?.status);
        console.error('Message:', error.response?.data);
        return []; // on peut retourner un tableau vide pour éviter un crash
    });
  },

  
  
  deleteCandidat(id_cdt : string) {
  return axiosInstance.delete(`/enrollment-candidats/delete-cdt?idCdt=${encodeURIComponent(id_cdt)}`)
    .then(response => {
      console.log('Cdts trouvés avec leur sujet:', response.data);
    })
    .catch(error => {
      console.error('Erreur Cdt trouvé:', error);
      throw error;
    });
  },

  deleteSujet(id_cdt : string) {
  return axiosInstance.delete(`/enrollment-candidats/delete-sujet/${id_cdt}`)
    .then(response => {
      console.log('Sujet :', response.data);
    })
    .catch(error => {
      console.error('Erreur Sujet trouvé:', error);
      throw error;
    });
  },

  deleteCandidatCGS(id_cdt : string) {
  return axiosInstance.delete(`/enrollment-candidats/delete-cgs?idCdt=${encodeURIComponent(id_cdt)}`)
    .then(response => {
      console.log('Cdts trouvés avec leur sujet:', response.data);
    })
    .catch(error => {
      console.error('Erreur Cdt trouvé:', error);
      throw error;
    });
  },



 
};