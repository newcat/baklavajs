import { IBaklavaEvent, IPreventableBaklavaEvent, IHook } from "../../baklavajs-events/types";
import { INodeState } from "./state";
import { IEditor } from "./editor";
import { INodeIO, IODefinition, IODefinitionValues } from "./nodeIO";

export interface INodeType<I extends IODefinition, O extends IODefinition> {
    
}

export interface INode<I extends IODefinition, O extends IODefinition> {

    type: string;
    title: string;
    id: string;
    inputs: I;
    outputs: O;

    events: {
        beforeAddInput: IPreventableBaklavaEvent<INodeIO<unknown>>,
        addInput: IBaklavaEvent<INodeIO<unknown>>,
        beforeRemoveInput: IPreventableBaklavaEvent<INodeIO<unknown>>,
        removeInput: IBaklavaEvent<INodeIO<unknown>>,
        beforeAddOutput: IPreventableBaklavaEvent<INodeIO<unknown>>,
        addOutput: IBaklavaEvent<INodeIO<unknown>>,
        beforeRemoveOutput: IPreventableBaklavaEvent<INodeIO<unknown>>,
        removeOutput: IBaklavaEvent<INodeIO<unknown>>
    };

    hooks: {
        load: IHook<INodeState<I, O>>,
        save: IHook<INodeState<I, O>>
    };

    load(state: INodeState<I, O>): void;
    save(): INodeState<I, O>;
    calculate?: (inputs: IODefinitionValues<I>, globalValues?: any) => IODefinitionValues<O>|Promise<IODefinitionValues<O>>|void;
    registerEditor(editor: IEditor): void;

}
