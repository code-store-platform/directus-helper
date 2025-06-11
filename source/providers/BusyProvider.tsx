import React, { useContext, useEffect } from 'react';
import { useBoolean } from '../hooks/useBoolean.js';

interface ContextValue {
	busy: boolean;
	onBusy: () => void;
	onDone: () => void;
}

const initialValue: ContextValue = {
	busy: false,
	onBusy: () => { },
	onDone: () => { },
};

const BusyContext = React.createContext(initialValue);

export const useBusy = () => useContext(BusyContext);
export const useBusyEffect = () => {
	const busy = useBusy();

	useEffect(() => {
		busy.onBusy();

		return () => {
			busy.onDone();
		}
	})
}

export const BusyProvider: React.FC<React.PropsWithChildren> = props => {
	const { children } = props;
	const busy = useBoolean(false);

	const value: ContextValue = {
		busy: busy.value,
		onBusy: busy.setTrue,
		onDone: busy.setFalse,
	};

	return <BusyContext.Provider value={value}>{children}</BusyContext.Provider>;
};
