import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import checksData from '@/data/checks.json'
import type {
  AuditMeta,
  AuditPage,
  Check,
  CheckResult,
  ConformityStatus,
} from '@/types/check.ts'

const STORAGE_KEY = 'easychecks:audit'

/** Référentiel des critères chargé depuis le JSON généré par convert-xlsx. */
const checks = checksData as Check[]

/** Crée un jeu de résultats vierges (tous "Non testé") pour une nouvelle page. */
function createEmptyResults(): Record<string, CheckResult> {
  const results: Record<string, CheckResult> = {}
  for (const check of checks) {
    results[check.id] = { status: 'NT', comment: '' }
  }
  return results
}

/** Génère un identifiant de page séquentiel (P01, P02, ...). */
function nextPageId(pages: AuditPage[]): string {
  const num = pages.length + 1
  return `P${String(num).padStart(2, '0')}`
}

interface PersistedState {
  meta: AuditMeta
  pages: AuditPage[]
}

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistedState) : null
  } catch {
    return null
  }
}

export const useAuditStore = defineStore('audit', () => {
  const persisted = loadState()

  const meta = ref<AuditMeta>(
    persisted?.meta ?? {
      site: '',
      auditor: '',
      context: '',
      date: new Date().toISOString().slice(0, 10),
    },
  )

  const pages = ref<AuditPage[]>(persisted?.pages ?? [])

  // Persistance automatique dans le localStorage.
  watch(
    [meta, pages],
    ([metaValue, pagesValue]) => {
      const state: PersistedState = { meta: metaValue, pages: pagesValue }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    { deep: true },
  )

  /** Liste des critères groupés par catégorie. */
  const checksByCategory = computed(() => {
    const groups = new Map<string, Check[]>()
    for (const check of checks) {
      const list = groups.get(check.category) ?? []
      list.push(check)
      groups.set(check.category, list)
    }
    return Array.from(groups, ([category, items]) => ({ category, items }))
  })

  /** Ajoute une page à l'échantillon et retourne son identifiant. */
  function addPage(title: string, url: string): string {
    const id = nextPageId(pages.value)
    pages.value.push({ id, title, url, results: createEmptyResults() })
    return id
  }

  /** Supprime une page de l'échantillon. */
  function removePage(id: string): void {
    pages.value = pages.value.filter((page) => page.id !== id)
  }

  /** Retrouve une page par son identifiant. */
  function getPage(id: string): AuditPage | undefined {
    return pages.value.find((page) => page.id === id)
  }

  /** Met à jour le statut d'un critère pour une page. */
  function setStatus(pageId: string, checkId: string, status: ConformityStatus): void {
    const page = getPage(pageId)
    if (page?.results[checkId]) {
      page.results[checkId].status = status
    }
  }

  /** Met à jour le commentaire d'un critère pour une page. */
  function setComment(pageId: string, checkId: string, comment: string): void {
    const page = getPage(pageId)
    if (page?.results[checkId]) {
      page.results[checkId].comment = comment
    }
  }

  /** Calcule la répartition des statuts pour une page. */
  function getPageStats(pageId: string): Record<ConformityStatus, number> {
    const stats: Record<ConformityStatus, number> = { NT: 0, C: 0, NC: 0, NA: 0 }
    const page = getPage(pageId)
    if (!page) return stats
    for (const result of Object.values(page.results)) {
      stats[result.status] += 1
    }
    return stats
  }

  /** Réinitialise complètement l'audit. */
  function reset(): void {
    meta.value = {
      site: '',
      auditor: '',
      context: '',
      date: new Date().toISOString().slice(0, 10),
    }
    pages.value = []
  }

  return {
    meta,
    pages,
    checks,
    checksByCategory,
    addPage,
    removePage,
    getPage,
    setStatus,
    setComment,
    getPageStats,
    reset,
  }
})

