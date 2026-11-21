<template>
  <div class="view-container">
    <h1 class="view-title">推播通知設定</h1>
    <NotificationSettings />
  </div>
</template>

<script setup>
import NotificationSettings from '../components/notification/NotificationSettings.vue'
</script>

<style scoped>
.view-container {
  max-width: 800px;
  margin: 0 auto;
}

.view-title {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-6);
  color: var(--text-primary);
}
</style>
