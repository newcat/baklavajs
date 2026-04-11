<template>
    <div ref="containerRef" class="baklava-example" :style="{ height }">
        <ClientOnly>
            <slot v-if="visible" />
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = withDefaults(defineProps<{ height?: string }>(), {
    height: "400px",
});

const containerRef = ref<HTMLElement | null>(null);
const visible = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
    if (!containerRef.value) return;
    observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                visible.value = true;
                observer?.disconnect();
                observer = null;
            }
        },
        { rootMargin: "200px" },
    );
    observer.observe(containerRef.value);
});

onBeforeUnmount(() => {
    observer?.disconnect();
});
</script>

<style scoped>
.baklava-example {
    position: relative;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    overflow: hidden;
    margin: 16px 0;
}
</style>
