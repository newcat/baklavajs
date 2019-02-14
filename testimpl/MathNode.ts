import { NodeBuilder, Options } from "../src/index";

export default new NodeBuilder("MathNode")
    .addInputInterface("Number 1", "number", Options.NumberOption, 1)
    .addInputInterface("Number 2", "number", Options.NumberOption, 10)
    .addOption("Operation", Options.SelectOption, () => ({
        selected: "Add",
        items: [ "Add", "Subtract" ]
    }))
    .addOutputInterface("Output", "number")
    .onCalculate((n) => {
        const n1 = n.getInterface("Number 1").value;
        const n2 = n.getInterface("Number 2").value;
        const operation = n.getOptionValue("Operation").selected;
        let result;
        if (operation === "Add") {
            result = n1 + n2;
        } else if (operation === "Subtract") {
            result = n1 - n2;
        }
        n.getInterface("Output").value = result;
    })
    .build();
