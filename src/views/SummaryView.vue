<script setup lang="ts">
import { computed } from 'vue'
import { getStatusOption, STATUS_OPTIONS } from '@/constants/status.ts'
import { useAuditStore } from '@/stores/audit.ts'
import type { ConformityStatus } from '@/types/check.ts'

const store = useAuditStore()

/** Totaux consolidés sur l'ensemble des pages. */
const totals = computed(() => {
  const acc: Record<ConformityStatus, number> = { NT: 0, C: 0, NC: 0, NA: 0 }
  for (const page of store.pages) {
    const stats = store.getPageStats(page.id)
    for (const option of STATUS_OPTIONS) {
      acc[option.value] += stats[option.value]
    }
  }
  return acc
})

/** Taux de conformité (C / (C + NC)) en ignorant NT et NA. */
const conformityRate = computed(() => {
  const { C, NC } = totals.value
  const tested = C + NC
  return tested === 0 ? null : Math.round((C / tested) * 100)
})

/** Critères non conformes regroupés par page (points bloquants). */
const blockingByPage = computed(() =>
  store.pages.map((page) => ({
    page,
    issues: store.checks.filter(
      (check) => page.results[check.id]?.status === 'NC',
    ),
  })),
)
</script>

<template>
  <div class="view">
    <header class="view-header">
      <RouterLink :to="{ name: 'home' }" class="btn-back">← Échantillon</RouterLink>
      <h1>Synthèse</h1>
      <p v-if="store.meta.site" class="subtitle">
        {{ store.meta.site }} · {{ store.meta.date }}
      </p>
    </header>

    <p v-if="!store.pages.length" class="empty-state">
      Aucune page auditée pour le moment.
    </p>

    <template v-else>
      <section class="card score-card">
        <div class="score-main">
          <span class="score-value">
            {{ conformityRate === null ? '—' : `${conformityRate}%` }}
          </span>
          <span class="score-label">Taux de conformité</span>
        </div>
        <div class="totals-row">
          <span
            v-for="option in STATUS_OPTIONS"
            :key="option.value"
            class="stat-chip"
            :style="{ '--chip-color': option.color }"
          >
            {{ option.label }} : <strong>{{ totals[option.value] }}</strong>
          </span>
        </div>
      </section>

      <section class="card">
        <h2>Détail par page</h2>
        <table class="summary-table">
          <thead>
            <tr>
              <th scope="col">Page</th>
              <th
                v-for="option in STATUS_OPTIONS"
                :key="option.value"
                scope="col"
              >
                {{ option.short }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="page in store.pages" :key="page.id">
              <th scope="row">
                <RouterLink
                  :to="{ name: 'audit', params: { pageId: page.id } }"
                >
                  {{ page.title }}
                </RouterLink>
              </th>
              <td
                v-for="option in STATUS_OPTIONS"
                :key="option.value"
              >
                {{ store.getPageStats(page.id)[option.value] }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="card">
        <h2>Points bloquants (non conformes)</h2>
        <template v-for="entry in blockingByPage" :key="entry.page.id">
          <div v-if="entry.issues.length" class="blocking-group">
            <h3>{{ entry.page.title }}</h3>
            <ul class="blocking-list">
              <li
                v-for="check in entry.issues"
                :key="check.id"
                :style="{ '--chip-color': getStatusOption('NC').color }"
              >
                <strong>{{ check.category }}</strong> — {{ check.title }}
                <em v-if="entry.page.results[check.id].comment">
                  ({{ entry.page.results[check.id].comment }})
                </em>
              </li>
            </ul>
          </div>
        </template>
        <p
          v-if="blockingByPage.every((e) => !e.issues.length)"
          class="no-issues"
        >
          ✅ Aucun point bloquant détecté.
        </p>
      </section>
    </template>
  </div>
</template>

