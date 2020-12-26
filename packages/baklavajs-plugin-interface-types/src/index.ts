import type { IPlugin, Editor } from "@baklavajs/core";
// import type { ViewPlugin } from "@baklavajs/plugin-renderer-vue";

export interface IConversion {
    targetType: string;
    transformationFunction(value: any): any;
}

export interface INodeInterfaceType {
    color: string;
    conversions: IConversion[];
}

export class InterfaceTypePlugin implements IPlugin {
    public type = "InterfaceTypePlugin";

    private editor!: Editor;
    private types: Map<string, INodeInterfaceType> = new Map();

    public register(editor: Editor) {
        this.editor = editor;
        this.editor.plugins.forEach((p) => {
            if (p.type === "ViewPlugin") {
                // this.registerView((p as unknown) as ViewPlugin);
            }
        });
        this.editor.events.checkConnection.addListener(this, ({ from, to }) => {
            const fromType = (from as any).type;
            const toType = (to as any).type;
            if (!fromType || !toType) {
                return;
            } else if (!this.canConvert(fromType, toType)) {
                return false;
            }
        });
        this.editor.events.usePlugin.addListener(this, (plugin) => {
            if (plugin.type === "ViewPlugin") {
                // this.registerView((plugin as unknown) as ViewPlugin);
            }
        });
    }

    /**
     * Add a new node interface type
     * @param name Name of the type
     * @param color Color of the type. Will be used to color the ports of the node interfaces.
     */
    public addType(name: string, color: string): this {
        this.types.set(name, { color, conversions: [] });
        return this;
    }

    /**
     * A conversion makes it possible to connect two node interfaces altough they have different types.
     * @param from Type to convert from
     * @param to Type to convert to
     * @param transformationFunction
     * Will be called to transform the value from one type to another.
     * A transformation to convert the type `string` to `number` could be `parseInt`.
     */
    public addConversion(from: string, to: string, transformationFunction?: (value: any) => any): this {
        if (!this.types.has(from)) {
            throw new Error(`Can not add conversion for unknown type "${from}"`);
        }

        if (!transformationFunction) {
            transformationFunction = (value) => value;
        }

        this.types.get(from)!.conversions.push({
            targetType: to,
            transformationFunction,
        });

        return this;
    }

    public getConversion(from: string, to: string) {
        return this.types.has(from) && this.types.get(from)!.conversions.find((c) => c.targetType === to);
    }

    public canConvert(from: string, to: string): boolean {
        return (
            from === to || (this.types.has(from) && this.types.get(from)!.conversions.some((c) => c.targetType === to))
        );
    }

    public convert(from: string, to: string, value: any): any {
        if (from === to) {
            return value;
        } else {
            const c = this.getConversion(from, to);
            if (c) {
                return c.transformationFunction(value);
            } else {
                throw Error(`Can not convert from "${from}" to "${to}"`);
            }
        }
    }

    private registerView(/*vp: ViewPlugin*/) {
        // TODO: How do we do this?
        /*vp.hooks.renderInterface.tap(this, (intf) => {
            if (this.types.has(intf.data.type)) {
                const color = this.types.get(intf.data.type)!.color;
                const res = intf.$el.getElementsByClassName("__port") as HTMLElement[];
                Array.from(res).forEach((el) => {
                    el.classList.add("__port-" + intf.data.type);
                    el.style.backgroundColor = color;
                });
            }
            return intf;
        });*/
    }
}
