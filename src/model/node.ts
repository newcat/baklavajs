import { VueConstructor } from "vue";
import generateId from "@/utility/idGenerator";
import NodeInterface from "./nodeInterface";

type OptionViewsObject = StringRecord<VueConstructor>;

export default abstract class Node {

    public abstract type: string;
    public abstract name: string;

    public id: string;
    public interfaces: StringRecord<NodeInterface>;
    public optionViews: OptionViewsObject;
    public options: StringRecord<any>;

    public position = { x: 0, y: 0 };
    public state = {};

    public constructor() {
        this.id = "node_" + generateId();
        this.interfaces = this.getInterfaces();
        this.optionViews = this.getOptions();
        this.options = Object.keys(this.optionViews).reduce((p, k) => {
            p[k] = null;
            return p;
        }, {} as StringRecord<any>);
    }

    /**
     * The default implementation does nothing.
     * Overwrite this method to do calculation.
     */
    public calculate() {
        // Empty
    }

    protected abstract getInterfaces(): StringRecord<NodeInterface>;
    protected abstract getOptions(): OptionViewsObject;

}
