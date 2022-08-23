import * as Core from "@baklavajs/core";
import * as Engine from "@baklavajs/engine";
import * as InterfaceTypes from "@baklavajs/interface-types";
import * as RendererVue from "@baklavajs/renderer-vue";

import { createApp, h } from "vue";
function createBaklava(element: Element): RendererVue.IBaklavaViewModel {
    let exportViewModel: RendererVue.IBaklavaViewModel;

    createApp({
        setup() {
            const viewModel = RendererVue.useBaklava();
            exportViewModel = viewModel;
            return { viewModel };
        },
        render() {
            return h(RendererVue.EditorComponent, { viewModel: this.viewModel });
        },
    }).mount(element);

    return exportViewModel!;
}

export { Core, Engine, InterfaceTypes, RendererVue, createBaklava };
