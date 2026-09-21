import axiosInstance from '@/app/api/axiosInstance';
import { saveAs } from 'file-saver';
import { PageSpring, RechercheGlobaleResultat, ReleveDetail, ReleveResume, ReleveSaisieRequest } from './types';

export interface RechercheGlobaleCriteres {
    numeroTable?: string;
    annee?: number | null;
    nom?: string;
    prenom?: string;
    dateNaissance?: string;
    lieuNaissance?: string;
}

/**
 * Recherche un ou plusieurs relevés à travers les 29 séries de bottins, à
 * partir de n'importe quelle combinaison de critères (N° de table, année,
 * nom, prénom, date de naissance, lieu de naissance), sans connaître la
 * série au préalable. Peut remonter plusieurs candidats (homonymes).
 */
export async function rechercherGlobal(criteres: RechercheGlobaleCriteres): Promise<RechercheGlobaleResultat[]> {
    const res = await axiosInstance.get<RechercheGlobaleResultat[]>('/releves/rechercher', {
        params: {
            numeroTable: criteres.numeroTable?.trim() || undefined,
            annee: criteres.annee || undefined,
            nom: criteres.nom?.trim() || undefined,
            prenom: criteres.prenom?.trim() || undefined,
            dateNaissance: criteres.dateNaissance || undefined,
            lieuNaissance: criteres.lieuNaissance?.trim() || undefined
        }
    });
    return res.data;
}

/**
 * Fabrique une API CRUD + PDF + liste (paginée, filtrable par n° de table et
 * année) pour une série donnée, à partir de son chemin de base REST
 * (ex: "/releves-a1"). Utilise l'axiosInstance du projet (baseURL
 * ".../ob/api/v1/", intercepteur JWT déjà en place).
 */
export function createReleveApi(basePath: string) {
    return {
        creer: async (payload: ReleveSaisieRequest): Promise<ReleveDetail> => {
            const res = await axiosInstance.post<ReleveDetail>(basePath, payload);
            return res.data;
        },

        mettreAJour: async (id: string, payload: ReleveSaisieRequest): Promise<ReleveDetail> => {
            const res = await axiosInstance.put<ReleveDetail>(`${basePath}/${id}`, payload);
            return res.data;
        },

        obtenir: async (id: string): Promise<ReleveDetail> => {
            const res = await axiosInstance.get<ReleveDetail>(`${basePath}/${id}`);
            return res.data;
        },

        lister: async (params: { page?: number; size?: number; sort?: 'asc' | 'desc'; numeroTable?: string; annee?: number }): Promise<PageSpring<ReleveResume>> => {
            const res = await axiosInstance.get<PageSpring<ReleveResume>>(basePath, {
                params: {
                    page: params.page ?? 0,
                    size: params.size ?? 10,
                    sort: params.sort ?? 'desc',
                    numeroTable: params.numeroTable || undefined,
                    annee: params.annee || undefined
                }
            });
            return res.data;
        },

        telechargerPdf: async (id: string, nomFichier?: string): Promise<void> => {
            const res = await axiosInstance.get(`${basePath}/${id}/pdf`, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            saveAs(blob, nomFichier ?? `releve-${id}.pdf`);
        }
    };
}

export type ReleveApi = ReturnType<typeof createReleveApi>;
