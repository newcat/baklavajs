<template>
    <div class="toolbar">
        <button
            v-for="c in commands"
            :key="c.command"
            class="toolbar-entry"
            :disabled="!plugin.commandHandler.canExecuteCommand(c.command)"
            @click="plugin.commandHandler.executeCommand(c.command)"
        >
            {{ c.title }}
        </button>

        <template v-if="isSubgraph">
            <button
                v-for="c in subgraphCommands"
                :key="c.command"
                class="toolbar-entry"
                :disabled="!plugin.commandHandler.canExecuteCommand(c.command)"
                @click="plugin.commandHandler.executeCommand(c.command)"
            >
                {{ c.title }}
            </button>
        </template>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { usePlugin } from "../utility";
import {
    COPY_COMMAND,
    PASTE_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    CREATE_SUBGRAPH_COMMAND,
    SAVE_SUBGRAPH_COMMAND,
} from "../commandList";
import { SWITCH_TO_MAIN_GRAPH_COMMAND } from "../graph";

export default defineComponent({
    setup() {
        const { plugin } = usePlugin();

        const isSubgraph = computed(() => plugin.value.displayedGraph.value !== plugin.value.editor.value.graph);

        const commands = [
            { command: COPY_COMMAND, title: "Copy" },
            { command: PASTE_COMMAND, title: "Paste" },
            { command: UNDO_COMMAND, title: "Undo" },
            { command: REDO_COMMAND, title: "Redo" },
            { command: CREATE_SUBGRAPH_COMMAND, title: "Create Subgraph" },
        ];

        const subgraphCommands = [
            { command: SAVE_SUBGRAPH_COMMAND, title: "Save Subgraph" },
            { command: SWITCH_TO_MAIN_GRAPH_COMMAND, title: "Back to Main Graph" },
        ];

        return { plugin, isSubgraph, commands, subgraphCommands };
    },
});
</script>
