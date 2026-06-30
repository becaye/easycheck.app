import type { ConformityStatus } from "@/types/check.ts";

/** Libellés et couleurs associés à chaque statut de conformité. */
export interface StatusOption {
  value: ConformityStatus;
  label: string;
  short: string;
  color: string;
}

export const STATUS_OPTIONS: readonly StatusOption[] = [
  { value: "NT", label: "Non testé", short: "NT", color: "var(--status-nt)" },
  { value: "C", label: "Conforme", short: "C", color: "var(--status-c)" },
  {
    value: "NC",
    label: "Non conforme",
    short: "NC",
    color: "var(--status-nc)",
  },
  {
    value: "NA",
    label: "Non applicable",
    short: "NA",
    color: "var(--status-na)",
  },
] as const;

/** Retrouve l'option d'affichage correspondant à un statut. */
export function getStatusOption(status: ConformityStatus): StatusOption {
  return (
    STATUS_OPTIONS.find((option) => option.value === status) ??
    STATUS_OPTIONS[0]
  );
}
