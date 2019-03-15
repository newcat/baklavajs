import Vue from "vue";
import { expect } from "chai";
import { createLocalVue, shallowMount, mount, Wrapper } from "@vue/test-utils";
import BaklavaJS, { Editor } from "@/index";
import EditorView from "@/components/Editor.vue";
import TestNode from "testimpl/TestNode";

Vue.use(BaklavaJS);

function mountEditor(editor?: Editor) {
    if (!editor) {
        editor = new Editor();
    }
    return mount(EditorView, { propsData: { model: editor } });
}

describe("EditorView", () => {

    it("does render", () => {
        const view = mountEditor();
        expect(view.find(".node-editor").exists()).to.be.true;
    });

    it("does show nodes", async () => {
        const editor = new Editor();
        editor.registerNodeType("TestNode", TestNode);
        const n = editor.addNode("TestNode");
        const view = mountEditor(editor);
        expect(view.find("#" + n!.id).exists()).to.be.true;
    });

    it("does show connections", async () => {
        const editor = new Editor();
        editor.registerNodeType("TestNode", TestNode);
        const n1 = editor.addNode("TestNode");
        const n2 = editor.addNode("TestNode");
        const c = editor.addConnection(n1!.getInterface("Output"), n2!.getInterface("Input"));
        // const view = mountEditor(editor);
        // expect(view.find(".connection").exists()).to.be.true;
    });

});
