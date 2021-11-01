export interface ICommand<Returns = any, Arguments extends Array<any> = []> {
    execute(...args: Arguments): Returns;
    canExecute(): boolean;
}
