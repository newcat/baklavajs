/// <reference types="@types/node" />

import * as path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";
import dts from "vite-plugin-dts";

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "BaklavaJSRendererVue",
            fileName: (format) => `renderer-vue.${format}.js`,
            formats: ["umd", "es"],
        },
        rollupOptions: {
            external: ["vue", "@baklavajs/core", "@baklavajs/events"],
            output: {
                globals: {
                    vue: "Vue",
                },
            },
        },
        minify: false,
    },
    plugins: [
        vue(),
        dts(),
        visualizer({
            filename: "dist/report.html",
        }),
    ],
    server: {
        fs: {
            allow: ["../.."],
        },
    },
});
