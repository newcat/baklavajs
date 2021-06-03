import { AbstractNode, INodeState, Node } from "@baklavajs/core";

export interface IViewNodeState extends INodeState<unknown, unknown> {
    position: { x: number; y: number };
    width: number;
    twoColumn: boolean;
}

export function setViewNodeProperties(node: AbstractNode) {
    node.position = node.position ?? { x: 0, y: 0 };
    node.disablePointerEvents = false;
    node.twoColumn = node.twoColumn ?? false;
    node.width = node.width ?? 200;
}
