<template>
  <div class="validated-input-wrapper">
    <div class="input-container" :class="{ 'has-error': hasError, 'is-dirty': isDirty, 'is-touched': isTouched }">
      <input
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        v-bind="$attrs"
        class="validated-input"
        :class="{ 'error': hasError, 'dirty': isDirty, 'touched': isTouched }"
        :disabled="disabled"
      />
      <div v-if="hasError" class="error-indicator">⚠️</div>
      <div v-else-if="isDirty && !hasError && showSuccessMessage" class="success-indicator">✓</div>
    </div>
    
    <div v-if="hasError" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div v-else-if="isDirty && !hasError && showSuccessMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <div v-if="showHelpText" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useField } from 'vee-validate'

interface Props {
  modelValue: string
  name: string
  rules?: string | object
  successMessage?: string
  helpText?: string
  disabled?: boolean
  showSuccessMessage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  successMessage: 'Looks good!',
  helpText: '',
  disabled: false,
  showSuccessMessage: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

// Use Vee-Validate field
const { value, errorMessage, handleBlur: veeBlur, handleChange, meta } = useField(
  props.name,
  props.rules as any,
  {
    initialValue: props.modelValue
  }
)

// Computed properties
const hasError = computed(() => !!errorMessage.value)
const isDirty = computed(() => meta.dirty)
const isTouched = computed(() => meta.touched)
const showHelpText = computed(() => props.helpText && !isDirty.value && !isTouched.value)

// Event handlers
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = target.value
  handleChange(newValue)
  emit('update:modelValue', newValue)
}

const handleBlur = (event: FocusEvent) => {
  veeBlur(event)
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>

<style scoped>
.validated-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.validated-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  padding-right: 50px; /* Space for indicators */
  color: #374151 !important;
}

.validated-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  color: #374151 !important;
}

.validated-input.error {
  border-color: #ef4444;
  background: #fef2f2;
  color: #374151 !important;
}

.validated-input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  color: #374151 !important;
}

.validated-input.dirty:not(.error) {
  border-color: #10b981;
  background: #f0fdf4;
  color: #374151 !important;
}

.validated-input.dirty:not(.error):focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  color: #374151 !important;
}

.validated-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f3f4f6;
  color: #6b7280 !important;
}

.validated-input::placeholder {
  color: #9ca3af !important;
}

.error-indicator,
.success-indicator {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  pointer-events: none;
}

.error-indicator {
  color: #ef4444;
}

.success-indicator {
  color: #10b981;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: 4px;
}

.success-message {
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: 4px;
}

.help-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin-left: 4px;
}

/* Animation for state changes */
.validated-input {
  transition: all 0.2s ease;
}

.error-message,
.success-message,
.help-text {
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 