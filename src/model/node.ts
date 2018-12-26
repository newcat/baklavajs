import generateId from "@/utility/idGenerator";
import NodeInterface from "./nodeInterface";

export default abstract class Node {

    public abstract type: string;
    public abstract name: string;

    public id: string;
    public interfaces: NodeInterface[] = [];

    public position = { x: 0, y: 0 };

    public constructor() {
        this.id = "node_" + generateId();
        this.interfaces = this.getInterfaces();
    }

    protected abstract getInterfaces(): NodeInterface[];

}
