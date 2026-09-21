import { useCallback } from 'react'

export interface BankFields {
  code_bank?: string
  code_agc?: string
  num_compte?: string
  key_rib?: string
}

export interface BankFieldsErrors {
  code_bank?: string
  code_agc?: string
  num_compte?: string
  key_rib?: string
}

// Validation du format RIB sénégalais (code banque, code agence, n° compte, clé RIB), inspirée
// de useExaminateurValidation (projet enrolement_acteur) — ici tous les champs restent
// optionnels : seul le format est vérifié quand un champ est renseigné.
export function useBankValidation() {
  const formatCodeBanque = useCallback((value: string): string => {
    if (!value) return value
    let formatted = value.toUpperCase()
    if (formatted.startsWith('SN') && formatted.length > 2) {
      formatted = 'SN' + formatted.substring(2).replace(/\D/g, '').substring(0, 3)
    } else if (formatted.length > 0 && !formatted.startsWith('SN')) {
      formatted = 'SN' + formatted.replace(/\D/g, '').substring(0, 3)
    }
    return formatted
  }, [])

  const validateBankFields = useCallback((fields: BankFields): BankFieldsErrors => {
    const errors: BankFieldsErrors = {}
    if (fields.code_bank && !/^SN\d{3}$/.test(fields.code_bank.toUpperCase())) {
      errors.code_bank = 'Format attendu : SN suivi de 3 chiffres (ex: SN123)'
    }
    if (fields.code_agc && !/^\d{5}$/.test(fields.code_agc)) {
      errors.code_agc = 'Le code agence doit contenir exactement 5 chiffres'
    }
    if (fields.num_compte && !/^\d{12}$/.test(fields.num_compte)) {
      errors.num_compte = 'Le numéro de compte doit contenir exactement 12 chiffres'
    }
    if (fields.key_rib && !/^\d{2}$/.test(fields.key_rib)) {
      errors.key_rib = 'La clé RIB doit contenir exactement 2 chiffres'
    }
    return errors
  }, [])

  return { formatCodeBanque, validateBankFields }
}
