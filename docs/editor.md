# Editor
The editor class is the main class of the model. You can do most things like adding/removing nodes and connections, loading/saving, ... from here.

> Please only use the provided functions and do not modify fields directly.

- [Editor](#editor)
  - [Nodes](#nodes)
    - [Adding nodes](#adding-nodes)
    - [Removing nodes](#removing-nodes)
  - [Connections](#connections)
    - [Connection validity](#connection-validity)
    - [Adding connections](#adding-connections)
    - [Removing connections](#removing-connections)
  - [Calculation](#calculation)
  - [Saving / Export](#saving--export)
  - [Loading / Import](#loading--import)


## Nodes
> You should register all [custom node types](nodes.md) in the editor.
> It will work without, however, loading will not be possible.

To register your node types call the `registerNodeType(typeName: string, type: NodeConstructor)` function. The first argument is the name of the node type. This is the string you set in your class as `type`. The other argument is the constructor itself (just pass the class in here).

### Adding nodes
`addNode(typeNameOrInstance: string|Node)`  
This function takes either a registered node type or a node instance and adds it to the list of nodes.

### Removing nodes
`removeNode(n: Node)`  
Pass an instance of a node in the `nodes` list as argument to remove the node from the list. This will also remove all connections from and to the node.


## Connections
Connections connect an output of a node to an input of another node.

> Please never instantiate the class `Connection` yourself. This will connect the nodes, but as the connection is not included in the `connections` list, errors may arise. If you absolutely need an implementation of the `IConnection` interface, use the `DummyConnection` class.

### Connection validity
To prevent infinite loops in node calculation, the graph must not contain cycles. This will be checked whenever a connection is added.

Additionally, you can allow connections only between certain interface types. By default, connections are only allowed between interfaces with the same type. If you want to change this behavior, provide a custom predicate to `typeComparer` field.

The `typeComparer` is a function, that takes an `IConnection` as a parameter and returns a boolean that specifies, whether this connection is allowed or not. The default implementation is:
```ts
(c) => c.from.type === c.to.type;
```

### Adding connections
`addConnection(from: NodeInterface, to: NodeInterface, calculateNodeTree = true): boolean`  
This method adds a connection from a interface to another. If `calculateNodeTree` is not explicitly set to `false`, it will update the node calculation order (see TODO). If you add multiple connections in a bulk, set this parameter to false to increase performance and call `calculateNodeTree()` manually afterwards.

The function returns `true` when the connection was successfully created.

### Removing connections
`removeConnection(c: Connection, calculateNodeTree = true)`  
Use this method to remove a connection.
> Never remove a connection from the list yourself! This will result in the connection not being GCed.
> Always use the `removeConnection` method.


## Calculation
The editor model also provides a convenience function to calculate all nodes based on the node tree. For this to work, you need to implement the `calculate()` method when creating custom nodes.
You can also [export](#saving--export) the editor state and node tree to do calculations yourself. This could be useful if you have heavy logic that you want to perform in WASM or offload to a server.
However, for simple use cases, using the `calculate()` method should be fine.


## Saving / Export
You can export the whole state to a JS Object using the `save()` method. The returned object is serializable, so you can store the JSON somewhere else and restore the state later using the `load(state)` method.


## Loading / Import
> Before loading a state, make sure you have registered all node types!

Use the `load(state)` method with a previously saved state.