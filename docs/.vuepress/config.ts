import { defaultTheme, defineUserConfig } from "vuepress";
import { path } from "@vuepress/utils";
import { registerComponentsPlugin } from "@vuepress/plugin-register-components";

export default defineUserConfig({
    lang: "en-US",
    title: "BaklavaJS",
    description: "Graph / node editor in the browser using VueJS",

    theme: defaultTheme({
        repo: "https://github.com/newcat/baklavajs",
        navbar: [
            {
                text: "API Reference",
                link: "/api-reference.md",
            },
        ],
        sidebar: [
            "/getting-started.md",
            "/core-concepts.md",
            {
                text: "Nodes",
                children: [
                    "/nodes/nodes.md",
                    "/nodes/interfaces.md",
                    "/nodes/pre-defined-interfaces.md",
                    "/nodes/interface-types.md",
                    "/nodes/lifecycle.md",
                ],
            },
            {
                text: "Graph Execution",
                children: ["/execution/setup.md", "/execution/dependency.md", "/execution/forward.md"],
            },
            {
                text: "Editor",
                children: ["/editor/registering-nodes.md", "/editor/subgraphs.md"],
            },
            "/event-system.md",
            "/migration.md",
        ],
    }),

    plugins: [
        registerComponentsPlugin({
            components: {
                StaticLink: path.resolve(__dirname, "./components/StaticLink.vue"),
                ApiLink: path.resolve(__dirname, "./components/ApiLink.vue"),
                Mermaid: path.resolve(__dirname, "./components/Mermaid.vue"),
            },
        }),
    ],
});
