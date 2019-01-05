# NodeInterfaces

## Constructor
The constructor accepts the following parameters
- `parent: Node` | The node instance which this interface belongs to
- `isInput: boolean` | Specifies, whether this is an input (=`true`) or an output (=`false`) interface
- `type: string` | Sets the type of the interface. See [Types](#Types)
- `option?: VueConstructor` | This is an optional parameter. See [Option](#Option)

## Types
The type can be any word (spaces would break the CSS class).
By default, connections are only allowed between NodeInterfaces, that have the same type.
The "dot" will also be assigned the following CSS class: `--iftype-{TYPE}`.
For example, if the type is "string", the CSS class would be `--iftype-string`.
You can use this to [style](styling.md) your interfaces.

## Option
A node interface, which is not connected, can display a component to allow the user to change its value.
This can be any component that supports the `v-model` directive.
