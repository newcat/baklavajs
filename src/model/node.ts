import { VueConstructor } from "vue";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";

import generateId from "../utility/idGenerator";
import { NodeInterface } from "./nodeInterface";
import { INodeState } from "./state";

type OptionViewsObject = Record<string, VueConstructor>;

export abstract class Node {

    public abstract type: string;
    public abstract name: string;

    public id: string;
    public interfaces: Record<string, NodeInterface>;
    public optionViews: OptionViewsObject;
    public options: Record<string, any>;

    public position = { x: 0, y: 0 };
    public state = {};

    public get inputInterfaces() {
        return pickBy(this.interfaces, (i) => i.isInput);
    }

    public get outputInterfaces() {
        return pickBy(this.interfaces, (i) => !i.isInput);
    }

    public constructor() {
        this.id = "node_" + generateId();
        this.interfaces = this.getInterfaces();
        this.optionViews = this.getOptions();
        this.options = Object.keys(this.optionViews).reduce((p, k) => {
            p[k] = null;
            return p;
        }, {} as Record<string, any>);
    }

    public load(state: INodeState) {
        this.id = state.id;
        this.name = state.name;
        this.position = state.position;
        this.options = state.options;
        this.state = state.state;
        Object.keys(state.interfaces).forEach((k) => {
            if (this.interfaces[k]) {
                this.interfaces[k].load(state.interfaces[k]);
            }
        });
    }

    public save(): INodeState {
        return {
            type: this.type,
            id: this.id,
            name: this.name,
            position: this.position,
            options: this.options,
            state: this.state,
            interfaces: mapValues(this.interfaces, (i) => i.save())
        };
    }

    /**
     * The default implementation does nothing.
     * Overwrite this method to do calculation.
     */
    public calculate() {
        // Empty
    }

    protected abstract getInterfaces(): Record<string, NodeInterface>;
    protected abstract getOptions(): OptionViewsObject;

}
