# Interface Types

This plugin allows you to add types to node interfaces.
By default, two node interfaces can only be connected if they have the same type.
You can, however, override this behavior by using conversions.

## Usage

The plugin is included in the `baklavajs` package.
If you installed the packages individually, make sure to also install `@baklavajs/interface-types`

Afterwards you can use the plugin like this:

1. Create the types that you need

```js
// Create the types. It is recommended to define them
// in a separate file and import them when creating the nodes.
import { NodeInterfaceType } from "@baklavajs/interface-types";

export const stringType = new NodeInterfaceType("string");
export const numberType = new NodeInterfaceType("number");
export const booleanType = new NodeInterfaceType("boolean");
```

::: tip
The constructor of the `NodeInterfaceType` class expects a name for the type. This name can be arbitrary and is used for [styling](#styling).
:::

2. Create the `BaklavaInterfaceTypes` instance

```js
// In your App.vue or wherever you use the <baklava-editor>
import { BaklavaInterfaceTypes, NodeInterfaceType } from "@baklavajs/interface-types";
import { stringType, numberType, booleanType } from "./interfaceTypes";

const baklavaView = useBaklava();
const editor = baklavaView.editor;

const nodeInterfaceTypes = new BaklavaInterfaceTypes(editor, { viewPlugin: baklavaView });
nodeInterfaceTypes.addTypes(stringType, numberType, booleanType);
```

3. Set the types of your node interfaces

```js
// when creating a node
import { setType } from "@baklavajs/interface-types";
import { stringType } from "./interfaceTypes";

defineNode({
    inputs: {
        myInput: () => new NodeInterface("My Input", "default1").use(setType, stringType),
    },
    // ...
});
```

## TypeScript

When using TypeScript, it is recommended to specify the value type when creating a new `NodeInterfaceType`:

```ts
new NodeInterfaceType<number>("number");
```

This allows typechecking for both conversions, as well as when setting the type for a `NodeInterface`:

```ts
const stringType = new NodeInterfaceType<string>("string");
const numberType = new NodeInterfaceType<number>("number");

// Argument of type 'NodeInterfaceType<number>' is not assignable to parameter of type 'NodeInterfaceType<string>'.
//   Type 'number' is not assignable to type 'string'.
new NodeInterface<string>("Foo", "value").use(setType, numberType);

// Type 'boolean' is not assignable to type 'string'.
numberType.addConversion(stringType, () => false);
```

When using `allowMultipleConnections`, use the `setTypeForMultipleConnections` function:
```ts
new NodeInterface<string[]>("Foo", []).use(allowMultipleConnections).use(setTypeForMultipleConnections, numberType);
```

## Conversions

By default, only connections between two interfaces of the same type are allowed.
To allow one type to be connected to another type, you can create a conversion.
A conversion optionally accepts a _transformation function_, that can convert values.
This is used when executing the graph.

```ts
export const stringType = new NodeInterfaceType<string>("string");
export const numberType = new NodeInterfaceType<number>("number");

stringType.addConversion(numberType, (v) => parseFloat(v));
```

In this example, node interfaces with type `stringType` can be connected to node interfaces with type `numberType`.
Note, however, that conversions are not commutative, meaning while connections from `stringType` to `numberType` are allowed, connections from `numberType` to `stringType` are not!
To achieve this, another conversion is needed:

```ts
numberType.addConversion(stringType, (v) => (v !== null && v !== undefined && v.toString()) || "0");
```

## Styling

It is recommended to tell the user, what type a node interface has.
The plugin therefore adds the `data-interface-type` attribute when rendering the node interface.
This attribute can be used to style the interfaces using CSS.

Here is an example of how to set the color of the ports depending on the interface type:

```css
.baklava-node-interface[data-interface-type="string"] {
    --baklava-node-interface-port-color: green;
}

.baklava-node-interface[data-interface-type="number"] {
    --baklava-node-interface-port-color: red;
}

.baklava-node-interface[data-interface-type="boolean"] {
    --baklava-node-interface-port-color: purple;
}
```

## Options

The `BaklavaInterfaceTypes` can receive up to two arguments:

-   The editor instance (required)
-   Configuration options (not required)

The configuration options have the following format:

```ts
interface BaklavaInterfaceTypesOptions {
    viewPlugin?: IBaklavaView;
    engine?: BaseEngine<any, any>;
}
```

Both the `viewPlugin` and `engine` are optional. The `viewPlugin` is used for applying the `data-interface-type` attribute on node interfaces. The `engine` plugin is used for applying the conversions during calculation.

## Backend Usage

By default, the `BaklavaInterfaceTypes` constructor expects two arguments: the editor and the return value of the `useBaklava` function.
The second parameter, however, is optional and can be omitted.
This is especially useful when running BaklavaJS in the backend and just needing the conversions.

```js
new BaklavaInterfaceTypes(editor);
```
