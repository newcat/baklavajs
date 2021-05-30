<template>
    <div :class="classes">
        <div class="__title">
            {{ title }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { sanitizeName } from "../utility/cssNames";

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
    setup(props) {
        const classes = computed(() => ({
            "node": true,
            "--palette": true,
            [`--type-${sanitizeName(props.type)}`]: true,
        }));

        return { classes };
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
