<script setup>
import ApiLink from "../components/ApiLink.vue";
import mermaid from "../components/Mermaid.vue";
</script>

# Subgraphs

Subgraphs are a way to have graphs inside graphs.
The core of the subgraph concept is a <ApiLink type="classes" module="@baklavajs/core" name="GraphTemplate">Graph Template</ApiLink>.
A graph template contains the saved state of a graph (nodes and connections).
It can be used to create one or multiple graphs based on the template.

Additionally, a graph template can have inputs and outputs.
This allows the graph template to act similar to a node and is the basis for GraphNodes.
With this concept, users can create their own reusable nodes from other nodes.

## Creating a Subgraph

Users can create subgraphs by

1. Selecting one or more nodes
2. Clicking on the "Create Subgraph" button in the toolbar

This action will also create an entry in the node palette so users are able to create graph nodes for this subgraph.

## Editing a Subgraph

Users can edit existing subgraphs by clicking the menu icon on either the subgraph in the node palette or any instance of a subgraph node and selecting "Edit Subgraph".
The editor will then switch to *Subgraph Mode*, meaning it displays the subgraph only.
Subgraph instances in the corresponding GraphNodes aren't updated until the "Save" or "Back" buttons in the toolbar are pressed.

When in *Subgraph Mode*, users can add inputs and output to the subgraph via the node palette.
Other subgraphs can also be added, unless this leads to an infinite recursion (e. g. when adding `Subgraph A` inside `Subgraph A`).
If that is the case for a specific subgraph it is not displayed in the node palette.

## How it works

Each Graph Node has an internal graph instance that is based on the graph template of the subgraph.


<mermaid>
{{`
graph TD
    subgraph Editor
        subgraph RG["Root Graph (displayed)"]
            subgraph GN1[GraphNode]
                G1[Graph]
            end
            subgraph GN2[GraphNode]
                G2[Graph]
            end
            subgraph GN3[GraphNode]
                G3[Graph]
            end
        end
        GT[Graph Template]
        G1 -->|references| GT
        G2 -->|references| GT
        G3 -->|references| GT
    end
`}}
</mermaid>

<mermaid>
{{`
graph TD
    subgraph Editor
        subgraph RG["Root Graph"]
            subgraph GN1[GraphNode]
                G1[Graph]
            end
            subgraph GN2[GraphNode]
                G2[Graph]
            end
            subgraph GN3[GraphNode]
                G3[Graph]
            end
        end
        DG["Temporary Graph (displayed)"]
        GT[Graph Template]
        G1 -->|references| GT
        G2 -->|references| GT
        G3 -->|references| GT
        DG -->|based on, updates| GT
    end
`}}
</mermaid>