import Vue from "vue";
import { expect } from "chai";
import { createLocalVue, shallowMount, mount } from "@vue/test-utils";
import BaklavaJS, { Editor } from "@/index";
import EditorView from "@/components/Editor.vue";
import TestNode from "testimpl/TestNode";

const localVue = createLocalVue();
localVue.use(BaklavaJS);

function getEditor(shallow = true) {
    const editor = new Editor();
    return {
        editor,
        view: (shallow ? shallowMount : mount)(EditorView, { propsData: { model: editor }, localVue })
    };
}

describe("EditorView", () => {

    it("does render", () => {
        const { view } = getEditor();
        expect(view.find(".node-editor").exists()).to.be.true;
    });

    it("does show nodes", async () => {
        const { editor, view } = getEditor(false);
        editor.registerNodeType("TestNode", TestNode);
        const n = (view.vm as any).model.addNode("TestNode");
        await Vue.nextTick();
        await Vue.nextTick();
        await Vue.nextTick();
        await Vue.nextTick();
        await Vue.nextTick();
        console.log(view.html());
        expect(view.find("#" + n!.id).exists()).to.be.true;
    });

});
