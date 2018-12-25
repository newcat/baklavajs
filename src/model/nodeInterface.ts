import Node from "./node";
import generateId from "@/utility/idGenerator";

export default class NodeInterface {

    public id: string;
    public name: string;
    public isInput: boolean;
    public type: string;
    public parent: Node;

    public constructor(parent: Node, isInput: boolean, type: string, name: string) {
        this.parent = parent;
        this.isInput = isInput;
        this.id = "ni_" + generateId();
        this.type = type;
        this.name = name;
    }

}
