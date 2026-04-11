<template>
    <BaklavaEditor :view-model="baklava" />
</template>

<script setup lang="ts">
import { defineNode, NodeInterface } from "@baklavajs/core";
import { DependencyEngine, applyResult } from "@baklavajs/engine";
import { BaklavaEditor, useBaklava, NumberInterface, SelectInterface, TextInterface } from "@baklavajs/renderer-vue";
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
        } else {
            output = number1 - number2;
        }
        return { output };
    },
});

const DisplayNode = defineNode({
    type: "DisplayNode",
    inputs: {
        value: () => new NumberInterface("Value", 0),
    },
    outputs: {
        display: () => new TextInterface("Result", "").setPort(false),
    },
    calculate({ value }) {
        return { display: String(value) };
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

const engine = new DependencyEngine(baklava.editor);
const token = Symbol();
engine.events.afterRun.subscribe(token, (result) => {
    engine.pause();
    applyResult(result, baklava.editor);
    engine.resume();
});
engine.start();
</script>
