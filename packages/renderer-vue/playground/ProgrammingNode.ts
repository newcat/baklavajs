import { NodeInterface, defineNode } from "@baklavajs/core";
import { AsyncSelectInterface, AsyncSelectOption } from "../src/nodeinterfaces/asyncselect/AsyncSelectInterface";

export default defineNode({
    type: "ProgrammingNode",
    inputs: {
        a: () =>
            new AsyncSelectInterface("Select", { label: "A++", value: "B5Nkkn5FZp" }, async (query: string) => {
                let where = "";
                if (query) {
                    where =
                        "&where=" +
                        encodeURIComponent(
                            JSON.stringify({
                                ProgrammingLanguage: {
                                    $regex: `${query}|${query.toUpperCase()}|${query[0].toUpperCase() + query.slice(1)}`,
                                },
                            }),
                        );
                }

                const response = await fetch(
                    "https://parseapi.back4app.com/classes/All_Programming_Languages?limit=9999&order=ProgrammingLanguage&keys=ProgrammingLanguage" +
                        where,
                    {
                        headers: {
                            "X-Parse-Application-Id": "XpRShKqJcxlqE5EQKs4bmSkozac44osKifZvLXCL", // This is the fake app's application id
                            "X-Parse-Master-Key": "Mr2UIBiCImScFbbCLndBv8qPRUKwBAq27plwXVuv", // This is the fake app's readonly master key
                        },
                    },
                );
                const data = await response.json(); // Here you have the data that you need

                const output: AsyncSelectOption[] = data.results.map((item: any) => ({
                    value: item.objectId,
                    label: item.ProgrammingLanguage,
                }));

                return output;
            }),
    },
    outputs: {
        output: () => new NodeInterface("Output", ""),
        output2: () => new NodeInterface("Output2", 0),
    },
    onCreate() {
        this.width = 350;
    },
    calculate({ a }) {
        return { output: a.label, output2: a.value };
    },
});
