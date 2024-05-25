import { inject, provide, ref, Ref } from "vue";
import { NodeInterface } from "@baklavajs/core";
import { ITemporaryConnection, TemporaryConnectionState } from "../connection/connection";
import { useGraph } from "../utility";

const TEMPORARY_CONNECTION_HANDLER_INJECTION_SYMBOL = Symbol();
export interface ITemporaryConnectionHandler {
    hoveredOver: (ni: NodeInterface | undefined) => void;
    temporaryConnection: Ref<ITemporaryConnection | null>;
}

export function provideTemporaryConnection() {
    const { graph } = useGraph();

    const temporaryConnection = ref<ITemporaryConnection | null>(null) as Ref<ITemporaryConnection | null>;
    const hoveringOver = ref<NodeInterface | null>(null) as Ref<NodeInterface | null>;

    const onMouseMove = (ev: MouseEvent) => {
        if (temporaryConnection.value) {
            temporaryConnection.value.mx = ev.offsetX / graph.value.scaling - graph.value.panning.x;
            temporaryConnection.value.my = ev.offsetY / graph.value.scaling - graph.value.panning.y;
        }
    };

    const onMouseDown = () => {
        if (hoveringOver.value) {
            if (temporaryConnection.value) {
                // onMouseUp();
                // for creating connections with clicking instead of dragging
                return;
            }

            // if this interface is an input and already has a connection
            // to it, remove the connection and make it temporary
            const connection = graph.value.connections.find((c) => c.to === hoveringOver.value);
            if (hoveringOver.value.isInput && connection) {
                temporaryConnection.value = {
                    status: TemporaryConnectionState.NONE,
                    from: connection.from,
                };
                graph.value.removeConnection(connection);
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
            if (temporaryConnection.value.from === hoveringOver.value) {
                // for creating connections with clicking instead of dragging
                return;
            }

            graph.value.addConnection(temporaryConnection.value.from, temporaryConnection.value.to!);
        }
        temporaryConnection.value = null;
    };

    const hoveredOver = (ni: NodeInterface | undefined) => {
        hoveringOver.value = ni ?? null;
        if (ni && temporaryConnection.value) {
            temporaryConnection.value.to = ni;
            const checkConnectionResult = graph.value.checkConnection(
                temporaryConnection.value.from,
                temporaryConnection.value.to,
            );
            temporaryConnection.value.status = checkConnectionResult.connectionAllowed
                ? TemporaryConnectionState.ALLOWED
                : TemporaryConnectionState.FORBIDDEN;

            if (checkConnectionResult.connectionAllowed) {
                const ids = checkConnectionResult.connectionsInDanger.map((c) => c.id);
                graph.value.connections.forEach((c) => {
                    if (ids.includes(c.id)) {
                        c.isInDanger = true;
                    }
                });
            }
        } else if (!ni && temporaryConnection.value) {
            temporaryConnection.value.to = undefined;
            temporaryConnection.value.status = TemporaryConnectionState.NONE;
            graph.value.connections.forEach((c) => {
                c.isInDanger = false;
            });
        }
    };

    provide<ITemporaryConnectionHandler>(TEMPORARY_CONNECTION_HANDLER_INJECTION_SYMBOL, {
        temporaryConnection,
        hoveredOver,
    });

    return { temporaryConnection, onMouseMove, onMouseDown, onMouseUp, hoveredOver };
}

export function useTemporaryConnection() {
    const temporaryConnection = inject<ITemporaryConnectionHandler>(TEMPORARY_CONNECTION_HANDLER_INJECTION_SYMBOL);
    if (!temporaryConnection) {
        throw new Error("useTemporaryConnection must be used within a BaklavaEditor");
    }
    return temporaryConnection;
}
