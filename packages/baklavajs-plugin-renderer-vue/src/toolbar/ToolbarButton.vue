<template>
    <button
        class="toolbar-entry toolbar-button"
        :disabled="!plugin.commandHandler.canExecuteCommand(command)"
        :title="title"
        @click="plugin.commandHandler.executeCommand(command)"
    >
        <component
            :is="icon"
            v-if="icon"
        />
        <template v-else>
            {{ title }}
        </template>
    </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { usePlugin } from "../utility";

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
        const { plugin } = usePlugin();
        return { plugin };
    },
});
</script>
