import { defineDynamicNode, DynamicNodeDefinition } from "@baklavajs/core";
import { CheckboxInterface, NumberInterface, SelectInterface, TextInputInterface, TextInterface } from "../src";

export default defineDynamicNode({
    type: "DynamicNode",
    inputs: {
        select: () => new SelectInterface("Type", "Two Strings", ["Two Strings", "Four Numbers", "One Boolean"]),
    },
    outputs: {
        text: () => new TextInterface("Output", ""),
    },
    onUpdate({ select }) {
        switch (select) {
            case "Two Strings":
                return {
                    inputs: {
                        s1: () => new TextInputInterface("S1", ""),
                        s2: () => new TextInputInterface("S2", ""),
                    } as DynamicNodeDefinition,
                };
            case "Four Numbers":
                return {
                    inputs: {
                        n1: () => new NumberInterface("N1", 0),
                        n2: () => new NumberInterface("N2", 0),
                        n3: () => new NumberInterface("N3", 0),
                        n4: () => new NumberInterface("N4", 0),
                    } as DynamicNodeDefinition,
                };
            case "One Boolean":
                return {
                    inputs: {
                        b1: () => new CheckboxInterface("B1", false),
                    } as DynamicNodeDefinition,
                };
        }
        return {};
    },
    calculate(inputs) {
        const text = Object.keys(inputs)
            .filter((k) => k !== "select")
            .map((k) => inputs[k])
            .join(" ");
        return { text };
    },
});
