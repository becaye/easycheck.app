// Types métier de l'application Easy Checks.

/** Statut de conformité d'un test pour une page donnée. */
export type ConformityStatus = "NT" | "C" | "NC" | "NA";

/** Un test à effectuer pour valider un critère (sous-section). */
export interface Test {
  id: string;
  title: string;
  notes: string;
}

/** Un critère d'accessibilité (section), regroupant plusieurs tests. */
export interface Criterion {
  id: string;
  title: string;
  tests: Test[];
}

/** Résultat d'évaluation d'un test pour une page. */
export interface CheckResult {
  status: ConformityStatus;
  comment: string;
}

/** Page auditée (issue de l'onglet "Échantillon"). */
export interface AuditPage {
  id: string;
  title: string;
  url: string;
  /** Résultats indexés par identifiant de test. */
  results: Record<string, CheckResult>;
}

/** Métadonnées générales de l'audit. */
export interface AuditMeta {
  site: string;
  auditor: string;
  context: string;
  date: string;
}
