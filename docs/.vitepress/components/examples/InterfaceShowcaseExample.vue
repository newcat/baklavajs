<template>
    <BaklavaEditor :view-model="baklava" />
</template>

<script setup lang="ts">
import { defineNode } from "@baklavajs/core";
import {
    BaklavaEditor,
    useBaklava,
    ButtonInterface,
    CheckboxInterface,
    IntegerInterface,
    NumberInterface,
    SelectInterface,
    SliderInterface,
    TextInputInterface,
    TextInterface,
    TextareaInputInterface,
} from "@baklavajs/renderer-vue";
import "@baklavajs/themes/dist/syrup-dark.css";

const InterfaceShowcaseNode = defineNode({
    type: "InterfaceShowcase",
    title: "All Interface Types",
    inputs: {
        button: () => new ButtonInterface("Button", () => alert("Button clicked!")),
        checkbox: () => new CheckboxInterface("Checkbox", false),
        integer: () => new IntegerInterface("Integer", 5, 0, 10),
        number: () => new NumberInterface("Number", 0.5, 0, 1),
        select: () => new SelectInterface("Select", "Option A", ["Option A", "Option B", "Option C"]).setPort(false),
        slider: () => new SliderInterface("Slider", 0.5, 0, 1),
        textInput: () => new TextInputInterface("Text Input", "Edit me"),
        text: () => new TextInterface("Text (read-only)", "Hello World!"),
        textarea: () => new TextareaInputInterface("Textarea", "Multi-line\ntext input"),
    },
});

const baklava = useBaklava();
baklava.editor.registerNodeType(InterfaceShowcaseNode);
baklava.settings.palette.enabled = false;
baklava.settings.toolbar.enabled = false;

const node = new InterfaceShowcaseNode();
node.position = { x: 200, y: 50 };
node.width = 300;
baklava.editor.graph.addNode(node);
</script>
