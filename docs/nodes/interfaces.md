<script setup>
import ApiLink from "../components/ApiLink.vue";
</script>

# Node Interfaces

Node interfaces define the inputs and outputs of a node.
They can be connected to eachother.
If the interface is not connected, it can display a Vue component which allows the user to manually set the value of the interface.

## Port

Each node interface can have a so-called _port_.
The port is used for connecting an output interface of one node to an input interface of another node.

Ports are displayed by default.
However, in certain scenarios it is not useful for an interface to have a port.
Examples for such scenarios include:

-   An output interface that is only used for displaying data instead of passing it on to other nodes
-   An input interface that is just used for direct input by the user and doesn't expect any data from other nodes

In such cases, the port can be turned off when creating the node interface:

```js
import { NodeInterface } from "baklavajs";
new NodeInterface("My Interface", 0).setPort(false);
```

## Display Component

As long as a node interface is not connected via its port, it can display a Vue component.
The component allows the user to set the value of the node interface manually.

The components receives these props:

-   `modelValue`: The value of the interface. The type of this prop is dependent on the type of the value
-   `node` (type: <ApiLink type="classes" module="@baklavajs/core" name="AbstractNode">AbstractNode</ApiLink>): The node instance in which this interface lives
-   `intf` (type: <ApiLink type="classes" module="@baklavajs/core" name="NodeInterface">NodeInterface</ApiLink>): The instance of the node interface

To update the value of the interface, the component can emit the `update:modelValue` event with the new value.

Here is an example component, that display a button that, when clicked, increases the value of the interface by one:

```vue
<!-- MyComponent.vue -->

<template>
    <button @click="count">{{ modelValue }}</button>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        modelValue: {
            type: Number,
            required: true,
        },
    },
    emits: ["update:modelValue"],
    setup(props, { emit }) {
        const count = () => {
            emit("update:modelValue", props.modelValue + 1);
        };
        return { count };
    },
});
</script>
```

To use this component, use the `setComponent()` function of the node interface:

```js
import { markRaw } from "vue";
import { NodeInterface } from "baklavajs";
import MyComponent from "MyComponent.vue";
new NodeInterface("My Interface", 0).setComponent(markRaw(MyComponent));
```

::: warning
Use Vue's `markRaw` function, since the node interface will be made reactive.
This can cause performance issues (and will also print warnings to the console).
:::

::: tip
If you'll be using the node interface multiple times, it makes sense to [create a custom node interface class](#extending-the-node-interface-class).
:::

## Middleware

The node interface class also provides the option to use _middleware_.
This can be used to set additional meta-data of the node interface in a type-safe way.
A middleware is essentially just a function that is called with the node interface as the first parameter and an arbitrary amount of other parameters.

Let's take the `setType` middleware of the [Interface Types Plugin](./interface-types) as an example:

```js
function setType(intf, type) {
    intf.type = type.name;
}

// usage - just an example, the interface types plugin works a bit different
new NodeInterface("My Interface", 0).use(setType, "number");
```

As can be seen, the function just sets a new `type` property on the interface to the value it receives as parameter.

## Extending the Node Interface Class

Always setting the component and middleware when creating a node interface is very tedious and leads to a lot of code duplication.
Instead, a new class can be created that extends the base `NodeInterface` (or one of the [pre-defined interfaces](./pre-defined-interfaces), which in turn are also just subclasses of the base `NodeInterface` class):

```js
import { markRaw } from "vue";
import { NodeInterface, setType } from "baklavajs";
import MyComponent from "MyComponent.vue";

class MyNodeInterface extends NodeInterface {
    constructor(name: string) {
        super(name, 0);
        this.setComponent(markRaw(MyComponent));
        // this is just an example, the interface types plugin works a bit different
        this.use(setType, "number");
    }
}

const i = new MyNodeInterface("My Interface");
i.value; // -> 0
i.component === MyComponent; // -> true
i.type; // -> "number"
```
