import { INodeState } from "@baklavajs/core";

export interface IViewNodeState extends INodeState<unknown, unknown> {
    position: { x: number; y: number };
    width: number;
    twoColumn: boolean;
}
