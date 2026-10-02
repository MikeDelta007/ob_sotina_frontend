'use client'

interface Props { count: number }

// Même style que le badge du menu latéral (cf. AppMenuitem) — petit cercle rouge avec le
// nombre d'éléments en attente, réutilisé sur les onglets "À valider" pour que le compte soit
// visible sans avoir à rouvrir le menu.
export default function OngletBadge({ count }: Props) {
  if (!count) return null
  return (
    <span className="tw-ml-2 tw-inline-flex tw-h-5 tw-min-w-[1.25rem] tw-items-center tw-justify-center tw-rounded-full tw-bg-red-600 tw-px-1 tw-text-xs tw-font-semibold tw-text-white">
      {count}
    </span>
  )
}
