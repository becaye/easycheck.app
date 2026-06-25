import { ref } from 'vue'
import { useAuditStore } from '@/stores/audit.ts'
import type { PersistedState } from '@/stores/audit.ts'

/** Télécharge un Blob sous forme de fichier. */
function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Échappe une cellule CSV (RFC 4180). */
function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

export function useImportExport() {
  const store = useAuditStore()
  const importError = ref<string | null>(null)

  // ── Export JSON ───────────────────────────────────────────────

  function exportJson(): void {
    const state: PersistedState = { meta: store.meta, pages: store.pages }
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    })
    const slug = store.meta.site || 'easychecks'
    download(blob, `audit-${slug}-${today()}.json`)
  }

  // ── Export CSV ────────────────────────────────────────────────
  // Format : Page ID ; Page Titre ; URL ; Critère ID ; Critère ;
  //          Test ID ; Test ; Statut ; Commentaire
  // Séparateur « ; » + BOM UTF-8 pour Excel/Calc

  function exportCsv(): void {
    const headers = [
      'Page ID', 'Page Titre', 'URL',
      'Critère ID', 'Critère',
      'Test ID', 'Test',
      'Statut', 'Commentaire',
    ]

    const rows: string[] = [headers.map(csvCell).join(';')]

    for (const page of store.pages) {
      for (const criterion of store.criteria) {
        for (const test of criterion.tests) {
          const result = page.results[test.id]
          rows.push([
            page.id,
            page.title,
            page.url,
            criterion.id,
            criterion.title,
            test.id,
            test.title,
            result?.status ?? 'NT',
            result?.comment ?? '',
          ].map(csvCell).join(';'))
        }
      }
    }

    // BOM pour une ouverture correcte dans Excel
    const blob = new Blob(['\uFEFF' + rows.join('\n')], {
      type: 'text/csv;charset=utf-8',
    })
    const slug = store.meta.site || 'easychecks'
    download(blob, `audit-${slug}-${today()}.csv`)
  }

  // ── Import JSON ───────────────────────────────────────────────

  async function importJson(file: File): Promise<void> {
    importError.value = null
    try {
      const text = await file.text()
      const parsed: unknown = JSON.parse(text)

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('meta' in parsed) ||
        !('pages' in parsed) ||
        !Array.isArray((parsed as PersistedState).pages)
      ) {
        importError.value = 'Fichier invalide : structure JSON non reconnue.'
        return
      }

      store.restore(parsed as PersistedState)
    } catch {
      importError.value = 'Impossible de lire le fichier. Vérifiez qu\'il s\'agit d\'un JSON valide.'
    }
  }

  return { exportJson, exportCsv, importJson, importError }
}


