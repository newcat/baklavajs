import generateId from "@/utility/idGenerator";
import NodeInterface from "./nodeInterface";

export default abstract class Node {

    /**
     * This must be overwritten by the child class
     * However, static abstract members are not allowed
     * in Typescript, so this can't be enforced by the compiler
     */
    public static type: string;

    public id: string;
    public interfaces: NodeInterface[] = [];

    public name: string;
    public position = { x: 0, y: 0 };

    public constructor(name: string) {
        this.id = "node_" + generateId();
        this.interfaces = this.getInterfaces();
        this.name = name;
    }

    protected abstract getInterfaces(): NodeInterface[];

}
