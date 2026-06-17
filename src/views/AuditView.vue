<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { DsfrBreadcrumb } from '@gouvminint/vue-dsfr'
import CheckItem from '@/components/CheckItem.vue'
import { getStatusOption } from '@/constants/status.ts'
import { useAuditStore } from '@/stores/audit.ts'
import type { Criterion, ConformityStatus } from '@/types/check.ts'

const props = defineProps<{ pageId: string }>()

const store = useAuditStore()
const router = useRouter()

const page = computed(() => store.getPage(props.pageId))
const stats = computed(() => store.getPageStats(props.pageId))

const progress = computed(() => {
  const total = store.totalTests
  if (!total) return 0
  return Math.round(((total - stats.value.NT) / total) * 100)
})

const STATUS_BADGE_CLASS: Record<ConformityStatus, string> = {
  NT: 'ec-badge--nt fr-badge--no-icon',
  C: 'fr-badge--success fr-badge--no-icon',
  NC: 'fr-badge--error fr-badge--no-icon',
  NA: 'ec-badge--na fr-badge--no-icon',
}

function getStatusBadgeClass(status: ConformityStatus): string {
  return STATUS_BADGE_CLASS[status]
}

const breadcrumbLinks = computed(() => [
  { text: 'Accueil', to: '/' },
  { text: page.value?.title ?? '' },
])

function getCriterionStatus(criterion: Criterion): ConformityStatus {
  const results = criterion.tests.map(
    (test) => page.value?.results[test.id]?.status ?? 'NT',
  )
  if (results.some((s) => s === 'NC')) return 'NC'
  if (results.some((s) => s === 'NT')) return 'NT'
  return 'C'
}

function goHome(): void {
  router.push({ name: 'home' })
}
</script>

<template>
  <div v-if="page" class="fr-container fr-py-4w">

    <!-- Fil d'Ariane -->
    <DsfrBreadcrumb class="fr-mb-3w" :links="breadcrumbLinks" />

    <!-- En-tête de page -->
    <div class="fr-mb-4w">
      <h1 class="fr-h1 fr-mb-1w">Évaluation de la page : {{ page.title }}</h1>
      <p>
        <a :href="page.url" target="_blank" rel="noopener" class="fr-link">
          {{ page.url }}
        </a>
      </p>
    </div>

    <!-- Barre de progression -->
    <label for="progress" class="fr-progress-label">Progression de l'évaluation : {{ progress }}&nbsp;% évalué</label>
    <progress id="progress" class="fr-progress fr-mb-2w" max="100" :value="progress">{{ progress }}&nbsp;% évalué</progress>
    <!-- Badges de statut -->
    <div class="fr-mb-4w" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
      <span
        v-for="(count, status) in stats"
        :key="status"
        class="fr-badge"
        :class="getStatusBadgeClass(status as ConformityStatus)"
      >
        {{ getStatusOption(status as ConformityStatus).label }}&nbsp;: {{ count }}
      </span>
    </div>

    <!-- Critères (sections) et leurs tests (sous-sections) -->
    <section
      v-for="criterion in store.checksByCategory"
      :key="criterion.id"
      class="fr-mb-4w"
    >
      <h2 class="fr-h5 ec-category-title">
        {{ criterion.title }}
        <span
          class="fr-badge fr-badge--sm fr-ml-1w"
          :class="getStatusBadgeClass(getCriterionStatus(criterion))"
        >
          {{ getStatusOption(getCriterionStatus(criterion)).short }}
        </span>
      </h2>
      <ul class="ec-check-list">
        <CheckItem
          v-for="test in criterion.tests"
          :key="test.id"
          :page-id="pageId"
          :test="test"
        />
      </ul>
    </section>

    <!-- Pied de vue -->
    <div class="fr-mt-4w">
      <RouterLink
        :to="{ name: 'summary' }"
        class="fr-btn fr-icon-arrow-right-line fr-btn--icon-right"
      >
        Voir la synthèse
      </RouterLink>
    </div>

  </div>

  <!-- Page introuvable -->
  <div v-else class="fr-container fr-py-6w">
    <div class="fr-alert fr-alert--error fr-mb-3w">
      <h3 class="fr-alert__title">Page introuvable</h3>
      <p>Cette page n'existe pas dans l'échantillon d'audit.</p>
    </div>
    <button type="button" class="fr-btn" @click="goHome">
      Retour à l'échantillon
    </button>
  </div>
</template>

