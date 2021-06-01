<template>
    <div class="node --palette" :data-node-type="type">
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
            default: false,
        },
    },
});
</script>

<style scoped>
.node.--palette {
    position: unset;
    margin: 1rem 0;
    cursor: grab;
}

.node.--palette:first-child {
    margin-top: 0;
}

.node.--palette .__title {
    padding: 0.5rem;
}
</style>
