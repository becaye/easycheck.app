<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import CheckItem from '@/components/CheckItem.vue'
import { getStatusOption } from '@/constants/status.ts'
import { useAuditStore } from '@/stores/audit.ts'

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

function goHome(): void {
  router.push({ name: 'home' })
}
</script>

<template>
  <div v-if="page" class="view">
    <header class="view-header">
      <button type="button" class="btn-back" @click="goHome">← Échantillon</button>
      <h1>{{ page.title }}</h1>
      <p class="subtitle">
        <a :href="page.url" target="_blank" rel="noopener">{{ page.url }}</a>
      </p>
    </header>

    <div class="progress-bar" :aria-label="`Progression : ${progress}%`">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      <span class="progress-label">{{ progress }}% évalué</span>
    </div>

    <div class="stats-row">
      <span
        v-for="(count, status) in stats"
        :key="status"
        class="stat-chip"
        :style="{ '--chip-color': getStatusOption(status).color }"
      >
        {{ getStatusOption(status).label }} : <strong>{{ count }}</strong>
      </span>
    </div>

    <section
      v-for="group in store.checksByCategory"
      :key="group.category"
      class="category"
    >
      <h2 class="category-title">{{ group.category }}</h2>
      <ul class="check-list">
        <CheckItem
          v-for="check in group.items"
          :key="check.id"
          :page-id="pageId"
          :check="check"
        />
      </ul>
    </section>

    <footer class="view-footer">
      <RouterLink :to="{ name: 'summary' }" class="btn-primary">
        Voir la synthèse →
      </RouterLink>
    </footer>
  </div>

  <div v-else class="view empty-state">
    <p>Page introuvable.</p>
    <button type="button" class="btn-primary" @click="goHome">
      Retour à l’échantillon
    </button>
  </div>
</template>

