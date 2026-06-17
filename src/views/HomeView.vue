<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { DsfrInput } from '@gouvminint/vue-dsfr'
import { useAuditStore } from '@/stores/audit.ts'
import type { AuditMeta } from '@/types/check.ts'

const store = useAuditStore()
const router = useRouter()

const form = reactive({ title: '', url: '' })

function setMeta(key: keyof AuditMeta, value: string | number | undefined): void {
  store.meta[key] = String(value ?? '')
}

function setForm(key: keyof typeof form, value: string | number | undefined): void {
  form[key] = String(value ?? '')
}

function addPage(): void {
  const title = form.title.trim()
  const url = form.url.trim()
  if (!url) return
  const id = store.addPage(title || url, url)
  form.title = ''
  form.url = ''
  router.push({ name: 'audit', params: { pageId: id } })
}

function openPage(id: string): void {
  router.push({ name: 'audit', params: { pageId: id } })
}

function confirmReset(): void {
  if (confirm('Réinitialiser tout l\'audit ? Cette action est irréversible.')) {
    store.reset()
  }
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
                label-visible
                placeholder="Nom du site"
                :model-value="store.meta.site"
                @update:model-value="setMeta('site', $event)"
              />
            </div>
            <div class="fr-col-12 fr-col-md-6">
              <DsfrInput
                id="meta-auditor"
                label="Auditeur·rice"
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

    <!-- ── Ajouter une page ──────────────────────────── -->
    <div class="fr-card fr-mb-4w">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h2 class="fr-h4 fr-mb-3w">Ajouter une page à auditer</h2>
          <form @submit.prevent="addPage">
            <div class="fr-grid-row fr-grid-row--gutters">
              <div class="fr-col-12 fr-col-md-6">
                <DsfrInput
                  id="page-title"
                  label="Titre de la page"
                  label-visible
                  placeholder="Accueil, Contact…"
                  :model-value="form.title"
                  required
                  @update:model-value="setForm('title', $event)"
                />
              </div>
              <div class="fr-col-12 fr-col-md-6">
                <DsfrInput
                  id="page-url"
                  label="URL de la page"
                  hint="Champ obligatoire"
                  label-visible
                  type="url"
                  placeholder="https://…"
                  :model-value="form.url"
                  required
                  @update:model-value="setForm('url', $event)"
                />
              </div>
            </div>
            <button type="submit" class="fr-btn fr-mt-3w">
              Auditer cette page
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- ── Échantillon des pages ─────────────────────── -->
    <div v-if="store.pages.length" class="fr-card">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <div class="fr-grid-row fr-grid-row--middle fr-mb-3w">
            <div class="fr-col-10 fr-col-md-12">
              <h2 class="fr-h4 fr-mb-0">
                Échantillon
                <span class="fr-badge fr-badge--info fr-badge--no-icon fr-ml-1w">
                  {{ store.pages.length }}
                </span>
              </h2>
            </div>
            <div class="fr-col-auto">
              <RouterLink
                :to="{ name: 'summary' }"
                class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
              >
                Voir la synthèse
              </RouterLink>
            </div>
          </div>

          <div class="fr-table fr-table--no-caption">
            <table>
              <caption>Pages auditées</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Titre</th>
                  <th scope="col">URL</th>
                  <th scope="col" class="fr-text--right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="page in store.pages" :key="page.id">
                  <td>
                    <code class="fr-text--sm">{{ page.id }}</code>
                  </td>
                  <td>
                    <button
                      type="button"
                      class="fr-link"
                      @click="openPage(page.id)"
                    >
                      {{ page.title }}
                    </button>
                  </td>
                  <td class="fr-text--sm">{{ page.url }}</td>
                  <td class="fr-text--right">
                    <button
                      type="button"
                      class="fr-btn fr-btn--tertiary fr-btn--sm fr-icon-delete-line fr-btn--icon-left"
                      :aria-label="`Supprimer la page ${page.title}`"
                      @click="store.removePage(page.id)"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            type="button"
            class="fr-btn fr-btn--tertiary fr-btn--sm fr-mt-2w"
            @click="confirmReset"
          >
            Réinitialiser l'audit
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

