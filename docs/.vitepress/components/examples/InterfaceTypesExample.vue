<template>
    <BaklavaEditor :view-model="baklava" />
</template>

<script setup lang="ts">
import { defineNode, NodeInterface } from "@baklavajs/core";
import { NodeInterfaceType, BaklavaInterfaceTypes, setType } from "@baklavajs/interface-types";
import { BaklavaEditor, useBaklava, NumberInterface, TextInputInterface, TextInterface } from "@baklavajs/renderer-vue";
import "@baklavajs/themes/dist/syrup-dark.css";

const stringType = new NodeInterfaceType<string>("string");
const numberType = new NodeInterfaceType<number>("number");

stringType.addConversion(numberType, (v) => parseFloat(v));
numberType.addConversion(stringType, (v) => v?.toString() ?? "0");

const NumberSourceNode = defineNode({
    type: "NumberSource",
    outputs: {
        value: () => new NumberInterface("Value", 42).use(setType, numberType),
    },
});

const StringSourceNode = defineNode({
    type: "StringSource",
    outputs: {
        value: () => new TextInputInterface("Value", "hello").use(setType, stringType),
    },
});

const NumberSinkNode = defineNode({
    type: "NumberSink",
    inputs: {
        value: () => new NodeInterface<number>("Value", 0).use(setType, numberType),
    },
    outputs: {
        display: () => new TextInterface("Display", "").setPort(false),
    },
});

const StringSinkNode = defineNode({
    type: "StringSink",
    inputs: {
        value: () => new NodeInterface<string>("Value", "").use(setType, stringType),
    },
    outputs: {
        display: () => new TextInterface("Display", "").setPort(false),
    },
});

const baklava = useBaklava();
baklava.editor.registerNodeType(NumberSourceNode, { category: "Sources" });
baklava.editor.registerNodeType(StringSourceNode, { category: "Sources" });
baklava.editor.registerNodeType(NumberSinkNode, { category: "Sinks" });
baklava.editor.registerNodeType(StringSinkNode, { category: "Sinks" });

const nodeInterfaceTypes = new BaklavaInterfaceTypes(baklava.editor, { viewPlugin: baklava });
nodeInterfaceTypes.addTypes(stringType, numberType);

const numSrc = new NumberSourceNode();
numSrc.position = { x: 80, y: 80 };
baklava.editor.graph.addNode(numSrc);

const strSrc = new StringSourceNode();
strSrc.position = { x: 80, y: 250 };
baklava.editor.graph.addNode(strSrc);

const numSink = new NumberSinkNode();
numSink.position = { x: 450, y: 80 };
baklava.editor.graph.addNode(numSink);

const strSink = new StringSinkNode();
strSink.position = { x: 450, y: 250 };
baklava.editor.graph.addNode(strSink);

baklava.editor.graph.addConnection(numSrc.outputs.value, numSink.inputs.value);
</script>

<style>
.baklava-node-interface[data-interface-type="string"] {
    --baklava-node-interface-port-color: green;
}

.baklava-node-interface[data-interface-type="number"] {
    --baklava-node-interface-port-color: red;
}
</style>
