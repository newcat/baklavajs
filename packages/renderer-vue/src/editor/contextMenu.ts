import { Ref, computed, ref, reactive } from "vue";
import { AbstractNode } from "@baklavajs/core";
import { IMenuItem } from "../contextmenu";
import { IBaklavaViewModel } from "../viewModel";
import { useNodeCategories, useTransform } from "../utility";

export function useContextMenu(viewModel: Ref<IBaklavaViewModel>) {
    const show = ref(false);
    const x = ref(0);
    const y = ref(0);
    const categories = useNodeCategories(viewModel);
    const { transform } = useTransform();

    const nodeItems = computed<IMenuItem[]>(() => {
        let defaultNodes: IMenuItem[] = [];
        const categoryItems: Record<string, IMenuItem[]> = {};

        for (const category of categories.value) {
            const mappedNodes = Object.entries(category.nodeTypes).map(([nodeType, info]) => ({
                label: info.title,
                value: "addNode:" + nodeType,
            }));
            if (category.name === "default") {
                defaultNodes = mappedNodes;
            } else {
                categoryItems[category.name] = mappedNodes;
            }
        }

        const menuItems: IMenuItem[] = [
            ...Object.entries(categoryItems).map(([category, items]) => ({
                label: category,
                submenu: items,
            })),
        ];
        if (menuItems.length > 0 && defaultNodes.length > 0) {
            menuItems.push({ isDivider: true });
        }
        menuItems.push(...defaultNodes);

        return menuItems;
    });

    const items = computed<IMenuItem[]>(() => {
        if (viewModel.value.settings.contextMenu.additionalItems.length === 0) {
            return nodeItems.value;
        } else {
            return [
                { label: "Add node", submenu: nodeItems.value },
                ...viewModel.value.settings.contextMenu.additionalItems.map((item) => {
                    if ("isDivider" in item || "submenu" in item) {
                        return item;
                    } else {
                        return {
                            label: item.label,
                            value: "command:" + item.command,
                            disabled: !viewModel.value.commandHandler.canExecuteCommand(item.command),
                        };
                    }
                }),
            ];
        }
    });

    function open(ev: MouseEvent) {
        show.value = true;
        x.value = ev.offsetX;
        y.value = ev.offsetY;
    }

    function onClick(value: string) {
        if (value.startsWith("addNode:")) {
            // get node type
            const nodeType = value.substring("addNode:".length);
            const nodeInformation = viewModel.value.editor.nodeTypes.get(nodeType);
            if (!nodeInformation) {
                return;
            }

            const instance = reactive(new nodeInformation.type()) as AbstractNode;
            viewModel.value.displayedGraph.addNode(instance);
            const [transformedX, transformedY] = transform(x.value, y.value);
            instance.position.x = transformedX;
            instance.position.y = transformedY;
        } else if (value.startsWith("command:")) {
            const command = value.substring("command:".length);
            if (viewModel.value.commandHandler.canExecuteCommand(command)) {
                viewModel.value.commandHandler.executeCommand(command);
            }
        }
    }

    return { show, x, y, items, open, onClick };
}
