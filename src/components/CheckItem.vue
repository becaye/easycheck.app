<script setup lang="ts">
import { computed } from 'vue'
import { STATUS_OPTIONS } from '@/constants/status.ts'
import { useAuditStore } from '@/stores/audit.ts'
import type { Check, ConformityStatus } from '@/types/check.ts'

const props = defineProps<{
  pageId: string
  check: Check
}>()

const store = useAuditStore()

const result = computed(
  () => store.getPage(props.pageId)?.results[props.check.id],
)

function selectStatus(status: ConformityStatus): void {
  store.setStatus(props.pageId, props.check.id, status)
}

function onComment(event: Event): void {
  const target = event.target as HTMLTextAreaElement
  store.setComment(props.pageId, props.check.id, target.value)
}
</script>

<template>
  <li class="check-item" :data-status="result?.status">
    <div class="check-header">
      <p class="check-title">{{ check.title }}</p>
      <div
        class="status-group"
        role="group"
        :aria-label="`Statut pour : ${check.title}`"
      >
        <button
          v-for="option in STATUS_OPTIONS"
          :key="option.value"
          type="button"
          class="status-btn"
          :class="{ active: result?.status === option.value }"
          :style="{ '--btn-color': option.color }"
          :aria-pressed="result?.status === option.value"
          @click="selectStatus(option.value)"
        >
          {{ option.short }}
        </button>
      </div>
    </div>
    <textarea
      class="check-comment"
      rows="1"
      placeholder="Commentaire (optionnel)…"
      :value="result?.comment"
      @input="onComment"
    ></textarea>
  </li>
</template>

