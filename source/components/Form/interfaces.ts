export type Field = (
	| StringInputField
	| BooleanInputField
	| StringArrayInputField
) &
	InputFieldBase;

type StringInputField = {
	type: "string";
	deafultValue?: string;
};

type BooleanInputField = {
	type: "boolean";
	deafultValue?: boolean;
};

type StringArrayInputField = {
	type: "string[]";
	deafultValue?: string[];
	options?: string[];
};

type InputFieldBase = {
	name: string;
	label?: string;
	required?: boolean;
	hint?: string;
};
