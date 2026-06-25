import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import rawChecks from '@/data/checks.json'
import type {
  AuditMeta,
  AuditPage,
  Criterion,
  CheckResult,
  ConformityStatus,
  Test,
} from '@/types/check.ts'

const STORAGE_KEY = 'easychecks:audit'

/** Transforme la liste plate en critères hiérarchiques (groupés par category). */
function buildCriteria(): Criterion[] {
  const map = new Map<string, { id: string; title: string; tests: Test[] }>()
  for (const item of rawChecks) {
    let criterion = map.get(item.category)
    if (!criterion) {
      criterion = {
        id: `CAT-${map.size + 1}`,
        title: item.category,
        tests: [],
      }
      map.set(item.category, criterion)
    }
    criterion.tests.push({ id: item.id, title: item.title, notes: item.notes })
  }
  return Array.from(map.values())
}

/** Référentiel des critères chargé depuis le JSON. */
const criteria = buildCriteria()

/** Liste à plat de tous les tests (pour la progression et les stats). */
const allTests: Test[] = criteria.flatMap((c) => c.tests)

/** Crée un jeu de résultats vierges (tous "Non testé") pour une nouvelle page. */
function createEmptyResults(): Record<string, CheckResult> {
  const results: Record<string, CheckResult> = {}
  for (const test of allTests) {
    results[test.id] = { status: 'NT', comment: '' }
  }
  return results
}

/** Génère un identifiant de page séquentiel (P01, P02, ...). */
function nextPageId(pages: AuditPage[]): string {
  const num = pages.length + 1
  return `P${String(num).padStart(2, '0')}`
}

export interface PersistedState {
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

  /** Liste des critères avec leurs tests (structure hiérarchique). */
  const checksByCategory = computed(() => criteria)

  /** Nombre total de tests dans le référentiel. */
  const totalTests = allTests.length

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

  /** Restaure un état complet (import). */
  function restore(state: PersistedState): void {
    meta.value = state.meta
    pages.value = state.pages
  }

  return {
    meta,
    pages,
    criteria,
    allTests,
    totalTests,
    checksByCategory,
    addPage,
    removePage,
    getPage,
    setStatus,
    setComment,
    getPageStats,
    reset,
    restore,
  }
})

