import type {Flow} from '@directus/types';

interface TransactionItem {
	method: 'POST' | 'PATCH';
	path: string;
	payload: unknown;
}

export class FlowCreationTransactionBuilder {
	private queue: TransactionItem[] = [];

	constructor(private readonly flow: Flow) {}

	buildUpdateQueue() {
		this.clearQueue();

		this.appendRootUpdate();
		this.appedOperations();
		this.appendRootOperation();

		return this.queue;
	}

	buildCreateQueue() {
		this.clearQueue();

		this.appendRootCreation();
		this.appedOperations();
		this.appendRootOperation();

		return this.queue;
	}

	private clearQueue() {
		this.queue = [];
	}

	private appendRootUpdate() {
		const root = this.getRoot();

		this.queue.push({
			method: 'PATCH',
			path: `/${root.id}`,
			payload: root,
		});
	}

	private appendRootCreation() {
		const root = this.getRoot();

		this.queue.push({
			method: 'POST',
			path: '/',
			payload: root,
		});
	}

	private appedOperations() {
		const operations = (this.flow as any).operations as Array<{
			id: string;
			resolve: string;
			reject: string;
			user_created: string;
		}>;

		const operationsPayload: unknown[] = [];
		const resolvedOperation: string[] = [];

		while (operations.length !== resolvedOperation.length) {
			operations.forEach(operation => {
				if (resolvedOperation.includes(operation.id)) {
					return;
				}

				const resolveIsNice =
					resolvedOperation.includes(operation.resolve) ||
					operation.resolve === null;
				const rejectIsNice =
					resolvedOperation.includes(operation.reject) ||
					operation.reject === null;

				if (!resolveIsNice || !rejectIsNice) {
					return;
				}

				const {user_created, ...operationData} = operation;
				resolvedOperation.push(operation.id);
				operationsPayload.push(operationData);

				this.queue.push({
					method: 'PATCH',
					path: `/${this.flow.id}`,
					payload: {
						operations: operationsPayload,
					},
				});
			});
		}
	}

	private appendRootOperation() {
		const operation = this.flow.operation as any;

		this.queue.push({
			method: 'PATCH',
			path: `/${this.flow.id}`,
			payload: {
				operation: operation.id,
			},
		});
	}

	private getRoot() {
		const {operation, operations, user_created, ...rest} = this.flow as any;

		return {
			...rest,
		};
	}
}
