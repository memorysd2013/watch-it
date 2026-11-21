<script setup>
import { useToast } from '../../composables/useToast.js'
import { X } from 'lucide-vue-next'

const { toasts, dismiss } = useToast()

const handleUndo = (toast) => {
  if (toast.onUndo) {
    toast.onUndo()
  }
  dismiss(toast.id)
}
</script>

<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
      >
        <span class="toast-message">{{ toast.message }}</span>
        <div class="toast-actions">
          <button
            v-if="toast.onUndo"
            @click="handleUndo(toast)"
            class="toast-action"
          >
            {{ toast.action || '復原' }}
          </button>
          <button
            @click="dismiss(toast.id)"
            class="toast-close"
            aria-label="關閉"
          >
            <X :size="16" />
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 400px;
}

@media (max-width: 768px) {
  .toast-container {
    bottom: calc(var(--space-16) + var(--space-6));
    left: var(--space-4);
    right: var(--space-4);
    max-width: none;
  }
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-card);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  font-size: var(--text-sm);
}

.toast-success {
  border-left: 3px solid var(--color-down);
}

.toast-error {
  border-left: 3px solid var(--color-up);
}

.toast-info {
  border-left: 3px solid var(--accent);
}

.toast-message {
  flex: 1;
  color: var(--text-primary);
}

.toast-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.toast-action {
  padding: var(--space-1) var(--space-3);
  background: var(--accent);
  color: var(--bg-page);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: opacity var(--duration-fast) var(--ease);
}

.toast-action:hover {
  opacity: 0.9;
}

.toast-close {
  padding: var(--space-1);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--duration-fast) var(--ease);
}

.toast-close:hover {
  color: var(--text-primary);
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all var(--duration-normal) var(--ease);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}
</style>
