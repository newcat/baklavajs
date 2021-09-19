<template>
    <div class="baklava-node --palette" :data-node-type="type">
        <div class="__title">
            {{ title }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        type: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
    },
});
</script>
