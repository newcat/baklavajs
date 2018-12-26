import Vue, { VueConstructor } from "vue";
import generateId from "@/utility/idGenerator";
import NodeInterface from "./nodeInterface";
import INodeOption from "./nodeOption";

type OptionsType = Record<string, VueConstructor<Vue & INodeOption>>;

export default abstract class Node {

    public abstract type: string;
    public abstract name: string;

    public id: string;
    public interfaces: NodeInterface[] = [];
    public options: OptionsType;

    public position = { x: 0, y: 0 };

    public constructor() {
        this.id = "node_" + generateId();
        this.interfaces = this.getInterfaces();
        this.options = this.getOptions() as OptionsType;
    }

    protected abstract getInterfaces(): NodeInterface[];
    protected abstract getOptions(): Record<string, VueConstructor>;

}
