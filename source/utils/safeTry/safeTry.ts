export const safeTry = <T, E = unknown>(callback: () => T) => {
	try {
		return [callback(), null] as const;
	} catch (error) {
		return [null, error as E] as const;
	}
};

export const safeTryPromise = async <T, E = unknown>(
	callback: () => Promise<T>,
) => {
	try {
		const result = await callback();
		return [result, null] as const;
	} catch (error) {
		return [null, error as E] as const;
	}
};
