import * as Core from "@baklavajs/core";
import * as PluginEngine from "@baklavajs/plugin-engine";
import * as PluginInterfaceTypes from "@baklavajs/plugin-interface-types";
import * as PluginOptionsVue from "@baklavajs/plugin-options-vue";
import * as PluginRendererVue from "@baklavajs/plugin-renderer-vue";

import "@baklavajs/plugin-renderer-vue/dist/styles.css";

import Vue from "vue";
function createBaklava(element: Element): PluginRendererVue.ViewPlugin {

    Vue.use(PluginRendererVue.BaklavaVuePlugin);

    const editor = new Core.Editor();
    const plugin = new PluginRendererVue.ViewPlugin();
    editor.use(plugin);

    new Vue({
        data() {
            return {
                plugin
            };
        },
        render(createElement) {
            return createElement("baklava-editor", {
                props: {
                    plugin: (this as any).plugin
                }
            });
        }
    }).$mount(element);

    return plugin;

}

export { Core, PluginEngine, PluginInterfaceTypes, PluginOptionsVue, PluginRendererVue, createBaklava };
