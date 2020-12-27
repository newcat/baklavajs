<template>
    <div @click="intf.value = !intf.value" :class="{ 'dark-checkbox': true, '--checked': intf.value }">
        <div class="__checkmark-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                <path class="__checkmark" d="M 6 5 L 6 10 L 16 10" transform="rotate(-45 10 10)"></path>
            </svg>
        </div>
        <div class="ml-2">{{ io.name }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { CheckboxInterface } from "./CheckboxInterface";

export default defineComponent({
    props: {
        intf: {
            type: Object as () => CheckboxInterface,
            required: true,
        },
    },
});
</script>
