import { AbstractNode, INodeState, Node } from "@baklavajs/core";

export interface IViewNodeState extends INodeState<unknown, unknown> {
    position: { x: number; y: number };
    width: number;
    twoColumn: boolean;
}

export function setViewNodeProperties(node: AbstractNode, token: Symbol) {
    node.position = node.position ?? { x: 0, y: 0 };
    node.disablePointerEvents = false;
    node.twoColumn = node.twoColumn ?? false;
    node.width = node.width ?? 200;
    node.hooks.afterSave.tap(token, (state) => {
        (state as IViewNodeState).position = node.position;
        (state as IViewNodeState).width = node.width;
        (state as IViewNodeState).twoColumn = node.twoColumn;
        return state;
    });
    node.hooks.beforeLoad.tap(token, (state) => {
        node.position = (state as IViewNodeState).position ?? { x: 0, y: 0 };
        node.width = (state as IViewNodeState).width ?? 200;
        node.twoColumn = (state as IViewNodeState).twoColumn ?? false;
        return state;
    });
}
