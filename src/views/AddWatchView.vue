<template>
  <div class="view-container">
    <h1 class="view-title">新增監控項目</h1>
    <SearchForm />
  </div>
</template>

<script setup>
import SearchForm from '../components/watchlist/SearchForm.vue'
</script>

<style scoped>
.view-container {
  max-width: 600px;
  margin: 0 auto;
}

.view-title {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-6);
  color: var(--text-primary);
}
</style>
