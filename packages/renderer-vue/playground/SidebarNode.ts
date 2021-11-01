import { markRaw } from "vue";
import { defineNode, NodeInterface } from "@baklavajs/core";
import { NumberInterface, SelectInterface } from "../src";
import { displayInSidebar } from "../src/sidebar";
import SidebarButton from "./SidebarButton.vue";

export default defineNode({
    type: "SidebarNode",
    inputs: {
        openButton: () =>
            new NodeInterface("Open Sidebar", undefined).setComponent(markRaw(SidebarButton)).setPort(false),
        sidebarOption1: () =>
            new SelectInterface("Dropdown", "foo", ["foo", "bar", "blub"]).use(displayInSidebar, true).setPort(false),
        sidebarOption2: () => new NumberInterface("Test", 4).setHidden(true).use(displayInSidebar, true),
    },
});
