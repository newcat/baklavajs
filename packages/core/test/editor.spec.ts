import { Editor, getGraphNodeTypeString, Graph, GraphTemplate } from "../src";
import OutputNode from "./OutputNode";
import TestNode from "./TestNode";

describe("Editor", () => {
    function getGraphTemplate(editor: Editor) {
        const n1 = new TestNode();
        const n2 = new TestNode();
        return new GraphTemplate(
            {
                inputs: [],
                outputs: [],
                nodes: [n1.save(), n2.save()],
                connections: [{ id: "abc", from: n1.outputs.b.id, to: n2.inputs.a.id }],
            },
            editor,
        );
    }

    it("can construct", () => {
        expect(new Editor()).toBeTruthy();
    });

    it("can register a new node type", () => {
        const e = new Editor();
        const ev = jest.fn();
        e.events.registerNodeType.subscribe(this, ev);
        e.registerNodeType(TestNode);
        expect(e.nodeTypes.get("TestNode")).toEqual({
            category: "default",
            title: "TestNode",
            type: TestNode,
        });
        expect(ev).toHaveBeenCalled();
    });

    it("can register a new node type with category and title", () => {
        const e = new Editor();
        e.registerNodeType(TestNode, {
            category: "category",
            title: "title",
        });
        expect(e.nodeTypes.get("TestNode")).toEqual({
            type: TestNode,
            category: "category",
            title: "title",
        });
    });

    it("can save and load a state", () => {
        const e = new Editor();
        e.registerNodeType(TestNode);
        e.registerNodeType(OutputNode);
        const n1 = e.graph.addNode(new TestNode())!;
        const n2 = e.graph.addNode(new OutputNode())!;
        e.graph.addConnection(n1.outputs.b, n2.inputs.input);
        e.addGraphTemplate(getGraphTemplate(e));

        const save1 = e.save();

        const e2 = new Editor();
        e2.registerNodeType(TestNode);
        e2.registerNodeType(OutputNode);
        e2.load(save1);

        expect(e2.save()).toEqual(save1);
    });

    it("can prevent node types from being registered", () => {
        const e = new Editor();
        const before = jest.fn(() => false);
        const after = jest.fn();
        e.events.beforeRegisterNodeType.subscribe(this, before);
        e.events.registerNodeType.subscribe(this, after);
        e.registerNodeType(TestNode);
        expect(before).toHaveBeenCalledTimes(1);
        expect(after).toHaveBeenCalledTimes(0);
        expect(e.nodeTypes.size).toEqual(0);
    });

    it("can unregister node types", () => {
        const e = new Editor();
        const ev = jest.fn();
        e.events.unregisterNodeType.subscribe(this, ev);
        e.registerNodeType(TestNode);
        expect(e.nodeTypes.size).toEqual(1);
        e.unregisterNodeType(TestNode);
        expect(e.nodeTypes.size).toEqual(0);
        expect(ev).toHaveBeenCalled();
    });

    it("can prevent node types from being unregistered", () => {
        const e = new Editor();
        const before = jest.fn(() => false);
        const after = jest.fn();
        e.events.beforeUnregisterNodeType.subscribe(this, before);
        e.events.unregisterNodeType.subscribe(this, after);
        e.registerNodeType(TestNode);
        expect(e.nodeTypes.size).toEqual(1);
        e.unregisterNodeType(TestNode);
        expect(before).toHaveBeenCalledTimes(1);
        expect(after).toHaveBeenCalledTimes(0);
        expect(e.nodeTypes.size).toEqual(1);
    });

    it("adds a graph template correctly", () => {
        const e = new Editor();
        e.registerNodeType(TestNode);

        const ev = jest.fn();
        const proxyEv = jest.fn();
        e.events.addGraphTemplate.subscribe(this, ev);
        e.graphTemplateEvents.nameChanged.subscribe(this, proxyEv);

        const gt = getGraphTemplate(e);
        e.addGraphTemplate(gt);
        expect(e.graphTemplates).toHaveLength(1);
        expect(e.nodeTypes.size).toEqual(2);

        gt.events.nameChanged.emit("newName");
        expect(proxyEv).toHaveBeenCalledWith("newName", gt);
    });

    it("can prevent graph templates from being added", () => {
        const e = new Editor();
        e.registerNodeType(TestNode);

        const before = jest.fn(() => false);
        const after = jest.fn();
        e.events.beforeAddGraphTemplate.subscribe(this, before);
        e.events.addGraphTemplate.subscribe(this, after);

        const gt = getGraphTemplate(e);
        e.addGraphTemplate(gt);
        expect(e.graphTemplates).toHaveLength(0);
        expect(e.nodeTypes.size).toEqual(1);
        expect(before).toHaveBeenCalled();
        expect(after).toHaveBeenCalledTimes(0);
    });

    it("removes a graph template correctly", () => {
        const e = new Editor();
        e.registerNodeType(TestNode);
        const ev = jest.fn();
        e.events.removeGraphTemplate.subscribe(this, ev);

        const gt = getGraphTemplate(e);
        e.addGraphTemplate(gt);
        expect(e.nodeTypes.size).toEqual(2);
        const GraphNode = e.nodeTypes.get(getGraphNodeTypeString(gt))!.type;

        const g = new Graph(e);
        g.addNode(new GraphNode());
        e.graph.addNode(new GraphNode());
        expect(g.nodes).toHaveLength(1);
        expect(e.graph.nodes).toHaveLength(1);

        e.removeGraphTemplate(gt);

        expect(e.nodeTypes.size).toEqual(1);
        expect(g.nodes).toHaveLength(0);
        expect(e.graph.nodes).toHaveLength(0);
        expect(ev).toHaveBeenCalledTimes(1);
    });

    it("can prevent a graph template from being removed", () => {
        const e = new Editor();
        e.registerNodeType(TestNode);
        const gt = getGraphTemplate(e);
        e.addGraphTemplate(gt);
        expect(e.graphTemplates).toHaveLength(1);

        const before = jest.fn(() => false);
        const after = jest.fn();
        e.events.beforeRemoveGraphTemplate.subscribe(this, before);
        e.events.removeGraphTemplate.subscribe(this, after);

        e.removeGraphTemplate(gt);
        expect(before).toHaveBeenCalledTimes(1);
        expect(after).toHaveBeenCalledTimes(0);
        expect(e.graphTemplates).toHaveLength(1);
    });
});
