<template>
    <div class="mermaid">
        <slot />
    </div>
</template>

<script lang="ts">
export default {
    mounted() {
        void import("mermaid/dist/mermaid").then((m: any) => {
            m.initialize({
                startOnLoad: true,
                theme: "dark",
            });
            m.init();
        });
    },
};
</script>
