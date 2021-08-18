/**
 * @module @baklavajs/plugin-interface-types
 */

import type { Editor, NodeInterface } from "@baklavajs/core";
import type { IBaklavaView } from "@baklavajs/plugin-renderer-vue";

export interface IConversion<I, O> {
    targetType: string;
    transformationFunction(value: I): O;
}

export class NodeInterfaceType<T> {
    public conversions: Array<IConversion<T, any>> = [];
    public constructor(public name: string) {}

    /**
     * A conversion makes it possible to connect two node interfaces although they have different types.
     * @param to Type to convert to
     * @param transformationFunction
     * Will be called to transform the value from one type to another.
     * A transformation to convert the type `string` to `number` could be `parseInt`.
     *
     * @returns the instance the method was called on for chaining
     */
    public addConversion<O>(to: NodeInterfaceType<O>, transformationFunction: (value: T) => O = (value: any) => value) {
        this.conversions.push({
            targetType: to.name,
            transformationFunction,
        });
        return this;
    }
}

export const setType = <T>(intf: NodeInterface<T>, type: NodeInterfaceType<T>) => {
    intf.type = type.name;
};

export class BaklavaInterfaceTypes {
    private editor: Editor;
    private types: Map<string, NodeInterfaceType<any>> = new Map();

    public constructor(editor: Editor, viewPlugin?: IBaklavaView) {
        this.editor = editor;

        this.editor.graphEvents.checkConnection.subscribe(this, ({ from, to }) => {
            const fromType = (from as any).type;
            const toType = (to as any).type;
            if (!fromType || !toType) {
                return;
            } else if (!this.canConvert(fromType, toType)) {
                return false;
            }
        });

        this.editor.connectionHooks.transfer.subscribe(this, (value, connection) => {
            const fromType = connection.from.type;
            const toType = connection.to.type;
            if (!fromType || !toType) {
                return value;
            }
            return this.convert(fromType, toType, value);
        });

        if (viewPlugin) {
            viewPlugin.hooks.renderInterface.subscribe(this, ({ intf, el }) => {
                if (intf.type) {
                    el.setAttribute("data-interface-type", intf.type);
                }
                return { intf, el };
            });
        }
    }

    /**
     * Add a new node interface type
     * @param {...*} types The types to add
     */
    public addTypes(...types: Array<NodeInterfaceType<unknown>>): this {
        types.forEach((t) => {
            this.types.set(t.name, t);
        });
        return this;
    }

    public getConversion<I = any, O = any>(from: string, to: string): IConversion<I, O> | null {
        return this.types.get(from)?.conversions.find((c) => c.targetType === to) ?? null;
    }

    public canConvert(from: string, to: string): boolean {
        return (
            from === to || (this.types.has(from) && this.types.get(from)!.conversions.some((c) => c.targetType === to))
        );
    }

    public convert<I = any, O = any>(from: string, to: string, value: I): O {
        if (from === to) {
            return value as unknown as O;
        } else {
            const c = this.getConversion(from, to);
            if (c) {
                return c.transformationFunction(value);
            } else {
                throw Error(`Can not convert from "${from}" to "${to}"`);
            }
        }
    }
}
