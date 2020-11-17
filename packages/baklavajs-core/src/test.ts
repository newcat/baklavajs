interface INodeIO<T = any> {
    value: T;
}

type IODefinition = Record<string, INodeIO>;
type IODefinitionValues<D extends IODefinition> = {
    [K in keyof D]: D[K] extends INodeIO<infer T> ? T : never;
};
type CalcFunc<I extends IODefinition, O extends IODefinition> = (
    inputs: IODefinitionValues<I>
) => IODefinitionValues<O>;

type T1 = IODefinitionValues<{ hello: { value: number } }>;
//   T1 = type T1 = { hello: number; }
type T2 = CalcFunc<{ test: { value: number } }, { ret: { value: boolean } }>;
//   T2 =
// (inputs: IODefinitionValues<{
//     test: {
//         value: number;
//     };
// }>) => IODefinitionValues<{
//     ret: {
//         value: boolean;
//     };
// }>

// expected:
// T2 = (inputs: { test: number; }) => { ret: boolean; }

const blub: T2 = (def: any) => {
    return def;
}

type NodeDefinition<I extends IODefinition, O extends IODefinition> = {
    setup(): { inputs: I; outputs: O };
    calculate?: CalcFunc<I, O>;
};

function defineNode<I extends IODefinition, O extends IODefinition>(def: NodeDefinition<I, O>) {}

defineNode({
    setup() {
        return {
            inputs: {
                a: { value: 3 },
                b: { value: "bar" }
            },
            outputs: {
                c: { value: false },
                d: { value: "foo" }
            }
        };
    },
    calculate(inputs) {
        return {
            c: inputs.v,
            d: inputs.a,
            foo: 3
        };
    }
});

const x = blub({ test: 3 });

