import { useFocusManager, useInput } from "ink";

export const useArrowFocus = () => {
	const { focusNext, focusPrevious } = useFocusManager();

	useInput((_, key) => {
		if (key.upArrow) {
			focusPrevious();
		}

		if (key.downArrow) {
			focusNext();
		}
	});
};
