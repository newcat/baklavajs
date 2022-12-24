import { defineDynamicNode, DynamicNodeDefinition, NodeInterface } from "../src";

describe("Dynamic Node", () => {
    it("works", () => {
        const DynNode = defineDynamicNode({
            type: "DynNode",
            inputs: {
                numIntfs: () => new NodeInterface<number>("Num Intfs", 0),
            },
            onUpdate({ numIntfs }) {
                const outputs: DynamicNodeDefinition = {};
                for (let i = 0; i < numIntfs; i++) {
                    outputs[`intf${i}`] = () => new NodeInterface(`Intf ${i}`, 0);
                }
                return { outputs };
            },
        });

        const dn = new DynNode();
        expect(Object.keys(dn.outputs)).toHaveLength(0);
        dn.inputs.numIntfs.value = 10;
        expect(Object.keys(dn.outputs)).toHaveLength(10);
    });
});
