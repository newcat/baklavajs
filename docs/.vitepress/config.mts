import { defineConfig } from "vitepress";
import { OramaPlugin } from "@orama/plugin-vitepress";

export default defineConfig({
    lang: "en-US",
    title: "BaklavaJS",
    description: "Graph / node editor in the browser using VueJS",
    vite: {
        plugins: [OramaPlugin()],
    },
    themeConfig: {
        editLink: {
            pattern: "https://github.com/newcat/baklavajs/edit/master/docs/:path",
        },
        externalLinkIcon: true,
        nav: [
            {
                text: "API Reference",
                link: "https://v2.baklava.tech/api/",
            },
            {
                text: "v1",
                link: "https://v1.baklava.tech",
            },
        ],
        sidebar: [
            { text: "Getting Started", link: "/getting-started.md" },
            { text: "Core Concepts", link: "/core-concepts.md" },
            {
                text: "Nodes",
                items: [
                    { text: "Creating Nodes", link: "/nodes/nodes.md" },
                    { text: "Node Interfaces", link: "/nodes/interfaces.md" },
                    { text: "Pre-defined Interfaces", link: "/nodes/pre-defined-interfaces.md" },
                    { text: "Interface Types", link: "/nodes/interface-types.md" },
                    { text: "Node Lifecycle", link: "/nodes/lifecycle.md" },
                    { text: "Dynamic Nodes", link: "/nodes/dynamic-nodes.md" },
                ],
            },
            {
                text: "Editor",
                items: [
                    { text: "Registering Nodes", link: "/editor/registering-nodes.md" },
                    { text: "Subgraphs", link: "/editor/subgraphs.md" },
                    { text: "Saving and Loading", link: "/editor/saving-loading.md" },
                ],
            },
            {
                text: "Visual Editor",
                items: [
                    { text: "Setup", link: "/visual-editor/setup.md" },
                    { text: "Commands", link: "/visual-editor/commands.md" },
                    { text: "Toolbar", link: "/visual-editor/toolbar.md" },
                    { text: "Customization", link: "/visual-editor/customization.md" },
                ],
            },
            {
                text: "Graph Execution",
                items: [
                    { text: "Graph Execution", link: "/execution/setup.md" },
                    { text: "Dependency Engine", link: "/execution/dependency.md" },
                    { text: "Forward Engine", link: "/execution/forward.md" },
                ],
            },
            { text: "Event System", link: "/event-system.md" },
            { text: "Browser Build", link: "/browser-build.md" },
            { text: "Migrating from Baklava v1", link: "/migration.md" },
        ],
        socialLinks: [{ icon: "github", link: "https://github.com/newcat/baklavajs" }],
    },
});
