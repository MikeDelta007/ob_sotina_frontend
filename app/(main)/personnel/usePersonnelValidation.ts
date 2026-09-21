import { useCallback } from 'react'

export interface PersonnelFieldsErrors {
  civilite?: string
  firstname?: string
  lastname?: string
  phone?: string
  email?: string
  matricule?: string
}

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s\-']+$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Numéros sénégalais : préfixe operateur (77/76/70/78/33/75/71) + 7 chiffres
const PHONE_REGEX = /^(77|76|70|78|33|75|71)\d{7}$/

const cleanPhone = (value: string) => (value ? value.replace(/\D/g, '') : '')

// Validation des champs d'identité du formulaire personnel (fiche + profil), sur le même
// principe que useExaminateurValidation (projet enrolement_acteur) : champs requis + format.
export function usePersonnelValidation() {
  // Retire les caractères non numériques au fil de la saisie (espaces compris) : empêche
  // qu'un espace se retrouve dans la valeur enregistrée, y compris via un collage.
  const sanitizePhone = useCallback((value: string): string => cleanPhone(value), [])

  const formatPhone = useCallback((value: string): string => {
    if (!value) return value
    const cleaned = cleanPhone(value)
    const withoutIndicatif = cleaned.startsWith('221') ? cleaned.substring(3) : cleaned
    return withoutIndicatif.substring(0, 9)
  }, [])

  const validateField = useCallback((name: string, value: any, options?: { matriculeRequis?: boolean }): string | undefined => {
    switch (name) {
      case 'civilite':
        if (!value) return 'La civilité est obligatoire'
        break

      case 'firstname': {
        const v = (value ?? '').toString().trim()
        if (!v) return 'Le prénom est obligatoire'
        if (v.length < 2) return 'Le prénom doit contenir au moins 2 caractères'
        if (!NAME_REGEX.test(v)) return 'Le prénom ne doit contenir que des lettres'
        break
      }

      case 'lastname': {
        const v = (value ?? '').toString().trim()
        if (!v) return 'Le nom est obligatoire'
        if (v.length < 2) return 'Le nom doit contenir au moins 2 caractères'
        if (!NAME_REGEX.test(v)) return 'Le nom ne doit contenir que des lettres'
        break
      }

      case 'phone': {
        const v = (value ?? '').toString().trim()
        if (!v) return 'Le téléphone est obligatoire'
        // On valide la valeur telle quelle (pas nettoyée) : un espace ou tout autre caractère
        // non numérique doit bloquer la validation, pas être ignoré silencieusement.
        if (!/^\d+$/.test(v)) {
          return 'Le téléphone ne doit contenir que des chiffres, sans espace'
        }
        if (!PHONE_REGEX.test(v)) {
          return 'Numéro invalide. Doit commencer par 77, 76, 70, 78, 33, 75 ou 71 et avoir 9 chiffres'
        }
        break
      }

      case 'email': {
        const v = (value ?? '').toString().trim()
        if (!v) return "L'email est obligatoire"
        if (!EMAIL_REGEX.test(v)) return "L'email n'est pas valide"
        break
      }

      case 'matricule': {
        const v = (value ?? '').toString().trim()
        if (!v) {
          if (options?.matriculeRequis) return 'Le matricule est obligatoire'
          break
        }
        if (v.length < 3) return 'Le matricule doit contenir au moins 3 caractères'
        break
      }

      default:
        break
    }
    return undefined
  }, [])

  return { sanitizePhone, formatPhone, validateField }
}
