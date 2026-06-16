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
  if (confirm('Réinitialiser tout l’audit ? Cette action est irréversible.')) {
    store.reset()
  }
}
</script>

<template>
  <div class="view">
    <header class="view-header">
      <h1>Easy Checks</h1>
      <p class="subtitle">
        Évaluez l’accessibilité de vos pages selon les contrôles essentiels du
        W3C&nbsp;— {{ store.checks.length }} critères.
      </p>
    </header>

    <section class="card">
      <h2>Informations de l’audit</h2>
      <div class="grid-2">
        <label>
          Site
          <input v-model="store.meta.site" type="text" placeholder="Nom du site" />
        </label>
        <label>
          Auditeur·rice
          <input v-model="store.meta.auditor" type="text" placeholder="Votre nom" />
        </label>
        <label>
          Contexte
          <input v-model="store.meta.context" type="text" placeholder="Sprint, version…" />
        </label>
        <label>
          Date
          <input v-model="store.meta.date" type="date" />
        </label>
      </div>
    </section>

    <section class="card">
      <h2>Ajouter une page</h2>
      <form class="add-form" @submit.prevent="addPage">
        <label>
          Titre de la page
          <input v-model="form.title" type="text" placeholder="Accueil, Contact…" />
        </label>
        <label>
          URL
          <input v-model="form.url" type="url" placeholder="https://…" required />
        </label>
        <button type="submit" class="btn-primary">Auditer cette page</button>
      </form>
    </section>

    <section v-if="store.pages.length" class="card">
      <div class="card-head">
        <h2>Échantillon ({{ store.pages.length }})</h2>
        <RouterLink :to="{ name: 'summary' }" class="btn-link">
          Voir la synthèse →
        </RouterLink>
      </div>
      <ul class="page-list">
        <li v-for="page in store.pages" :key="page.id" class="page-row">
          <button type="button" class="page-open" @click="openPage(page.id)">
            <span class="page-id">{{ page.id }}</span>
            <span class="page-info">
              <strong>{{ page.title }}</strong>
              <small>{{ page.url }}</small>
            </span>
          </button>
          <button
            type="button"
            class="btn-danger"
            :aria-label="`Supprimer ${page.title}`"
            @click="store.removePage(page.id)"
          >
            Supprimer
          </button>
        </li>
      </ul>
      <button type="button" class="btn-reset" @click="confirmReset">
        Réinitialiser l’audit
      </button>
    </section>
  </div>
</template>

