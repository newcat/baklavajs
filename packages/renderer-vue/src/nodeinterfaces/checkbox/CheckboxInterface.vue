<template>
    <div
        class="baklava-checkbox"
        :class="{ '--checked': modelValue }"
        :title="intf.name"
        @click="emit('update:modelValue', !modelValue)"
    >
        <div class="__checkmark-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                <path class="__checkmark" d="M 6 5 L 6 10 L 16 10" transform="rotate(-45 10 10)" />
            </svg>
        </div>
        <div class="__label">
            {{ intf.name }}
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CheckboxInterface } from "./CheckboxInterface";

defineProps<{
    modelValue: boolean;
    intf: CheckboxInterface;
}>();

const emit = defineEmits<{
    (e: "update:modelValue", v: boolean): void;
}>();
</script>
