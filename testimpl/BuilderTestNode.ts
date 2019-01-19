import { NodeBuilder, Options } from "../src/index";

export default new NodeBuilder("BuilderTestNode")
    .addInputInterface("Input 1", "string", Options.InputOption, "default1")
    .addInputInterface("Input 2", "string", Options.InputOption, "default2")
    .addOption("Separator", Options.InputOption, ",")
    .addOutputInterface("Output", "string")
    .onCalculate((n) => {
        const s1 = n.getInterface("Input 1").value;
        const s2 = n.getInterface("Input 2").value;
        const sep = n.getOptionValue("Separator");
        n.getInterface("Output").value = s1 + sep + s2;
    })
    .build();
