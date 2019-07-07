import { NodeBuilder } from "../../baklavajs-core/src";

export default new NodeBuilder("BuilderTestNode")
    .addInputInterface("Input 1", "InputOption", "default1")
    .addInputInterface("Input 2", "InputOption", "default2")
    .addOption("Separator", "InputOption", ",")
    .addOption("SidebarTest", "TriggerOption", () => ({ testtext: "this is a test" }), "SidebarOption")
    .addOutputInterface("Output")
    .onCalculate((n) => {
        const s1 = n.getInterface("Input 1").value;
        const s2 = n.getInterface("Input 2").value;
        const sep = n.getOptionValue("Separator");
        n.getInterface("Output").value = s1 + sep + s2;
    })
    .build();
