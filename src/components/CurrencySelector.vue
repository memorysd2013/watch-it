<template>
  <div class="currency-selector">
    <h3>選擇貨幣對</h3>
    <div class="selector-grid">
      <div
        v-for="pair in currencyPairs"
        :key="`${pair.from}/${pair.to}`"
        @click="selectCurrencyPair(pair)"
        :class="[
          'currency-pair',
          {
            active:
              selectedPair &&
              selectedPair.from === pair.from &&
              selectedPair.to === pair.to,
          },
        ]"
      >
        <div class="pair-header">
          <span class="flag">{{ getCurrencyInfo(pair.from).flag }}</span>
          <span class="currency-code">{{ pair.from }}</span>
          <span class="arrow">→</span>
          <span class="flag">{{ getCurrencyInfo(pair.to).flag }}</span>
          <span class="currency-code">{{ pair.to }}</span>
        </div>
        <div class="pair-name">{{ pair.name }}</div>
        <div class="pair-description">{{ pair.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  DEFAULT_CURRENCY_PAIRS,
  getCurrencyInfo,
} from '../config/currencies.js';

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const currencyPairs = DEFAULT_CURRENCY_PAIRS;
const selectedPair = ref(props.modelValue);

const selectCurrencyPair = (pair) => {
  selectedPair.value = pair;
  emit('update:modelValue', pair);
};
</script>

<style scoped>
.currency-selector {
  background: #2c2c54;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #40407a;
  margin-bottom: 20px;
}

.currency-selector h3 {
  margin: 0 0 16px 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

.selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.currency-pair {
  background: #40407a;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.currency-pair:hover {
  background: #4a4a8a;
  transform: translateY(-2px);
}

.currency-pair.active {
  border-color: #64b5f6;
  background: #4a4a8a;
}

.pair-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.flag {
  font-size: 16px;
}

.currency-code {
  font-weight: 600;
  color: #ffffff;
  font-size: 14px;
}

.arrow {
  color: #b0bec5;
  font-size: 12px;
}

.pair-name {
  font-size: 12px;
  color: #b0bec5;
  margin-bottom: 4px;
}

.pair-description {
  font-size: 11px;
  color: #90a4ae;
}

@media (max-width: 768px) {
  .selector-grid {
    grid-template-columns: 1fr;
  }
}
</style>
