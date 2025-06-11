import {StatusChangePayload} from '../interfaces.js';

export type StatusChangeCallback = (status: StatusChangePayload) => void;

export enum BuildMode {
	Dev = 'dev',
	Prod = 'prod',
}
