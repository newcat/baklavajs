import { NodeBuilder } from "../../baklavajs-core/src";

export default new NodeBuilder("SelectTestNode")
    .addOption("Simple", "SelectOption", "A", undefined, { items: ["A", "B", "C"] })
    .addOption("Advanced", "SelectOption", 3, undefined, { items: [
        { text: "X", value: 1 },
        { text: "Y", value: 2 },
        { text: "Z", value: 3 },
    ] })
    .addOutputInterface("Simple")
    .addOutputInterface("Advanced")
    .onCalculate((n) => {
        n.getInterface("Simple").value = n.getOptionValue("Simple");
        n.getInterface("Advanced").value = n.getOptionValue("Advanced");
    })
    .build();
