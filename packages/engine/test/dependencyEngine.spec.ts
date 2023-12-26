import {
    AbstractNode,
    Editor,
    Graph,
    GraphInputNode,
    GraphOutputNode,
    GraphTemplate,
    IGraphNode,
    NodeInterface,
    defineNode,
    getGraphNodeTypeString,
} from "@baklavajs/core";
import { TestNode } from "./testNode";
import {
    AfterNodeCalculationEventData,
    BeforeNodeCalculationEventData,
    DependencyEngine,
    allowMultipleConnections,
} from "../src";
import { deepObjectToMap } from "./utils";

describe("DependencyEngine", () => {
    it("emits the beforeNodeCalculation and afterNodeCalculation events", async () => {
        const editor = new Editor();
        const n1 = editor.graph.addNode(new TestNode())!;
        const n2 = editor.graph.addNode(new TestNode())!;
        editor.graph.addConnection(n1.outputs.c, n2.inputs.a);

        const engine = new DependencyEngine<void>(editor);
        const beforeSpy = jest.fn();
        const afterSpy = jest.fn();
        engine.events.beforeNodeCalculation.subscribe("a", beforeSpy);
        engine.events.afterNodeCalculation.subscribe("b", afterSpy);

        n1.inputs.a.value = 2;
        n1.inputs.b.value = 3;
        n2.inputs.b.value = 4;

        await engine.runOnce();

        expect(beforeSpy).toHaveBeenCalledTimes(2);
        expect(beforeSpy.mock.calls[0][0]).toEqual({
            node: n1,
            inputValues: {
                a: 2,
                b: 3,
            },
        } as BeforeNodeCalculationEventData);
        expect(beforeSpy.mock.calls[1][0]).toEqual({
            node: n2,
            inputValues: {
                a: 5,
                b: 4,
            },
        } as BeforeNodeCalculationEventData);

        expect(afterSpy).toHaveBeenCalledTimes(2);
        expect(afterSpy.mock.calls[0][0]).toEqual({
            node: n1,
            outputValues: {
                c: 5,
                d: -1,
            },
        } as AfterNodeCalculationEventData);
        expect(afterSpy.mock.calls[1][0]).toEqual({
            node: n2,
            outputValues: {
                c: 9,
                d: 1,
            },
        } as AfterNodeCalculationEventData);
    });

    it("allows using multiple connections", async () => {
        const editor = new Editor();
        const spy = jest.fn();
        const MultiNode = defineNode({
            type: "MultiNode",
            inputs: {
                a: () => new NodeInterface<number[]>("a", [0]).use(allowMultipleConnections),
            },
            calculate({ a }) {
                spy(a);
                return {};
            },
        });
        const n1 = editor.graph.addNode(new TestNode())!;
        const n2 = editor.graph.addNode(new MultiNode())!;
        editor.graph.addConnection(n1.outputs.c, n2.inputs.a);
        editor.graph.addConnection(n1.outputs.d, n2.inputs.a);

        const engine = new DependencyEngine<void>(editor);
        await engine.runOnce();

        expect(spy).toHaveBeenCalledWith([2, 0]);
    });

    it("handles nodes without calculate functions", async () => {
        const editor = new Editor();
        const NoCalculateNode = defineNode({
            type: "NoCalculateNode",
            outputs: {
                a: () => new NodeInterface("a", 3),
            },
        });
        const n1 = editor.graph.addNode(new NoCalculateNode())!;
        const n2 = editor.graph.addNode(new TestNode())!;
        editor.graph.addConnection(n1.outputs.a, n2.inputs.a);

        const engine = new DependencyEngine<void>(editor);
        const result = await engine.runOnce();

        expect(result).toEqual(
            deepObjectToMap({
                [n1.id]: { a: 3 },
                [n2.id]: { c: 4, d: 2 },
            }),
        );
    });

    it("correctly calculates subgraphs", async () => {
        const editor = new Editor();
        editor.registerNodeType(TestNode);

        const graph = new Graph(editor);
        const sn1 = new TestNode();
        const sn2 = new TestNode();
        const sInput = new GraphInputNode();
        const sOutput = new GraphOutputNode();
        graph.addNode(sn1);
        graph.addNode(sn2);
        graph.addNode(sInput);
        graph.addNode(sOutput);
        graph.addConnection(sn1.outputs.c, sn2.inputs.a);
        graph.addConnection(sInput.outputs.placeholder, sn1.inputs.a);
        graph.addConnection(sn2.outputs.c, sOutput.inputs.placeholder);
        const subgraphTemplate = GraphTemplate.fromGraph(graph, editor);
        editor.addGraphTemplate(subgraphTemplate);

        const n1 = new TestNode();
        const n2 = new TestNode();
        const nt = editor.nodeTypes.get(getGraphNodeTypeString(subgraphTemplate))!;
        const graphNode = new nt.type() as AbstractNode & IGraphNode;
        editor.graph.addNode(n1);
        editor.graph.addNode(n2);
        editor.graph.addNode(graphNode);
        editor.graph.addConnection(n1.outputs.c, graphNode.inputs[sInput.graphInterfaceId]);
        editor.graph.addConnection(graphNode.outputs[sOutput.graphInterfaceId], n2.inputs.a);

        const engine = new DependencyEngine<void>(editor);
        const results = await engine.runOnce();

        expect(results).toEqual(
            deepObjectToMap({
                [n1.id]: { c: 2, d: 0 },
                [graphNode.id]: {
                    [sOutput.graphInterfaceId]: 4,
                    _calculationResults: {
                        [graphNode.subgraph!.nodes[2].id]: { placeholder: 2 },
                        [graphNode.subgraph!.nodes[0].id]: { c: 3, d: 1 },
                        [graphNode.subgraph!.nodes[1].id]: { c: 4, d: 2 },
                        [graphNode.subgraph!.nodes[3].id]: { output: 4 },
                    },
                },
                [n2.id]: { c: 5, d: 3 },
            }),
        );
    });
});
