<script setup>
import ApiLink from "../components/ApiLink.vue";
</script>

# Commands

Commands are an abstraction to allow for extension of actions in Baklava. You can do everything related to commands using the <ApiLink type="interfaces" module="@baklavajs/renderer-vue" name="ICommandHandler"><code>commandHandler</code></ApiLink>

## Executing existing commands

You can invoke an existing command by its name:

```ts
import { Commands } from "@baklavajs/renderer-vue";

viewModel.commandHandler.executeCommand<Commands.UndoCommand>(Commands.UNDO_COMMAND);
```

## Creating new commands

Let's say you want to create a command that deletes the node with a given id and returns its node type. You can create the command like this:

```ts
import type { ICommandHandler, ICommand } from "../commands";

// first type argument is the return value of the command
// second type argument are the inputs to the command
type MyCommand = ICommand<string, [id: string]>;
viewModel.commandHandler.registerCommand<MyCommand>("MyCommand", {
    canExecute: (id) => !!viewModel.displayedGraph.findNodeById(id),
    execute: (id) => {
        const node = viewModel.displayedGraph.findNodeById(id)!;
        viewModel.displayedGraph.removeNode(node);
        return node.type;
    },
});

// for invoking this command:
viewModel.commandHandler.executeCommand<MyCommand>("MyCommand", true, "myNodeId");
```
