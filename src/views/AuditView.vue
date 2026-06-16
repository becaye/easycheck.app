<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import CheckItem from '@/components/CheckItem.vue'
import { getStatusOption } from '@/constants/status.ts'
import { useAuditStore } from '@/stores/audit.ts'
import type { ConformityStatus } from '@/types/check.ts'

const props = defineProps<{ pageId: string }>()

const store = useAuditStore()
const router = useRouter()

const page = computed(() => store.getPage(props.pageId))
const stats = computed(() => store.getPageStats(props.pageId))

const progress = computed(() => {
  const total = store.checks.length
  if (!total) return 0
  return Math.round(((total - stats.value.NT) / total) * 100)
})

const STATUS_BADGE_CLASS: Record<ConformityStatus, string> = {
  NT: 'fr-badge--new fr-badge--no-icon',
  C: 'fr-badge--success fr-badge--no-icon',
  NC: 'fr-badge--error fr-badge--no-icon',
  NA: 'fr-badge--warning fr-badge--no-icon',
}

function getStatusBadgeClass(status: ConformityStatus): string {
  return STATUS_BADGE_CLASS[status]
}

function goHome(): void {
  router.push({ name: 'home' })
}
</script>

<template>
  <div v-if="page" class="fr-container fr-py-4w">

    <!-- Fil d'Ariane -->
    <nav role="navigation" class="fr-breadcrumb fr-mb-3w" aria-label="vous êtes ici :">
      <ol class="fr-breadcrumb__list">
        <li>
          <RouterLink to="/" class="fr-breadcrumb__link">Accueil</RouterLink>
        </li>
        <li>
          <a class="fr-breadcrumb__link" aria-current="page">{{ page.title }}</a>
        </li>
      </ol>
    </nav>

    <!-- En-tête de page -->
    <div class="fr-mb-4w">
      <h1 class="fr-h1 fr-mb-1w">{{ page.title }}</h1>
      <p>
        <a :href="page.url" target="_blank" rel="noopener" class="fr-link">
          {{ page.url }}
        </a>
      </p>
    </div>

    <!-- Barre de progression -->
    <div
      class="ec-progress fr-mb-2w"
      role="progressbar"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`Progression : ${progress}%`"
    >
      <div class="ec-progress__fill" :style="{ width: `${progress}%` }"></div>
      <span class="ec-progress__label">{{ progress }}&nbsp;% évalué</span>
    </div>

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

    <!-- Critères par catégorie -->
    <section
      v-for="group in store.checksByCategory"
      :key="group.category"
      class="fr-mb-4w"
    >
      <h2 class="fr-h5 ec-category-title">{{ group.category }}</h2>
      <ul class="ec-check-list">
        <CheckItem
          v-for="check in group.items"
          :key="check.id"
          :page-id="pageId"
          :check="check"
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

