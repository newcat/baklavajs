export interface IConversion {
    targetType: string;
    transformationFunction(value: any): any;
}

export interface INodeInterfaceType {
    color: string;
    conversions: IConversion[];
}

export class NodeInterfaceTypeManager {

    public types: Record<string, INodeInterfaceType> = {};

    public setType(name: string, color: string): this {
        this.types[name] = { color, conversions: [] };
        return this;
    }

    public addConversion(from: string, to: string, transformationFunction: (value: any) => any): this {

        if (!this.types[from]) {
            throw new Error(`Can not add conversion for unknown type "${from}"`);
        }

        this.types[from].conversions.push({
            targetType: to,
            transformationFunction
        });

        return this;

    }

    public getConversion(from: string, to: string) {
        return this.types[from] && this.types[from].conversions.find((c) => c.targetType === to);
    }

    public canConvert(from: string, to: string): boolean {
        return from === to ||
            (this.types[from] && this.types[from].conversions.some((c) => c.targetType === to));
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

}
