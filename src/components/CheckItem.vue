<script setup lang="ts">
import { computed } from "vue";
import { DsfrButton, DsfrInput } from "@gouvminint/vue-dsfr";
import { STATUS_OPTIONS } from "@/constants/status.ts";
import { useAuditStore } from "@/stores/audit.ts";
import type { Test, ConformityStatus } from "@/types/check.ts";

const props = defineProps<{
  pageId: string;
  test: Test;
}>();

const store = useAuditStore();

const result = computed(
  () => store.getPage(props.pageId)?.results[props.test.id],
);

function selectStatus(status: ConformityStatus): void {
  store.setStatus(props.pageId, props.test.id, status);
}

function onComment(value: string | number | undefined): void {
  store.setComment(props.pageId, props.test.id, String(value ?? ""));
}
</script>

<template>
  <li class="ec-check-item" :data-status="result?.status">
    <div class="ec-check-header">
      <h3 class="fr-h6 fr-mb-0">{{ test.title }}</h3>
      <ul
        class="ec-status-group"
        role="group"
        :aria-label="`Statut pour : ${test.title}`"
      >
        <li
          v-for="option in STATUS_OPTIONS"
          :key="option.value"
          class="ec-status-item"
        >
          <DsfrButton
            :key="option.value"
            type="button"
            :label="option.short"
            size="lg"
            tertiary
            class="ec-status-btn"
            :class="{
              'ec-status-btn--active': result?.status === option.value,
            }"
            :style="{ '--btn-color': option.color }"
            :aria-pressed="result?.status === option.value"
            @click="selectStatus(option.value)"
          />
        </li>
      </ul>
    </div>
    <DsfrInput
      :id="`comment-${test.id}-${pageId}`"
      label="Commentaire"
      hint="Décrivez le problème constaté ou justifiez votre évaluation"
      placeholder="Commentaire (optionnel)…"
      :model-value="result?.comment ?? ''"
      is-textarea
      wrapper-class="ec-check-comment"
      @update:model-value="onComment"
    />
  </li>
</template>
