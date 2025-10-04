# Toolbar

The toolbar provides a set of clickable buttons for common editor operations. BaklavaJS includes a default set of commands like copy, paste, undo, redo, and more that can be customized to fit your application's needs.

## Default Toolbar

By default, the toolbar includes these commands:

- Copy - Copy selected nodes
- Paste - Paste copied nodes
- Delete Selected Nodes - Remove selected nodes from the graph
- Undo - Revert the last action
- Redo - Reapply a reverted action
- Zoom to Fit - Adjust the view to fit all nodes
- Box Select - Enable box selection mode
- Create Subgraph - Create a subgraph from selected nodes

## Enabling/Disabling the Toolbar

You can enable or disable the toolbar through view settings:

```typescript
// Enable toolbar
baklavaView.settings.toolbar.enabled = true;

// Disable toolbar
baklavaView.settings.toolbar.enabled = false;
```

## Using a Subset of Default Commands

If you want to use only specific default commands, you can import `TOOLBAR_COMMANDS` and select just the ones you need:

```typescript
import { useBaklava, TOOLBAR_COMMANDS } from "@baklavajs/renderer-vue";

const baklavaView = useBaklava();

// Use only copy, paste, and undo commands
baklavaView.settings.toolbar.commands = [TOOLBAR_COMMANDS.COPY, TOOLBAR_COMMANDS.PASTE, TOOLBAR_COMMANDS.UNDO];
```

## Adding Custom Commands

You can add your own custom commands to the toolbar by:

1. Registering a new command with the command handler
2. Creating a toolbar command object
3. Adding it to the toolbar commands array

```typescript
import { useBaklava, DEFAULT_TOOLBAR_COMMANDS } from "@baklavajs/renderer-vue";
import { defineComponent, h, markRaw } from "vue";

const baklavaView = useBaklava();

// 1. Register a custom command
const CLEAR_ALL_COMMAND = "CLEAR_ALL";
baklavaView.commandHandler.registerCommand(CLEAR_ALL_COMMAND, {
    execute: () => {
        // Clear all nodes from the graph
        baklavaView.displayedGraph.nodes.forEach((node) => {
            baklavaView.displayedGraph.removeNode(node);
        });
    },
    // Optional: Define when the command can be executed
    canExecute: () => baklavaView.displayedGraph.nodes.length > 0,
});

// 2. & 3. Add the command to the toolbar
baklavaView.settings.toolbar.commands = [
    ...DEFAULT_TOOLBAR_COMMANDS,
    {
        command: CLEAR_ALL_COMMAND,
        title: "Clear All", // Tooltip text
        icon: markRaw(
            defineComponent(() => {
                return () => h("div", "Clear All");
            }),
        ),
    },
];
```

## Creating Icons for Custom Commands

You can create custom icons for your toolbar commands in several ways:

1. Using a Vue component:

```typescript
import { defineComponent, h, markRaw } from "vue";

const ClearAllIcon = markRaw(defineComponent(() => {
  return () => h("div", { class: "my-icon-class" }, "X");
}));

// Use the component as the icon
{
  command: CLEAR_ALL_COMMAND,
  title: "Clear All",
  icon: ClearAllIcon
}
```

2. Using an SVG icon library:

```typescript
import { markRaw } from "vue";
import { TrashIcon } from "@heroicons/vue/24/outline";

// Use the imported icon component directly
{
  command: CLEAR_ALL_COMMAND,
  title: "Clear All",
  icon: markRaw(TrashIcon)
}
```

## Subgraph Toolbar Commands

When working with subgraphs, BaklavaJS provides special commands for navigating and working with them:

```typescript
import { TOOLBAR_SUBGRAPH_COMMANDS } from "@baklavajs/renderer-vue";

// Default subgraph commands include:
// - SAVE_SUBGRAPH: Save changes to the subgraph
// - SWITCH_TO_MAIN_GRAPH: Return to the main graph

// You can customize the subgraph toolbar:
baklavaView.settings.toolbar.subgraphCommands = [
    TOOLBAR_SUBGRAPH_COMMANDS.SWITCH_TO_MAIN_GRAPH,
    // Add your custom subgraph commands here
];
```

## Complete Toolbar Customization Example

Here's a complete example showing how to customize the toolbar:

```typescript
import { useBaklava, TOOLBAR_COMMANDS, TOOLBAR_SUBGRAPH_COMMANDS } from "@baklavajs/renderer-vue";
import { defineComponent, h, markRaw } from "vue";

const baklavaView = useBaklava();

// Register a custom command
const TOGGLE_MINIMAP_COMMAND = "TOGGLE_MINIMAP";
baklavaView.commandHandler.registerCommand(TOGGLE_MINIMAP_COMMAND, {
    execute: () => {
        baklavaView.settings.enableMinimap = !baklavaView.settings.enableMinimap;
    },
    canExecute: () => true,
});

// Customize the toolbar with a mix of default and custom commands
baklavaView.settings.toolbar.commands = [
    TOOLBAR_COMMANDS.COPY,
    TOOLBAR_COMMANDS.PASTE,
    TOOLBAR_COMMANDS.DELETE_NODES,
    TOOLBAR_COMMANDS.UNDO,
    TOOLBAR_COMMANDS.REDO,
    {
        command: TOGGLE_MINIMAP_COMMAND,
        title: "Toggle Minimap",
        icon: markRaw(
            defineComponent(() => {
                return () => h("div", "Map");
            }),
        ),
    },
];

// Customize subgraph commands
baklavaView.settings.toolbar.subgraphCommands = [
    TOOLBAR_SUBGRAPH_COMMANDS.SAVE_SUBGRAPH,
    TOOLBAR_SUBGRAPH_COMMANDS.SWITCH_TO_MAIN_GRAPH,
];
```

By following these patterns, you can fully customize the toolbar to meet your application's specific needs.
