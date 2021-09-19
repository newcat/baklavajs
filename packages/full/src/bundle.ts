import * as Core from "@baklavajs/core";
import * as PluginEngine from "@baklavajs/engine";
import * as PluginInterfaceTypes from "@baklavajs/interface-types";
import * as PluginRendererVue from "@baklavajs/renderer-vue";

import "@baklavajs/renderer-vue/dist/styles.css";

import { createApp, h } from "vue";
function createBaklava(element: Element): PluginRendererVue.ViewPlugin {
    const editor = new Core.Editor();
    const plugin = new PluginRendererVue.ViewPlugin();
    editor.use(plugin);

    createApp({
        components: {
            "baklava-editor": PluginRendererVue.EditorComponent,
        },
        data() {
            return {
                plugin,
            };
        },
        render() {
            return h("baklava-editor", {
                props: {
                    plugin: this.plugin,
                },
            });
        },
    }).mount(element);

    return plugin;
}

export { Core, PluginEngine, PluginInterfaceTypes, PluginRendererVue, createBaklava };
