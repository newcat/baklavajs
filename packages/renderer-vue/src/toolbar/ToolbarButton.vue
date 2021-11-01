<template>
    <button
        class="baklava-toolbar-entry baklava-toolbar-button"
        :disabled="!viewModel.commandHandler.canExecuteCommand(command)"
        :title="title"
        @click="viewModel.commandHandler.executeCommand(command)"
    >
        <component :is="icon" v-if="icon" />
        <template v-else>
            {{ title }}
        </template>
    </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useViewModel } from "../utility";

export default defineComponent({
    props: {
        command: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        icon: {
            type: Object,
            required: false,
            default: undefined,
        },
    },
    setup() {
        const { viewModel } = useViewModel();
        return { viewModel };
    },
});
</script>
