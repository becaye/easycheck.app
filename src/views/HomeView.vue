<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  DsfrBadge,
  DsfrButton,
  DsfrInput,
  DsfrTable,
} from "@gouvminint/vue-dsfr";
import { useAuditStore } from "@/stores/audit.ts";
import { useImportExport } from "@/composables/useImportExport.ts";
import type { AuditMeta } from "@/types/check.ts";

const store = useAuditStore();
const router = useRouter();
const { exportJson, exportCsv, importJson, importError } = useImportExport();

const form = reactive({ title: "", url: "" });
const fileInputRef = ref<HTMLInputElement | null>(null);

function setMeta(
  key: keyof AuditMeta,
  value: string | number | undefined,
): void {
  store.meta[key] = String(value ?? "");
}

function setForm(
  key: keyof typeof form,
  value: string | number | undefined,
): void {
  form[key] = String(value ?? "");
}

function addPage(): void {
  const title = form.title.trim();
  const url = form.url.trim();
  if (!url) return;
  store.addPage(title || url, url);
  form.title = "";
  form.url = "";
}

function auditPage(id: string): void {
  router.push({ name: "audit", params: { pageId: id } });
}

function isPageComplete(id: string): boolean {
  return store.getPageStats(id).NT === 0;
}

function confirmReset(): void {
  if (confirm("Réinitialiser tout l'audit ? Cette action est irréversible.")) {
    store.reset();
  }
}

function triggerImport(): void {
  fileInputRef.value?.click();
}

async function handleImport(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  await importJson(file);
  // Réinitialise l'input pour permettre de réimporter le même fichier
  (event.target as HTMLInputElement).value = "";
}
</script>

<template>
  <div class="fr-container fr-py-6w">
    <div class="fr-mb-4w">
      <h1 class="fr-h1">Évaluation accessibilité</h1>
      <p class="fr-text--lead">
        Évaluez vos pages selon les contrôles essentiels du W3C —
        <strong>{{ store.totalTests }} critères</strong>.
      </p>
    </div>

    <!-- ── Informations de l'audit ───────────────────── -->
    <div class="fr-card fr-mb-4w">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h2 class="fr-h4 fr-mb-3w">Informations de l'audit</h2>
          <div class="fr-grid-row fr-grid-row--gutters">
            <div class="fr-col-12 fr-col-md-6">
              <DsfrInput
                id="meta-site"
                label="Site"
                hint="Nom ou domaine du site audité (ex. : mon-site.gouv.fr)"
                label-visible
                placeholder="Nom du site"
                required
                :model-value="store.meta.site"
                @update:model-value="setMeta('site', $event)"
              />
            </div>
            <div class="fr-col-12 fr-col-md-6">
              <DsfrInput
                id="meta-auditor"
                label="Auditeur·rice"
                hint="Prénom et nom de la personne réalisant l'audit"
                label-visible
                placeholder="Votre nom"
                :model-value="store.meta.auditor"
                @update:model-value="setMeta('auditor', $event)"
              />
            </div>
            <div class="fr-col-12 fr-col-md-6">
              <DsfrInput
                id="meta-context"
                label="Contexte"
                hint="Sprint, version ou toute information utile (ex. : Sprint 12, v2.3.1)"
                label-visible
                placeholder="Sprint, version…"
                :model-value="store.meta.context"
                @update:model-value="setMeta('context', $event)"
              />
            </div>
            <div class="fr-col-12 fr-col-md-6">
              <DsfrInput
                id="meta-date"
                label="Date"
                hint="Date de réalisation de l'audit"
                label-visible
                type="date"
                :model-value="store.meta.date"
                @update:model-value="setMeta('date', $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Import / Export ──────────────────────────── -->
    <div class="fr-card fr-mb-4w">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h2 class="fr-h4 fr-mb-1w">Import / Export</h2>
          <p class="fr-text--sm fr-text--mention-grey fr-mb-3w">
            Sauvegardez ou restaurez les données de l'audit.
          </p>
          <ul
            class="fr-btns-group-sm fr-btns-group--inline fr-btns-group-text-icon--right"
          >
            <li>
              <DsfrButton
                type="button"
                label="Exporter au format JSON"
                secondary
                icon="fr-icon-download-line"
                @click="exportJson"
              />
            </li>
            <li>
              <DsfrButton
                type="button"
                label="Exporter au format CSV"
                secondary
                icon="fr-icon-file-line"
                @click="exportCsv"
              />
            </li>
            <li>
              <DsfrButton
                type="button"
                label="Importer un fichier JSON"
                tertiary
                icon="fr-icon-upload-line"
                @click="triggerImport"
              />
            </li>
          </ul>
          <input
            ref="fileInputRef"
            type="file"
            accept=".json,application/json"
            class="fr-sr-only"
            aria-hidden="true"
            tabindex="-1"
            @change="handleImport"
          />
          <div v-if="importError" class="fr-alert fr-alert--error fr-mt-2w">
            <p>{{ importError }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Ajouter une page ──────────────────────────── -->
    <div class="fr-card fr-mb-4w">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <div
            class="fr-grid-row fr-grid-row--gutters fr-justify-between fr-mb-3w"
          >
            <div class="fr-col-auto">
              <h2
                class="fr-h2"
                style="
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;
                  flex-wrap: wrap;
                "
              >
                Échantillon
                <DsfrBadge
                  v-if="store.pages.length"
                  :label="String(store.pages.length)"
                  type="info"
                  no-icon
                />
              </h2>
            </div>
            <div class="fr-col">
              <ul
                class="fr-btns-group fr-btns-group--right fr-btns-group--inline"
              >
                <li>
                  <RouterLink
                    :to="{ name: 'summary' }"
                    class="fr-icon-arrow-right-line fr-link--icon-right fr-text--md"
                  >
                    Voir la synthèse
                  </RouterLink>
                </li>
                <li>
                  <DsfrButton
                    type="button"
                    label="Réinitialiser"
                    tertiary
                    size="md"
                    @click="confirmReset"
                  />
                </li>
              </ul>
            </div>
          </div>

          <div class="fr-grid-row fr-grid-row--gutters">
            <div class="fr-callout fr-col-12 fr-col-md-4">
              <h3 class="fr-h4 fr-mb-3w">Ajouter une page à auditer</h3>
              <form @submit.prevent="addPage">
                <div class="fr-grid-row">
                  <div class="fr-col-12">
                    <DsfrInput
                      id="page-title"
                      label="Titre de la page"
                      hint="Nom lisible identifiant la page (ex. : Accueil, Contact, Panier)"
                      label-visible
                      placeholder="Accueil, Contact…"
                      :model-value="form.title"
                      required
                      @update:model-value="setForm('title', $event)"
                    />
                  </div>
                  <div class="fr-col-12">
                    <DsfrInput
                      id="page-url"
                      label="URL de la page"
                      hint="Adresse complète de la page à auditer (ex. : https://monsite.fr/contact)"
                      label-visible
                      type="url"
                      placeholder="https://…"
                      :model-value="form.url"
                      required
                      @update:model-value="setForm('url', $event)"
                    />
                  </div>
                </div>
                <DsfrButton
                  type="submit"
                  label="Ajouter à l'échantillon"
                  icon="fr-icon-add-line"
                  class="fr-mt-3w"
                />
              </form>
            </div>
            <div class="fr-col-12 fr-col-md-8">
              <!-- ── Échantillon des pages ─────────────────────── -->
              <div v-if="store.pages.length">
                <DsfrTable
                  title="Pages de l'échantillon"
                  :headers="['ID', 'Titre', 'URL', 'Actions']"
                  no-caption
                  no-scroll
                >
                  <tr v-for="page in store.pages" :key="page.id">
                    <td>
                      <code class="fr-text--sm">{{ page.id }}</code>
                    </td>
                    <td>
                      {{ page.title }}
                      <DsfrBadge
                        v-if="isPageComplete(page.id)"
                        label="Complet"
                        type="success"
                        no-icon
                        small
                        class="fr-ml-1w"
                      />
                    </td>
                    <td class="fr-text--sm">{{ page.url }}</td>
                    <td>
                      <ul
                        class="fr-btns-group fr-btns-group--right fr-btns-group--inline fr-btns-group--sm"
                      >
                        <li>
                          <DsfrButton
                            type="button"
                            label="Auditer"
                            size="sm"
                            icon="fr-icon-edit-line"
                            @click="auditPage(page.id)"
                          />
                        </li>
                        <li>
                          <DsfrButton
                            type="button"
                            tertiary
                            size="sm"
                            icon="fr-icon-delete-line"
                            icon-only
                            :aria-label="`Supprimer la page ${page.title}`"
                            @click="store.removePage(page.id)"
                          />
                        </li>
                      </ul>
                    </td>
                  </tr>
                </DsfrTable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
