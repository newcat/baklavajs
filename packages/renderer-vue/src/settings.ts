interface SimpleContextMenuItem {
    label: string;
    command: string;
}

interface DividerContextMenuItem {
    isDivider: true;
}

interface SubmenuContextMenuItem {
    label: string;
    submenu: ContextMenuItem[];
}

export type ContextMenuItem = SimpleContextMenuItem | DividerContextMenuItem | SubmenuContextMenuItem;

export interface IViewSettings {
    /** Use straight connections instead of bezier curves */
    useStraightConnections: boolean;
    /** Show a minimap */
    enableMinimap: boolean;
    /** Background settings */
    background: {
        gridSize: number;
        gridDivision: number;
        subGridVisibleThreshold: number;
    };
    /** Sidebar settings */
    sidebar: {
        /** Width of the sidebar in pixels */
        width: number;
        /** Whether users should be able to resize the sidebar */
        resizable: boolean;
    };
    /** Show interface value on port hover */
    displayValueOnHover: boolean;
    /** Node settings */
    nodes: {
        /** Minimum width of a node */
        minWidth: number;
        /** Maximum width of a node */
        maxWidth: number;
        /** Default width of a node */
        defaultWidth: number;
        /** Whether users should be able to resize nodes */
        resizable: boolean;
    };
    contextMenu: {
        /** Whether the context menu should be enabled */
        enabled: boolean;
        additionalItems: ContextMenuItem[];
    };
}

export const DEFAULT_SETTINGS: () => IViewSettings = () => ({
    useStraightConnections: false,
    enableMinimap: false,
    background: {
        gridSize: 100,
        gridDivision: 5,
        subGridVisibleThreshold: 0.6,
    },
    sidebar: {
        width: 300,
        resizable: true,
    },
    displayValueOnHover: false,
    nodes: {
        defaultWidth: 200,
        maxWidth: 320,
        minWidth: 150,
        resizable: false,
    },
    contextMenu: {
        enabled: true,
        additionalItems: [],
    },
});
