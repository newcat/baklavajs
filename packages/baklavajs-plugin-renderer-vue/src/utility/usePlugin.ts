import { Ref, inject, provide } from "vue";
import { IBaklavaView } from "../useBaklava";

// const injectionKey = Symbol("viewPlugin");

// workaround: Currently, self-injecting is not possible.
// so we use a singleton to provide this functionality.
// RFC: https://github.com/vuejs/rfcs/pull/254
let pluginRef: Ref<IBaklavaView> | null = null;

export function providePlugin(plugin: Ref<IBaklavaView>) {
    // provide(injectionKey, plugin);
    pluginRef = plugin;
}

export function usePlugin(): { plugin: Ref<IBaklavaView> } {
    // let plugin = inject<Ref<ViewPlugin>>(injectionKey);
    if (!pluginRef) {
        throw new Error("providePlugin() must be called before usePlugin()");
    }
    return {
        plugin: pluginRef,
    };
}
