# Editor <!-- omit in toc -->
The editor class is the main class of Baklava's core. You can do most things like adding/removing nodes and connections or loading/saving from here.

> Please only use the provided functions and do not modify fields directly.

- [Nodes](#nodes)
  - [Adding / removing nodes](#adding--removing-nodes)
- [Connections](#connections)
  - [Connection validity](#connection-validity)
  - [Adding / removing connections](#adding--removing-connections)
- [Saving / Export](#saving--export)
- [Loading / Import](#loading--import)

## Nodes
> You should register all [custom node types](nodes.md) in the editor.
> It will work without, however, loading will not be possible.

To register your node types call the [registerNodeType](!!API%{ "module": "@baklavajs/core", "type": "class", "name": "Editor", "field": "registerNodeType" }%) function. The first argument is the name of the node type. This is the string you set in your class as `type`. The other argument is the constructor itself (just pass the class in here).

### Adding / removing nodes
[addNode](!!API%{ "module": "@baklavajs/core", "type": "class", "name": "Editor", "field": "addNode" }%)  
This function takes a node instance and adds it to the list of nodes.

[removeNode](!!API%{ "module": "@baklavajs/core", "type": "class", "name": "Editor", "field": "removeNode" }%)  
Pass an instance of a node in the `nodes` list as argument to remove the node from the list. This will also remove all connections from and to the node.


## Connections
Connections connect an output of a node to an input of another node.

> Please never instantiate the class `Connection` yourself. This will connect the nodes, but as the connection is not included in the `connections` list, errors may arise. If you absolutely need an implementation of the `IConnection` interface, use the `DummyConnection` class.

### Connection validity
By default, every connection is allowed. However, there are certain exceptions:
* The connection is between two interfaces of the same node
* The connection is between two output or two input interfaces

Additionally, plugins can prevent connections from being created. For example, the [Interface Types](/plugins/interface-types.md) plugin will prevent connections between interfaces of different types unless a conversion exists. Similarly, the [Engine](/plugins/engine.md) plugin will prevent connections that would result in a cycle in the graph.

### Adding / removing connections
Use the [addConnection](!!API%{ "module": "@baklavajs/core", "type": "class", "name": "Editor", "field": "addConnection" }%) and [removeConnection()](!!API%{ "module": "@baklavajs/core", "type": "class", "name": "Editor", "field": "removeConnection" }%) methods
for adding or removing connections.

> Never remove a connection from the list yourself! This will result in the connection not being GCed.
> Always use the `removeConnection` method.


## Saving / Export
You can export the whole state to a JS Object using the [save](!!API%{ "module": "@baklavajs/core", "type": "class", "name": "Editor", "field": "save" }%) method. The returned object is serializable, so you can store the JSON somewhere else and restore the state later using the [load](!!API%{ "module": "@baklavajs/core", "type": "class", "name": "Editor", "field": "load" }%) method.


## Loading / Import
> Before loading a state, make sure you have registered all node types!

Use the [load](!!API%{ "module": "@baklavajs/core", "type": "class", "name": "Editor", "field": "load" }%) method with a previously saved state.