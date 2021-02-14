import { provide, ref, Ref } from "vue";
import { NodeInterface } from "@baklavajs/core";
import { ITemporaryConnection, TemporaryConnectionState } from "../connection/connection";
import { ViewPlugin } from "../viewPlugin";

export function useTemporaryConnection(pluginRef: Ref<ViewPlugin>) {
    const temporaryConnection = ref<ITemporaryConnection | null>(null) as Ref<ITemporaryConnection | null>;
    const hoveringOver = ref<NodeInterface | null>(null) as Ref<NodeInterface | null>;

    const onMouseMove = (ev: MouseEvent) => {
        if (temporaryConnection.value) {
            temporaryConnection.value.mx = ev.offsetX / pluginRef.value.scaling - pluginRef.value.panning.x;
            temporaryConnection.value.my = ev.offsetY / pluginRef.value.scaling - pluginRef.value.panning.y;
        }
    };

    const onMouseDown = () => {
        if (hoveringOver.value) {
            // if this interface is an input and already has a connection
            // to it, remove the connection and make it temporary
            const connection = pluginRef.value.editor.connections.find((c) => c.to === hoveringOver.value);
            if (hoveringOver.value.isInput && connection) {
                temporaryConnection.value = {
                    status: TemporaryConnectionState.NONE,
                    from: connection.from,
                };
                pluginRef.value.editor.removeConnection(connection);
            } else {
                temporaryConnection.value = {
                    status: TemporaryConnectionState.NONE,
                    from: hoveringOver.value,
                };
            }

            temporaryConnection.value.mx = undefined;
            temporaryConnection.value.my = undefined;
        }
    };

    const onMouseUp = () => {
        if (temporaryConnection.value && hoveringOver.value) {
            pluginRef.value.editor.addConnection(temporaryConnection.value.from, temporaryConnection.value.to!);
        }
        temporaryConnection.value = null;
    };

    const hoveredOver = (ni: NodeInterface | undefined) => {
        hoveringOver.value = ni ?? null;
        if (ni && temporaryConnection.value) {
            temporaryConnection.value.to = ni;
            temporaryConnection.value.status = pluginRef.value.editor.checkConnection(
                temporaryConnection.value.from,
                temporaryConnection.value.to
            )
                ? TemporaryConnectionState.ALLOWED
                : TemporaryConnectionState.FORBIDDEN;
            // TODO: Move this into the engine plugin, create general interface for plugins to use
            /*if (this.hasEnginePlugin) {
            this.connections
                .filter((c) => c.to === ni)
                .forEach((c) => {
                    (c as ITransferConnection).isInDanger = true;
                });
        }*/
        } else if (!ni && temporaryConnection.value) {
            temporaryConnection.value.to = undefined;
            temporaryConnection.value.status = TemporaryConnectionState.NONE;
            pluginRef.value.editor.connections.forEach((c) => {
                c.isInDanger = false;
            });
        }
    };

    provide("hoveredOver", hoveredOver);

    return { temporaryConnection, onMouseMove, onMouseDown, onMouseUp };
}
