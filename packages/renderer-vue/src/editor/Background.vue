<template>
    <div
        class="background"
        :style="styles"
    />
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useGraph, usePlugin } from "../utility";

export default defineComponent({
    setup() {
        const { plugin } = usePlugin();
        const { graph } = useGraph();

        const styles = computed(() => {
            const config = plugin.value.settings.background;
            const positionLeft = graph.value.panning.x * graph.value.scaling;
            const positionTop = graph.value.panning.y * graph.value.scaling;
            const size = graph.value.scaling * config.gridSize;
            const subSize = size / config.gridDivision;
            const backgroundSize = `${size}px ${size}px, ${size}px ${size}px`;
            const subGridBackgroundSize =
                graph.value.scaling > config.subGridVisibleThreshold
                    ? `, ${subSize}px ${subSize}px, ${subSize}px ${subSize}px`
                    : "";
            return {
                backgroundPosition: `left ${positionLeft}px top ${positionTop}px`,
                backgroundSize: `${backgroundSize} ${subGridBackgroundSize}`,
            };
        });

        return { styles };
    },
});
</script>
