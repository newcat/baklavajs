import { AbstractNode } from "@baklavajs/core/node";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NodeInterface } from "@baklavajs/core/nodeInterface";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Connection } from "@baklavajs/core/connection";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Graph } from "@baklavajs/core/graph";

declare module "@baklavajs/core/node" {
    interface AbstractNode {
        position: { x: number; y: number };
        width: number;
        disablePointerEvents: boolean;
        twoColumn: boolean;
        reverseY?: boolean;
    }
}

declare module "@baklavajs/core/nodeInterface" {
    interface NodeInterface {
        displayInSidebar?: boolean;
    }
}

declare module "@baklavajs/core/connection" {
    interface Connection {
        isInDanger?: boolean;
    }
}

declare module "@baklavajs/core/graph" {
    interface Graph {
        panning: { x: number; y: number };
        scaling: number;
        sidebar: { visible: boolean; nodeId: string; optionName: string };
        selectedNodes: AbstractNode[];
    }

    interface IGraphState {
        panning: { x: number; y: number };
        scaling: number;
    }
}

declare module "@baklavajs/core/graphTemplate" {
    interface GraphTemplate {
        panning?: { x: number; y: number };
        scaling?: number;
    }

    interface IGraphTemplateState {
        panning?: { x: number; y: number };
        scaling?: number;
    }
}
