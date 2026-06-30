<script setup lang="ts">
import { computed } from "vue";
import { DsfrBadge, DsfrBreadcrumb } from "@gouvminint/vue-dsfr";
import type { DsfrBadgeProps } from "@gouvminint/vue-dsfr";
import { STATUS_OPTIONS } from "@/constants/status.ts";
import { useAuditStore } from "@/stores/audit.ts";
import type { ConformityStatus } from "@/types/check.ts";

const store = useAuditStore();

const STATUS_BADGE_TYPE: Record<ConformityStatus, DsfrBadgeProps["type"]> = {
  NT: undefined,
  C: "success",
  NC: "error",
  NA: undefined,
};

const STATUS_BADGE_EXTRA_CLASS: Record<ConformityStatus, string> = {
  NT: "ec-badge--nt",
  C: "",
  NC: "",
  NA: "ec-badge--na",
};

function getStatusBadgeType(status: ConformityStatus): DsfrBadgeProps["type"] {
  return STATUS_BADGE_TYPE[status];
}

function getStatusBadgeExtraClass(status: ConformityStatus): string {
  return STATUS_BADGE_EXTRA_CLASS[status];
}

const breadcrumbLinks = [{ text: "Accueil", to: "/" }, { text: "Synthèse" }];
const totals = computed(() => {
  const acc: Record<ConformityStatus, number> = { NT: 0, C: 0, NC: 0, NA: 0 };
  for (const page of store.pages) {
    const stats = store.getPageStats(page.id);
    for (const option of STATUS_OPTIONS) {
      acc[option.value] += stats[option.value];
    }
  }
  return acc;
});

/** Taux de conformité (C / (C + NC)) en ignorant NT et NA. */
const conformityRate = computed(() => {
  const { C, NC } = totals.value;
  const tested = C + NC;
  return tested === 0 ? null : Math.round((C / tested) * 100);
});

/** Critères non conformes regroupés par page (points bloquants). */
const blockingByPage = computed(() =>
  store.pages.map((page) => ({
    page,
    issues: store.allTests.filter(
      (test) => page.results[test.id]?.status === "NC",
    ),
  })),
);
</script>

<template>
  <div class="fr-container fr-py-4w">
    <!-- Fil d'Ariane -->
    <DsfrBreadcrumb class="fr-mb-3w" :links="breadcrumbLinks" />

    <div class="fr-mb-4w">
      <h1 class="fr-h1 fr-mb-1w">Synthèse</h1>
      <p v-if="store.meta.site" class="fr-text--lead">
        {{ store.meta.site }} · {{ store.meta.date }}
      </p>
    </div>

    <!-- Aucune page -->
    <div v-if="!store.pages.length" class="fr-alert fr-alert--info">
      <p>Aucune page auditée pour le moment.</p>
    </div>

    <template v-else>
      <!-- ── Score global ─────────────────────────────── -->
      <div class="fr-callout fr-mb-4w ec-score-callout">
        <div class="ec-score-main">
          <span class="ec-score-value">
            {{ conformityRate === null ? "—" : `${conformityRate} %` }}
          </span>
          <p class="fr-callout__text fr-mb-2w">
            Taux de conformité (C&nbsp;/&nbsp;C+NC)
          </p>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
          <DsfrBadge
            v-for="option in STATUS_OPTIONS"
            :key="option.value"
            :label="`${option.label}\u00a0: ${totals[option.value]}`"
            :type="getStatusBadgeType(option.value)"
            :class="getStatusBadgeExtraClass(option.value)"
            no-icon
          />
        </div>
      </div>

      <!-- ── Détail par page ──────────────────────────── -->
      <div class="fr-table fr-mb-4w">
        <table>
          <caption>
            Détail par page
          </caption>
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
                  class="fr-link"
                >
                  {{ page.title }}
                </RouterLink>
              </th>
              <td v-for="option in STATUS_OPTIONS" :key="option.value">
                {{ store.getPageStats(page.id)[option.value] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Points bloquants ─────────────────────────── -->
      <div class="fr-card">
        <div class="fr-card__body">
          <div class="fr-card__content">
            <h2 class="fr-h4 fr-mb-3w">Points bloquants (non conformes)</h2>

            <template v-for="entry in blockingByPage" :key="entry.page.id">
              <div
                v-if="entry.issues.length"
                class="ec-blocking-group fr-mb-3w"
              >
                <h3 class="fr-h6">{{ entry.page.title }}</h3>
                <ul class="ec-blocking-list">
                  <li v-for="test in entry.issues" :key="test.id">
                    {{ test.title }}
                    <em
                      v-if="entry.page.results[test.id].comment"
                      class="fr-text--sm"
                    >
                      ({{ entry.page.results[test.id].comment }})
                    </em>
                  </li>
                </ul>
              </div>
            </template>

            <div
              v-if="blockingByPage.every((e) => !e.issues.length)"
              class="fr-alert fr-alert--success"
            >
              <p>Aucun point bloquant détecté.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
