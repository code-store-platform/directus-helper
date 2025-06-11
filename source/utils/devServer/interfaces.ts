export type DevServerStatusChangeCallback = (
	statuses: Record<string, StatusChangePayload>,
) => void;

export enum DevServerTaskStatus {
	Building = 'building',
	InstallingPackages = 'installingPackages',
	Done = 'Done',
	Error = 'Error',
}

export interface StatusChangePayload {
	status: DevServerTaskStatus;
	message?: string;
}
