# Subgraphs

Subgraphs are a way to have graphs inside graphs.
The core of the subgraph concept is a <ApiLink type="classes" module="@baklavajs/core" name="GraphTemplate">Graph Template</ApiLink>.
A graph template contains the saved state of a graph (nodes and connections).
It can be used to create one or multiple graphs based on the template.

Additionally, a graph template can have inputs and outputs.
This allows the graph template to act similar to a node and is the basis for GraphNodes.

## Creating a Subgraph

Users can create subgraphs by

1. Selecting one or more nodes
2. Clicking on the "Create Subgraph" button in the toolbar

This action will also create an entry in the node palette so users are able to create graph nodes for this subgraph.

## Editing a Subgraph
