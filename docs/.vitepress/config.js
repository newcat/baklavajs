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
                        { text: "Setup", link: "/execution/index" },
                        { text: "Dependency Engine", link: "/execution/dependency" },
                        { text: "Forward Engine", link: "/execution/forward" },
                    ],
                },
                { text: "Plugins", children: [{ text: "Interface Types", link: "/plugins/interface-types" }] },
                { text: "Migration", link: "/migration" },
            ],
        },
    },
};
