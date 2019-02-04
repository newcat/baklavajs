export interface IBaklavaGlobal {
    sidebar: {
        visible: boolean;
        nodeId: string;
        optionName: string;
    };
}

declare module 'vue/types/vue' {
    export interface Vue {
        $baklava: IBaklavaGlobal;
    }
}