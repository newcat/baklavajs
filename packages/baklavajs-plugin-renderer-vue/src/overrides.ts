// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AbstractNode } from "@baklavajs/core/dist/node";

declare module "@baklavajs/core/dist/node" {
    interface AbstractNode {
        position: { x: number; y: number };
        width: number;
        disablePointerEvents: boolean;
        twoColumn: boolean;
    }
}
