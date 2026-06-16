<template>
  <!-- Lien d'évitement -->
  <div class="fr-skiplinks">
    <nav class="fr-container" role="navigation" aria-label="Accès rapide">
      <ul class="fr-skiplinks__list">
        <li><a class="fr-link" href="#main-content">Contenu</a></li>
      </ul>
    </nav>
  </div>

  <!-- En-tête DSFR -->
  <header role="banner" class="fr-header">
    <div class="fr-header__body">
      <div class="fr-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand fr-enlarge-link">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <p class="fr-logo">République<br>Française</p>
              </div>
            </div>
            <div class="fr-header__service">
              <RouterLink
                to="/"
                class="fr-header__service-title"
                title="Accueil – Easy Checks"
              >
                Easy Checks
              </RouterLink>
              <p class="fr-header__service-tagline">
                Évaluation d'accessibilité web
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Contenu principal -->
  <main id="main-content" tabindex="-1">
    <RouterView />
  </main>
</template>

