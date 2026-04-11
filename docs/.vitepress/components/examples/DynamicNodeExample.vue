<template>
    <BaklavaEditor :view-model="baklava" />
</template>

<script setup lang="ts">
import { defineDynamicNode, NodeInterface } from "@baklavajs/core";
import { BaklavaEditor, useBaklava, NumberInterface, SelectInterface } from "@baklavajs/renderer-vue";
import "@baklavajs/themes/dist/syrup-dark.css";

const DynamicMathNode = defineDynamicNode({
    type: "DynamicMathNode",
    inputs: {
        operation: () => new SelectInterface("Operation", "Addition", ["Addition", "Sine"]),
    },
    outputs: {
        result: () => new NodeInterface("Result", 0),
    },
    onUpdate({ operation }) {
        if (operation === "Sine") {
            return {
                inputs: {
                    input1: () => new NumberInterface("Input", 0),
                },
            };
        } else {
            return {
                inputs: {
                    input1: () => new NumberInterface("Input", 0),
                    input2: () => new NumberInterface("Input", 0),
                },
            };
        }
    },
    calculate(inputs) {
        let result = 0;
        switch (inputs.operation) {
            case "Addition":
                result = inputs.input1 + inputs.input2;
                break;
            case "Sine":
                result = Math.sin(inputs.input1);
                break;
        }
        return { result };
    },
});

const baklava = useBaklava();
baklava.editor.registerNodeType(DynamicMathNode);
baklava.settings.palette.enabled = false;
baklava.settings.toolbar.enabled = false;

const node = new DynamicMathNode();
node.position = { x: 200, y: 100 };
baklava.editor.graph.addNode(node);
</script>
