import { AbstractNode, INodeState } from "@baklavajs/core";

export interface IViewNode extends AbstractNode {
    position: { x: number; y: number };
    width: number;
    disablePointerEvents: boolean;
    twoColumn: boolean;
}

export interface IViewNodeState extends INodeState<unknown, unknown> {
    position: { x: number; y: number };
    width: number;
    twoColumn: boolean;
}
