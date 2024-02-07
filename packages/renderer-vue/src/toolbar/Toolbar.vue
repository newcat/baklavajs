<template>
    <div class="baklava-toolbar">
        <toolbar-button v-for="c in commands" :key="c.command" :command="c.command" :title="c.title" :icon="c.icon" />

        <template v-if="isSubgraph">
            <toolbar-button
                v-for="c in subgraphCommands"
                :key="c.command"
                :command="c.command"
                :title="c.title"
                :icon="c.icon"
            />
        </template>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useViewModel } from "../utility";
import {
    COPY_COMMAND,
    PASTE_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    CREATE_SUBGRAPH_COMMAND,
    SAVE_SUBGRAPH_COMMAND,
} from "../commandList";
import { DELETE_NODES_COMMAND, SWITCH_TO_MAIN_GRAPH_COMMAND } from "../graph";
import * as Icons from "../icons";
import ToolbarButton from "./ToolbarButton.vue";

export default defineComponent({
    components: { ToolbarButton },
    setup() {
        const { viewModel } = useViewModel();

        const isSubgraph = computed(() => viewModel.value.displayedGraph !== viewModel.value.editor.graph);

        const commands = [
            { command: COPY_COMMAND, title: "Copy", icon: Icons.Copy },
            { command: PASTE_COMMAND, title: "Paste", icon: Icons.Clipboard },
            { command: DELETE_NODES_COMMAND, title: "Delete", icon: Icons.TrashBin },
            { command: UNDO_COMMAND, title: "Undo", icon: Icons.ArrowBackUp },
            { command: REDO_COMMAND, title: "Redo", icon: Icons.ArrowForwardUp },
            { command: CREATE_SUBGRAPH_COMMAND, title: "Create Subgraph", icon: Icons.Hierarchy2 },
        ];

        const subgraphCommands = [
            { command: SAVE_SUBGRAPH_COMMAND, title: "Save Subgraph", icon: Icons.DeviceFloppy },
            { command: SWITCH_TO_MAIN_GRAPH_COMMAND, title: "Back to Main Graph", icon: Icons.ArrowLeft },
        ];

        return { isSubgraph, commands, subgraphCommands };
    },
});
</script>
