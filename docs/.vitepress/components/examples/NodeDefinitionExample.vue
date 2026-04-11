<template>
    <BaklavaEditor :view-model="baklava" />
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
    calculate({ number1, number2, operation }) {
        let output: number;
        if (operation === "Add") {
            output = number1 + number2;
        } else if (operation === "Subtract") {
            output = number1 - number2;
        } else {
            throw new Error("Unknown operation: " + operation);
        }
        return { output };
    },
});

const DisplayNode = defineNode({
    type: "DisplayNode",
    inputs: {
        value: () => new NumberInterface("Value", 0),
    },
});

const baklava = useBaklava();
baklava.editor.registerNodeType(MathNode);
baklava.editor.registerNodeType(DisplayNode);

const node1 = new MathNode();
node1.position = { x: 100, y: 150 };
baklava.editor.graph.addNode(node1);

const node2 = new DisplayNode();
node2.position = { x: 500, y: 150 };
baklava.editor.graph.addNode(node2);

baklava.editor.graph.addConnection(node1.outputs.output, node2.inputs.value);
</script>
