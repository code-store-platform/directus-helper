export type Field = (
	| StringInputField
	| BooleanInputField
	| StringArrayInputField
	| NumberInputField
) &
	InputFieldBase;

export type Validate<V> = (value: V) => string | undefined;
type InputField<K extends string, V> = {
	type: K;
	deafultValue?: V;
} & (
	| { required: true; validate?: Validate<V> }
	| { required?: false | undefined; validate?: Validate<V | undefined> }
);

type StringInputField = InputField<"string", string>;
type BooleanInputField = InputField<"boolean", boolean>;
type StringArrayInputField = InputField<"string[]", string[]>;
type NumberInputField = InputField<"number", number> & { int?: boolean };

type InputFieldBase = {
	name: string;
	label?: string;
	required?: boolean;
};
