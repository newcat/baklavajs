<template>
    <div class="mermaid">
        <slot></slot>
    </div>
</template>

<script lang="ts">
export default {
    mounted() {
        // @ts-ignore
        import("mermaid/dist/mermaid").then((m) => {
            m.initialize({
                startOnLoad: true,
                theme: "dark"
            });
            m.init();
        });
    },
};
</script>
