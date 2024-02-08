<template>
    <div class="baklava-node-palette" @contextmenu.stop.prevent="">
        <section v-for="c in categories" :key="c.name">
            <h1 v-if="c.name !== 'default'">
                {{ c.name }}
            </h1>
            <PaletteEntry
                v-for="(ni, nt) in c.nodeTypes"
                :key="nt"
                :type="nt"
                :title="ni.title"
                @pointerdown="onDragStart(nt, ni)"
            />
        </section>
    </div>
    <transition name="fade">
        <div v-if="draggedNode" class="baklava-dragged-node" :style="draggedNodeStyles">
            <PaletteEntry :type="draggedNode.type" :title="draggedNode.nodeInformation.title" />
        </div>
    </transition>
</template>

<script setup lang="ts">
import { computed, CSSProperties, inject, Ref, ref, reactive } from "vue";
import { usePointer } from "@vueuse/core";
import { AbstractNode, INodeTypeInformation } from "@baklavajs/core";
import PaletteEntry from "./PaletteEntry.vue";
import { useViewModel, useTransform, useNodeCategories } from "../utility";

interface IDraggedNode {
    type: string;
    nodeInformation: INodeTypeInformation;
}

const { viewModel } = useViewModel();
const { x: mouseX, y: mouseY } = usePointer();
const { transform } = useTransform();
const categories = useNodeCategories(viewModel);

const editorEl = inject<Ref<HTMLElement | null>>("editorEl");

const draggedNode = ref<IDraggedNode | null>(null);

const draggedNodeStyles = computed<CSSProperties>(() => {
    if (!draggedNode.value || !editorEl?.value) {
        return {};
    }
    const { left, top } = editorEl.value.getBoundingClientRect();
    return {
        top: `${mouseY.value - top}px`,
        left: `${mouseX.value - left}px`,
    };
});

const onDragStart = (type: string, nodeInformation: INodeTypeInformation) => {
    draggedNode.value = {
        type,
        nodeInformation,
    };

    const onDragEnd = () => {
        const instance = reactive(new nodeInformation.type()) as AbstractNode;
        viewModel.value.displayedGraph.addNode(instance);

        const rect = editorEl!.value!.getBoundingClientRect();
        const [x, y] = transform(mouseX.value - rect.left, mouseY.value - rect.top);
        instance.position.x = x;
        instance.position.y = y;

        draggedNode.value = null;
        document.removeEventListener("pointerup", onDragEnd);
    };
    document.addEventListener("pointerup", onDragEnd);
};
</script>
