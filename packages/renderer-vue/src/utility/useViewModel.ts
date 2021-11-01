import { Ref } from "vue";
import { IBaklavaViewModel } from "../viewModel";

// const injectionKey = Symbol("viewModel");

// workaround: Currently, self-injecting is not possible.
// so we use a singleton to provide this functionality.
// RFC: https://github.com/vuejs/rfcs/pull/254
let viewModelRef: Ref<IBaklavaViewModel> | null = null;

export function providePlugin(viewModel: Ref<IBaklavaViewModel>) {
    // provide(injectionKey, plugin);
    viewModelRef = viewModel;
}

export function useViewModel(): { viewModel: Ref<IBaklavaViewModel> } {
    // let viewModel = inject<Ref<IBaklavaViewModel>>(injectionKey);
    if (!viewModelRef) {
        throw new Error("providePlugin() must be called before usePlugin()");
    }
    return {
        viewModel: viewModelRef,
    };
}
