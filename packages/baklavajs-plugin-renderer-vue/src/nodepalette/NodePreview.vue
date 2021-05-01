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
            "--preview": true,
            [`--type-${sanitizeName(props.type)}`]: true,
        }));

        return { classes };
    },
});
</script>

<style scoped>
.node.--preview {
    position: unset;
    margin: 1rem 0;
    cursor: grab;
}

.node.--preview .__title {
    padding: 0.5rem;
}
</style>
