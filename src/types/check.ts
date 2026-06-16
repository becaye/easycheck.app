// Types métier de l'application Easy Checks.

/** Statut de conformité d'un critère pour une page donnée. */
export type ConformityStatus = 'NT' | 'C' | 'NC' | 'NA'

/** Un critère du référentiel (issu de l'onglet "criteres" de la grille). */
export interface Check {
  id: string
  category: string
  title: string
  defaultConformity: string
  notes: string
}

/** Résultat d'évaluation d'un critère pour une page. */
export interface CheckResult {
  status: ConformityStatus
  comment: string
}

/** Page auditée (issue de l'onglet "Échantillon"). */
export interface AuditPage {
  id: string
  title: string
  url: string
  /** Résultats indexés par identifiant de critère. */
  results: Record<string, CheckResult>
}

/** Métadonnées générales de l'audit. */
export interface AuditMeta {
  site: string
  auditor: string
  context: string
  date: string
}

