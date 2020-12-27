// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Node } from "@baklavajs/core/dist/node";

declare module "@baklavajs/core/dist/node" {
    interface Node {
        position: { x: number; y: number };
        width: number;
        disablePointerEvents: boolean;
        twoColumn: boolean;
    }
}
