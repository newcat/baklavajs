import * as Core from "@baklavajs/core";
import * as Engine from "@baklavajs/engine";
import * as InterfaceTypes from "@baklavajs/interface-types";
import * as RendererVue from "@baklavajs/renderer-vue";

import "@baklavajs/renderer-vue/dist/styles.css";

import { createApp, h } from "vue";
function createBaklava(element: Element): RendererVue.IBaklavaViewModel {
    let exportViewModel: RendererVue.IBaklavaViewModel;

    createApp({
        components: {
            "baklava-editor": RendererVue.EditorComponent,
        },
        setup() {
            const { viewModel } = RendererVue.useViewModel();
            exportViewModel = viewModel.value;
            return { viewModel };
        },
        render() {
            return h("baklava-editor", {
                props: {
                    viewModel: this.viewModel,
                },
            });
        },
    }).mount(element);

    return exportViewModel;
}

export { Core, Engine, InterfaceTypes, RendererVue, createBaklava };
