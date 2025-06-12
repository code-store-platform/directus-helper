export type Field = (
	| StringInputField
	| BooleanInputField
	| StringArrayInputField
) &
	InputFieldBase;

type StringInputField = {
	type: "string";
	deafultValue?: string;
	validate?: (value?: string) => string | undefined;
};

type BooleanInputField = {
	type: "boolean";
	deafultValue?: boolean;
	validate?: (value?: boolean) => string | undefined;
};

type StringArrayInputField = {
	type: "string[]";
	deafultValue?: string[];
	validate?: (value?: string[]) => string | undefined;
};

type InputFieldBase = {
	name: string;
	label?: string;
	required?: boolean;
};
