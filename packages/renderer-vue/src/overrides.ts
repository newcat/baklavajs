// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AbstractNode } from "@baklavajs/core/dist/node";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NodeInterface } from "@baklavajs/core/dist/nodeInterface";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Connection } from "@baklavajs/core/dist/connection";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Graph } from "@baklavajs/core/dist/graph";

declare module "@baklavajs/core/dist/node" {
    interface AbstractNode {
        position: { x: number; y: number };
        width: number;
        disablePointerEvents: boolean;
        twoColumn: boolean;
    }
}

declare module "@baklavajs/core/dist/nodeInterface" {
    interface NodeInterface {
        displayInSidebar?: boolean;
    }
}

declare module "@baklavajs/core/dist/connection" {
    interface Connection {
        isInDanger?: boolean;
    }
}

declare module "@baklavajs/core/dist/graph" {
    interface Graph {
        panning: { x: number; y: number };
        scaling: number;
        sidebar: { visible: boolean; nodeId: string; optionName: string };
        selectedNodes: AbstractNode[];
    }
}

declare module "@baklavajs/core/dist/graphTemplate" {
    interface GraphTemplate {
        panning?: { x: number; y: number };
        scaling?: number;
    }

    interface IGraphTemplateState {
        panning?: { x: number; y: number };
        scaling?: number;
    }
}
