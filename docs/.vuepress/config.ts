import { defineUserConfig } from "vuepress";
import type { DefaultThemeOptions } from "vuepress";
import { path } from "@vuepress/utils";

export default defineUserConfig<DefaultThemeOptions>({
    lang: "en-US",
    title: "BaklavaJS",
    description: "Graph / node editor in the browser using VueJS",

    themeConfig: {
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
    },

    plugins: [
        [
            "@vuepress/register-components",
            {
                components: {
                    StaticLink: path.resolve(__dirname, "./components/StaticLink.vue"),
                    ApiLink: path.resolve(__dirname, "./components/ApiLink.vue"),
                },
            },
        ],
    ],
});
