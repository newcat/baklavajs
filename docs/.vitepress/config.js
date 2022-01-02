module.exports = {
    title: "BaklavaJS",
    themeConfig: {
        nav: [
            {
                text: "API Reference",
                link: "/api/index.html",
            },
        ],
        sidebar: {
            "/": [
                { text: "Getting Started", link: "/getting-started" },
                { text: "Core Concepts", link: "/core-concepts" },
                {
                    text: "Nodes",
                    children: [
                        { text: "Create Nodes", link: "/nodes/nodes" },
                        { text: "Node Interfaces", link: "/nodes/interfaces" },
                        { text: "Pre-defined Interfaces", link: "/nodes/pre-defined-interfaces" },
                        { text: "Node Lifecycle", link: "/nodes/lifecycle" },
                    ],
                },
                {
                    text: "Graph Execution",
                    children: [
                        { text: "Setup", link: "/execution/setup" },
                        { text: "Dependency Engine", link: "/execution/dependency" },
                        { text: "Forward Engine", link: "/execution/forward" },
                    ],
                },
                {
                    text: "Editor",
                    children: [
                        { text: "Registering Nodes", link: "/editor/registering-nodes" },
                        { text: "Subgraphs", link: "/editor/subgraphs" },
                    ],
                },
                { text: "Plugins", children: [{ text: "Interface Types", link: "/plugins/interface-types" }] },
                { text: "Event System", link: "/event-system" },
                { text: "Migration", link: "/migration" },
            ],
        },
    },
};
