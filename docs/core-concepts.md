# Core Concepts

Baklava consists of different building blocks.
This chapter provides a brief overview of those blocks as well as describe, how they relate to each other.

## Editor

The *editor* is the main model class in Baklava.
Everything lives inside the editor.
It provides functions for saving and loading, [registering node types](/editor/registering-nodes.md) and allows [subscribing to events](/event-system.md).

An editor instance always has one main *Graph*, called **root graph** (`editor.graph`).
It also maintains a list of all graph instances inside the editor, since graphs can have *[subgraphs](/editor/subgraphs.md)* inside them.
The list can be accessed via `editor.graphs`.

## Graph

A *graph* contains a set of [nodes](/nodes/nodes.md) as well as connections between these nodes.
It also provides functions to modify these sets and listen to events.

## Graph Template

A *graph template*  is basically a "save-state" of a graph.
It is used to implement *[subgraphs](/editor/subgraphs.md)*.

## Engine

An *[engine](/execution/setup.md)* is used to execute logic based on the graph.
