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

<script setup lang="ts">
import { computed } from "vue";
import { useViewModel } from "../utility";
import ToolbarButton from "./ToolbarButton.vue";

const { viewModel } = useViewModel();
const isSubgraph = computed(() => viewModel.value.displayedGraph !== viewModel.value.editor.graph);
const commands = computed(() => viewModel.value.settings.toolbar.commands);
const subgraphCommands = computed(() => viewModel.value.settings.toolbar.subgraphCommands);
</script>
