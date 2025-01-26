<template>
    <div class="baklava-toolbar" @contextmenu.stop.prevent="">
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
import { computed, defineComponent, Component } from "vue";
import { useViewModel } from "../utility";
import {
    COPY_COMMAND,
    PASTE_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    CREATE_SUBGRAPH_COMMAND,
    SAVE_SUBGRAPH_COMMAND,
    START_SELECTION_BOX_COMMAND,
    DELETE_NODES_COMMAND,
    SWITCH_TO_MAIN_GRAPH_COMMAND,
    ZOOM_TO_FIT_GRAPH_COMMAND,
} from "../commandList";
import * as Icons from "../icons";
import ToolbarButton from "./ToolbarButton.vue";

interface ToolbarCommand {
    command: string;
    title: string;
    icon?: Component;
}

export default defineComponent({
    components: { ToolbarButton },
    setup() {
        const { viewModel } = useViewModel();

        const isSubgraph = computed(() => viewModel.value.displayedGraph !== viewModel.value.editor.graph);

        const commands = computed(() => {
            const commands: ToolbarCommand[] = [];

            if (viewModel.value.settings.toolbar.useDefaultCommands) {
                commands.push(
                    { command: COPY_COMMAND, title: "Copy", icon: Icons.Copy },
                    { command: PASTE_COMMAND, title: "Paste", icon: Icons.Clipboard },
                    { command: DELETE_NODES_COMMAND, title: "Delete selected nodes", icon: Icons.Trash },
                    { command: UNDO_COMMAND, title: "Undo", icon: Icons.ArrowBackUp },
                    { command: REDO_COMMAND, title: "Redo", icon: Icons.ArrowForwardUp },
                    { command: ZOOM_TO_FIT_GRAPH_COMMAND, title: "Zoom to Fit", icon: Icons.ZoomScan },
                    { command: START_SELECTION_BOX_COMMAND, title: "Box Select", icon: Icons.SelectAll },
                );
            }

            commands.push(...viewModel.value.settings.toolbar.additionalCommands);

            if (viewModel.value.settings.toolbar.useDefaultCommands) {
                commands.push({ command: CREATE_SUBGRAPH_COMMAND, title: "Create Subgraph", icon: Icons.Hierarchy2 });
            }

            return commands;
        });

        const subgraphCommands = computed(() => {
            const commands: ToolbarCommand[] = [];

            if (viewModel.value.settings.toolbar.useDefaultSubgraphCommands) {
                commands.push(
                    { command: SAVE_SUBGRAPH_COMMAND, title: "Save Subgraph", icon: Icons.DeviceFloppy },
                    { command: SWITCH_TO_MAIN_GRAPH_COMMAND, title: "Back to Main Graph", icon: Icons.ArrowLeft },
                );
            }

            commands.push(...viewModel.value.settings.toolbar.additionalSubgraphCommands);

            return commands;
        });

        return { isSubgraph, commands, subgraphCommands };
    },
});
</script>
