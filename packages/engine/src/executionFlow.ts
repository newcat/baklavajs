import { NodeInterface } from "@baklavajs/core";
import type { IConnection } from "@baklavajs/core";

export const EXECUTION_FLOW_TYPE = "__baklava_exec";

export class ExecutionFlowInterface extends NodeInterface<boolean> {
    constructor(name: string) {
        super(name, false);
        this.engineType = EXECUTION_FLOW_TYPE;
    }
}

export function isExecutionFlow(intf: NodeInterface): boolean {
    return intf.engineType === EXECUTION_FLOW_TYPE;
}

export function isExecutionConnection(conn: IConnection): boolean {
    return isExecutionFlow(conn.from);
}
