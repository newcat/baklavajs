export interface ICommand<T = any, A extends Array<any> = []> {
    execute(...args: A): T;
    canExecute(): boolean;
}
