<template>
    <div class="settings-example">
        <div class="settings-controls">
            <label><input type="checkbox" v-model="baklava.settings.enableMinimap" /> Minimap</label>
            <label
                ><input type="checkbox" v-model="baklava.settings.useStraightConnections" /> Straight connections</label
            >
            <label><input type="checkbox" v-model="baklava.settings.displayValueOnHover" /> Show value on hover</label>
            <label><input type="checkbox" v-model="baklava.settings.nodes.resizable" /> Resizable nodes</label>
        </div>
        <div class="editor-container">
            <BaklavaEditor :view-model="baklava" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineNode, NodeInterface } from "@baklavajs/core";
import { BaklavaEditor, useBaklava, NumberInterface, SelectInterface } from "@baklavajs/renderer-vue";
import "@baklavajs/themes/dist/syrup-dark.css";

const MathNode = defineNode({
    type: "MathNode",
    inputs: {
        number1: () => new NumberInterface("Number", 1),
        number2: () => new NumberInterface("Number", 10),
        operation: () => new SelectInterface("Operation", "Add", ["Add", "Subtract"]).setPort(false),
    },
    outputs: {
        output: () => new NodeInterface("Output", 0),
    },
});

const baklava = useBaklava();
baklava.editor.registerNodeType(MathNode);
baklava.settings.palette.enabled = false;
baklava.settings.toolbar.enabled = false;

const node1 = new MathNode();
node1.position = { x: 100, y: 100 };
baklava.editor.graph.addNode(node1);

const node2 = new MathNode();
node2.position = { x: 450, y: 100 };
baklava.editor.graph.addNode(node2);

baklava.editor.graph.addConnection(node1.outputs.output, node2.inputs.number1);
</script>

<style scoped>
.settings-example {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.settings-controls {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    padding: 12px 16px;
    background: var(--vp-c-bg-soft);
    border-bottom: 1px solid var(--vp-c-divider);
    font-size: 14px;
}

.settings-controls label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
}

.editor-container {
    position: relative;
    flex: 1;
}
</style>
