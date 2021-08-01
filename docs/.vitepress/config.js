module.exports = {
    title: "BaklavaJS",
    themeConfig: {
        nav: [
            {
                text: "API Reference",
                link: "api/index.html",
            },
        ],
        sidebar: {
            "/": [
                { text: "Getting Started", link: "/getting-started" },
                {
                    text: "Nodes",
                    children: [{ text: "Create Nodes", link: "/nodes/nodes" }],
                },
                { text: "Migration", link: "/migration" },
            ],
        },
    },
};
