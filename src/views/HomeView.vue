<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuditStore } from '@/stores/audit.ts'

const store = useAuditStore()
const router = useRouter()

const form = reactive({ title: '', url: '' })

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
        <strong>{{ store.checks.length }} critères</strong>.
      </p>
    </div>

    <!-- ── Informations de l'audit ───────────────────── -->
    <div class="fr-card fr-mb-4w">
      <div class="fr-card__body">
        <div class="fr-card__content">
          <h2 class="fr-h4 fr-mb-3w">Informations de l'audit</h2>
          <div class="fr-grid-row fr-grid-row--gutters">
            <div class="fr-col-12 fr-col-md-6">
              <div class="fr-input-group">
                <label class="fr-label" for="meta-site">Site</label>
                <input
                  id="meta-site"
                  v-model="store.meta.site"
                  class="fr-input"
                  type="text"
                  placeholder="Nom du site"
                />
              </div>
            </div>
            <div class="fr-col-12 fr-col-md-6">
              <div class="fr-input-group">
                <label class="fr-label" for="meta-auditor">Auditeur·rice</label>
                <input
                  id="meta-auditor"
                  v-model="store.meta.auditor"
                  class="fr-input"
                  type="text"
                  placeholder="Votre nom"
                />
              </div>
            </div>
            <div class="fr-col-12 fr-col-md-6">
              <div class="fr-input-group">
                <label class="fr-label" for="meta-context">Contexte</label>
                <input
                  id="meta-context"
                  v-model="store.meta.context"
                  class="fr-input"
                  type="text"
                  placeholder="Sprint, version…"
                />
              </div>
            </div>
            <div class="fr-col-12 fr-col-md-6">
              <div class="fr-input-group">
                <label class="fr-label" for="meta-date">Date</label>
                <input
                  id="meta-date"
                  v-model="store.meta.date"
                  class="fr-input"
                  type="date"
                />
              </div>
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
                <div class="fr-input-group">
                  <label class="fr-label" for="page-title">
                    Titre de la page
                  </label>
                  <input
                    id="page-title"
                    v-model="form.title"
                    class="fr-input"
                    type="text"
                    placeholder="Accueil, Contact…"
                    required
                  />
                </div>
              </div>
              <div class="fr-col-12 fr-col-md-6">
                <div class="fr-input-group">
                  <label class="fr-label" for="page-url">
                    URL de la page
                    <span class="fr-hint-text">Champ obligatoire</span>
                  </label>
                  <input
                    id="page-url"
                    v-model="form.url"
                    class="fr-input"
                    type="url"
                    placeholder="https://…"
                    required
                  />
                </div>
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

