// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NodeInterface } from "@baklavajs/core/dist/nodeInterface";

declare module "@baklavajs/core/dist/nodeInterface" {
    interface NodeInterface {
        allowMultipleConnections?: boolean;
    }
}
