import type { User } from '@/app/userContext'

// Rôle principal + rôles supplémentaires du compte (un même agent peut cumuler plusieurs rôles).
export const rolesDe = (user: User | null | undefined): string[] => {
  const principal = user?.profil?.name
  return [...(principal ? [principal] : []), ...(user?.droitsSupplementaires ?? [])]
}

export const aUnDesRoles = (user: User | null | undefined, roles: string[]): boolean =>
  rolesDe(user).some(r => roles.includes(r))
