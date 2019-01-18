import { NodeBuilder } from "../src/index";
import InputOption from "../src/options/InputOption.vue";

export default new NodeBuilder("BuilderTestNode")
    .addInputInterface("Input 1", "string", InputOption, "default1")
    .addInputInterface("Input 2", "string", InputOption, "default2")
    .addOption("Separator", InputOption, ",")
    .addOutputInterface("Output", "string")
    .onCalculate((n) => {
        const s1 = n.getInterface("Input 1").value;
        const s2 = n.getInterface("Input 2").value;
        const sep = n.getOptionValue("Separator");
        n.getInterface("Output").value = s1 + sep + s2;
    })
    .build();
