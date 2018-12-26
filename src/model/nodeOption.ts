export default interface INodeOption {
    type: string;
    loadState(data: any): void;
    getState(): any;
}
