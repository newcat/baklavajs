## Classes

<dl>
<dt><a href="#Editor">Editor</a></dt>
<dd><p>The main model class for BaklavaJS</p></dd>
<dt><a href="#Node">Node</a></dt>
<dd><p>Abstract base class for every node</p></dd>
<dt><a href="#NodeBuilder">NodeBuilder</a></dt>
<dd><p>Utility class for creating custom nodes</p></dd>
</dl>

<a name="Editor"></a>

## Editor
<p>The main model class for BaklavaJS</p>

**Kind**: global class  

* [Editor](#Editor)
    * [.nodeCalculationOrder](#Editor+nodeCalculationOrder)
    * [.typeComparer](#Editor+typeComparer)
    * [.registerNodeType(typeName, type)](#Editor+registerNodeType)
    * [.addNode(typeNameOrInstance)](#Editor+addNode)
    * [.removeNode(n)](#Editor+removeNode)
    * [.addConnection(from, to, [calculateNodeTree])](#Editor+addConnection) ⇒ <code>boolean</code>
    * [.removeConnection(c, [calculateNodeTree])](#Editor+removeConnection)
    * [.checkConnection(from, to)](#Editor+checkConnection) ⇒ <code>boolean</code>
    * [.calculate()](#Editor+calculate)
    * [.calculateNodeTree()](#Editor+calculateNodeTree)
    * [.load(state)](#Editor+load)
    * [.save()](#Editor+save) ⇒ <code>IState</code>

<a name="Editor+nodeCalculationOrder"></a>

### editor.nodeCalculationOrder
<p>The order, in which the nodes must be calculated</p>

**Kind**: instance property of [<code>Editor</code>](#Editor)  
<a name="Editor+typeComparer"></a>

### editor.typeComparer
<p>Use this to override the default type comparer.
The function will be called with a connection.
You can check whether this connection is allowed using
the fields <code>from</code> and <code>to</code> of the connection.</p>

**Kind**: instance property of [<code>Editor</code>](#Editor)  
**Default**: <code>(c) &#x3D;&gt; c.from.type &#x3D;&#x3D;&#x3D; c.to.type;</code>  
<a name="Editor+registerNodeType"></a>

### editor.registerNodeType(typeName, type)
<p>Register a new node type</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  

| Param | Type | Description |
| --- | --- | --- |
| typeName | <code>string</code> | <p>Name of the node (must be equal to the node's <code>type</code> field)</p> |
| type | <code>NodeConstructor</code> | <p>Actual type / constructor of the node</p> |

<a name="Editor+addNode"></a>

### editor.addNode(typeNameOrInstance)
<p>Add a node to the list of nodes.</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  

| Param | Type | Description |
| --- | --- | --- |
| typeNameOrInstance | <code>string</code> \| [<code>Node</code>](#Node) | <p>Either a registered node type or a node instance</p> |

<a name="Editor+removeNode"></a>

### editor.removeNode(n)
<p>Removes a node from the list.
Will also remove all connections from and to the node.</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  

| Param | Type | Description |
| --- | --- | --- |
| n | [<code>Node</code>](#Node) | <p>Reference to a node in the list.</p> |

<a name="Editor+addConnection"></a>

### editor.addConnection(from, to, [calculateNodeTree]) ⇒ <code>boolean</code>
<p>Add a connection to the list of connections.</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Returns**: <code>boolean</code> - <p>Whether the connection was successfully created</p>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| from | <code>NodeInterface</code> |  | <p>Start interface for the connection</p> |
| to | <code>NodeInterface</code> |  | <p>Target interface for the connection</p> |
| [calculateNodeTree] | <code>boolean</code> | <code>true</code> | <p>Whether to update the node calculation order after adding the connection</p> |

<a name="Editor+removeConnection"></a>

### editor.removeConnection(c, [calculateNodeTree])
<p>Remove a connection from the list of connections.</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| c | <code>Connection</code> |  | <p>Connection instance that should be removed.</p> |
| [calculateNodeTree] | <code>boolean</code> | <code>true</code> | <p>Whether to update the node calculation order. Set to false if you do multiple remove operations and call [calculateNodeTree](calculateNodeTree) manually after the last remove operation.</p> |

<a name="Editor+checkConnection"></a>

### editor.checkConnection(from, to) ⇒ <code>boolean</code>
<p>Checks, whether a connection between two node interfaces would be valid.</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Returns**: <code>boolean</code> - <p>Whether the connection is allowed or not.</p>  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>NodeInterface</code> | <p>The starting node interface (must be an output interface)</p> |
| to | <code>NodeInterface</code> | <p>The target node interface (must be an input interface)</p> |

<a name="Editor+calculate"></a>

### editor.calculate()
<p>Calculate all nodes</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
<a name="Editor+calculateNodeTree"></a>

### editor.calculateNodeTree()
<p>Recalculate the node calculation order</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
<a name="Editor+load"></a>

### editor.load(state)
<p>Load a state</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>IState</code> | <p>State to load</p> |

<a name="Editor+save"></a>

### editor.save() ⇒ <code>IState</code>
<p>Save a state</p>

**Kind**: instance method of [<code>Editor</code>](#Editor)  
**Returns**: <code>IState</code> - <p>Current state</p>  
<a name="Node"></a>

## *Node*
<p>Abstract base class for every node</p>

**Kind**: global abstract class  

* *[Node](#Node)*
    * *[.inputInterfaces](#Node+inputInterfaces)*
    * *[.outputInterfaces](#Node+outputInterfaces)*
    * **[.calculate()](#Node+calculate) ⇒ <code>any</code>**
    * *[.addInputInterface(name, type, option)](#Node+addInputInterface)*
    * *[.addOutputInterface(name, type)](#Node+addOutputInterface)*
    * *[.addOption(name, option, [defaultValue])](#Node+addOption)*
    * *[.getInterface(name)](#Node+getInterface)*
    * *[.getOptionValue(name)](#Node+getOptionValue)*
    * *[.setOptionValue(name, value)](#Node+setOptionValue)*

<a name="Node+inputInterfaces"></a>

### *node.inputInterfaces*
**Kind**: instance property of [<code>Node</code>](#Node)  
**Properties**

| Name | Description |
| --- | --- |
| All | <p>input interfaces of the node</p> |

<a name="Node+outputInterfaces"></a>

### *node.outputInterfaces*
**Kind**: instance property of [<code>Node</code>](#Node)  
**Properties**

| Name | Description |
| --- | --- |
| All | <p>output interfaces of the node</p> |

<a name="Node+calculate"></a>

### **node.calculate() ⇒ <code>any</code>**
<p>The default implementation does nothing.
Overwrite this method to do calculation.</p>

**Kind**: instance abstract method of [<code>Node</code>](#Node)  
**Returns**: <code>any</code> - <p>This method can return a promise.</p>  
<a name="Node+addInputInterface"></a>

### *node.addInputInterface(name, type, option)*
<p>Add an input interface to the node</p>

**Kind**: instance method of [<code>Node</code>](#Node)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>Name of the interface</p> |
| type | <code>string</code> | <p>Type of the interface</p> |
| option | <code>VueConstructor</code> | <p>An optional NodeOption which is displayed when the interface is not connected to set its value</p> |

<a name="Node+addOutputInterface"></a>

### *node.addOutputInterface(name, type)*
<p>Add an output interface to the node</p>

**Kind**: instance method of [<code>Node</code>](#Node)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>Name of the interface</p> |
| type | <code>string</code> | <p>Type of the interface</p> |

<a name="Node+addOption"></a>

### *node.addOption(name, option, [defaultValue])*
<p>Add a node option to the node</p>

**Kind**: instance method of [<code>Node</code>](#Node)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | <p>Name of the option</p> |
| option | <code>VueConstructor</code> |  | <p>Option component</p> |
| [defaultValue] | <code>any</code> | <code></code> | <p>Default value for the option</p> |

<a name="Node+getInterface"></a>

### *node.getInterface(name)*
<p>Get an interface by its name. If the node does not have an interface with
<code>name</code>, this method will throw an error.</p>

**Kind**: instance method of [<code>Node</code>](#Node)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>Name of the requested interface</p> |

<a name="Node+getOptionValue"></a>

### *node.getOptionValue(name)*
<p>Get the value of option <code>name</code></p>

**Kind**: instance method of [<code>Node</code>](#Node)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>Name of the option</p> |

<a name="Node+setOptionValue"></a>

### *node.setOptionValue(name, value)*
<p>Set the value of option <code>name</code></p>

**Kind**: instance method of [<code>Node</code>](#Node)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>Name of the option</p> |
| value | <code>any</code> | <p>New value</p> |

<a name="NodeBuilder"></a>

## NodeBuilder
<p>Utility class for creating custom nodes</p>

**Kind**: global class  

* [NodeBuilder](#NodeBuilder)
    * [.build()](#NodeBuilder+build) ⇒ <code>NodeConstructor</code>
    * [.addInputInterface(name, type, [option], [defaultValue])](#NodeBuilder+addInputInterface) ⇒ [<code>NodeBuilder</code>](#NodeBuilder)
    * [.addOutputInterface(name, type)](#NodeBuilder+addOutputInterface) ⇒ [<code>NodeBuilder</code>](#NodeBuilder)
    * [.addOption(name, option, [defaultValue])](#NodeBuilder+addOption) ⇒ [<code>NodeBuilder</code>](#NodeBuilder)
    * [.onCalculate(cb)](#NodeBuilder+onCalculate) ⇒ [<code>NodeBuilder</code>](#NodeBuilder)

<a name="NodeBuilder+build"></a>

### nodeBuilder.build() ⇒ <code>NodeConstructor</code>
<p>Build the node class.
This must be called as the last operation when building a node.</p>

**Kind**: instance method of [<code>NodeBuilder</code>](#NodeBuilder)  
**Returns**: <code>NodeConstructor</code> - <p>The generated node class</p>  
<a name="NodeBuilder+addInputInterface"></a>

### nodeBuilder.addInputInterface(name, type, [option], [defaultValue]) ⇒ [<code>NodeBuilder</code>](#NodeBuilder)
<p>Add an input interface to the node</p>

**Kind**: instance method of [<code>NodeBuilder</code>](#NodeBuilder)  
**Returns**: [<code>NodeBuilder</code>](#NodeBuilder) - <p>Current node builder instance for chaining</p>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>Name of the interface</p> |
| type | <code>string</code> | <p>Type of the interface</p> |
| [option] | <code>VueConstructor</code> | <p>A node option component to be displayed when the interface is not connected</p> |
| [defaultValue] | <code>any</code> | <p>Default value for the node option</p> |

<a name="NodeBuilder+addOutputInterface"></a>

### nodeBuilder.addOutputInterface(name, type) ⇒ [<code>NodeBuilder</code>](#NodeBuilder)
<p>Add an output interface to the node</p>

**Kind**: instance method of [<code>NodeBuilder</code>](#NodeBuilder)  
**Returns**: [<code>NodeBuilder</code>](#NodeBuilder) - <p>Current node builder instance for chaining</p>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>Name of the interface</p> |
| type | <code>string</code> | <p>Type of the interface</p> |

<a name="NodeBuilder+addOption"></a>

### nodeBuilder.addOption(name, option, [defaultValue]) ⇒ [<code>NodeBuilder</code>](#NodeBuilder)
<p>Add a node option to the node</p>

**Kind**: instance method of [<code>NodeBuilder</code>](#NodeBuilder)  
**Returns**: [<code>NodeBuilder</code>](#NodeBuilder) - <p>Current node builder instance for chaining</p>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | <p>Name of the option</p> |
| option | <code>VueConstructor</code> |  | <p>Option component</p> |
| [defaultValue] | <code>any</code> | <code></code> | <p>Default value for the option</p> |

<a name="NodeBuilder+onCalculate"></a>

### nodeBuilder.onCalculate(cb) ⇒ [<code>NodeBuilder</code>](#NodeBuilder)
<p>Register a callback for the calculation function.
The callback will receive the node instance as first parameter.
(If you do not use ES6 arrow functions, the node instance
will also be bound to <code>this</code>)</p>

**Kind**: instance method of [<code>NodeBuilder</code>](#NodeBuilder)  
**Returns**: [<code>NodeBuilder</code>](#NodeBuilder) - <p>Current node builder instance for chaining</p>  

| Param | Description |
| --- | --- |
| cb | <p>Callback to be executed when <code>calculate()</code> is called on the node</p> |

