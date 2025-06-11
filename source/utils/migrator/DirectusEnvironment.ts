import { UrlBuilder } from "./UrlBuilder.js";
import type {
	DirectusEnvironmentCredentials,
	Snapshot,
	SnapshotDiffWithHash,
} from "./interfaces.js";
import type { Flow, Role, Permission } from "@directus/types";
import { FlowCreationTransactionBuilder } from "./FlowCreationTransactionBuilder.js";
import { splitExisting } from "../splitExisting/splitExisting.js";
import deepEqual from "deep-equal";
import { Logger } from "../Logger/Logger.js";

export class DirectusEnvironment {
	constructor(private readonly credentials: DirectusEnvironmentCredentials) {}

	get urlBuilder() {
		return new UrlBuilder(this.credentials);
	}

	async getSnapshot() {
		const response = await fetch(
			this.urlBuilder.setPath("/schema/snapshot").build(),
		);
		const responseData = (await response.json()) as { data: Snapshot };

		return responseData.data;
	}

	async getDifference(env: DirectusEnvironment) {
		const logger = new Logger();
		const snapshot = await env.getSnapshot();

		const response = await fetch(
			this.urlBuilder
				.setPath("/schema/diff")
				.setQueryParameter("force", "true")
				.build(),
			{
				method: "POST",
				body: JSON.stringify(snapshot),
				headers: { "Content-Type": "application/json" },
			},
		);

		if (!response.ok) {
			await logger.logResponse(response);
			await logger.logObject(snapshot);
			await logger.logError("Failed to obtain diff");
			throw new Error("Failed to obtain diff");
		}

		const responseText = await response.text();

		if (!responseText) {
			return null;
		}

		try {
			const responseData = JSON.parse(responseText) as {
				data: SnapshotDiffWithHash;
			};

			return responseData.data;
		} catch (e: any) {
			throw new Error(
				`Failed to parse response on diff fetch. Maybe instances are already the same\n Response text: ${
					e.message || responseText || "<empty>"
				}`,
			);
		}
	}

	async getFlows(): Promise<Flow[]> {
		const response = await fetch(
			this.urlBuilder
				.setPath("/flows")
				.setQueryParameter("fields", "*,operations.*,operation.*")
				.setQueryParameter("limit", "-1")
				.build(),
		);

		const flow = (await response.json()) as { data: Flow[] };

		return flow.data;
	}

	async getPresentedFlows(): Promise<string[]> {
		const response = await fetch(
			this.urlBuilder
				.setPath("/flows")
				.setQueryParameter("fields", "id")
				.setQueryParameter("limit", "-1")
				.build(),
		);

		const flows = (await response.json()) as { data: Flow[] };

		return flows.data.map((flow) => flow.id);
	}

	async createFlows(flows: Flow[]) {
		const presentedFlows = await this.getPresentedFlows();
		const logger = new Logger();

		for (const flow of flows) {
			const shouldUpdateOnly = presentedFlows.includes(flow.id);
			const transactionBuidler = new FlowCreationTransactionBuilder(flow);

			const transactionSteps = shouldUpdateOnly
				? transactionBuidler.buildUpdateQueue()
				: transactionBuidler.buildCreateQueue();

			for (const step of transactionSteps) {
				const response = await fetch(
					this.urlBuilder.setPath(`/flows${step.path}`).build(),
					{
						method: step.method,
						body: JSON.stringify(step.payload),
						headers: { "Content-type": "application/json" },
					},
				);

				if (!response.ok) {
					await logger.logError("Failed tranfer flows");
					await logger.logObject({
						step,
						response,
					});

					throw new Error("Failed transfer flows");
				}
			}
		}
	}

	async getRoles() {
		const response = await fetch(
			this.urlBuilder
				.setPath("/roles")
				.setQueryParameter("limit", "-1")
				.build(),
		);

		if (!response.ok) {
			throw new Error(`Failed fetch roles for the ${this.credentials.link}`);
		}

		const responseData = (await response.json()) as { data: Role[] };

		return responseData.data;
	}

	async appendRoles(roles: Role[]) {
		const oldRoles = await this.getRoles();
		const [existingRoles, rolesToCreate] = splitExisting(
			oldRoles
				.map((role) => ({ ...role, users: [] }))
				.filter((role) => !role.admin_access),
			roles
				.map((role) => ({ ...role, users: [] }))
				.filter((role) => !role.admin_access),
			(role1, role2) => role1.id === role2.id,
		);

		const rolesToUpdate = existingRoles.filter((role) => {
			const oldRole = oldRoles.find((oldRole) => oldRole.id === role.id);

			return !deepEqual(oldRole, role);
		});

		await this.createRecords(rolesToCreate, "/roles");
		await this.updateRecords(rolesToUpdate, "/roles");
	}

	async getPermissions() {
		const response = await fetch(
			this.urlBuilder
				.setPath("/permissions")
				.setQueryParameter("limit", "-1")
				.build(),
		);

		if (!response.ok) {
			throw new Error(
				`Failed fetch permissions for the ${this.credentials.link}`,
			);
		}

		const responseData = (await response.json()) as { data: Permission[] };

		return responseData.data;
	}

	async appendPermissions(permissions: Permission[]) {
		const oldPermissions = await this.getPermissions();
		const compare = (perm1: Permission, perm2: Permission) => {
			return (
				perm1.role === perm2.role &&
				perm1.collection === perm2.collection &&
				perm1.action === perm2.action
			);
		};

		const [existingPermissions, itemsToCreate] = splitExisting(
			oldPermissions.filter((perm) => !perm.system),
			permissions
				.map((perm) => ({ ...perm, id: undefined }))
				.filter((perm) => !perm.system),
			compare,
		);

		const itemsToUpdate = existingPermissions
			.filter((permission) => {
				const oldItem = oldPermissions.find((oldItem) =>
					compare(oldItem, permission),
				);

				if (!oldItem) {
					return true;
				}

				return !deepEqual(
					{ ...permission, id: undefined },
					{ ...oldItem, id: undefined },
				);
			})
			.map((permission) => {
				return {
					...permission,
					id: oldPermissions.find((oldItem) => compare(oldItem, permission))
						?.id,
				};
			});

		const itemsToDelete = oldPermissions
			.filter((oldPermission) => {
				const isDeletedPermission = existingPermissions.find((newPermission) =>
					compare(newPermission, oldPermission),
				);

				if (!isDeletedPermission) {
					return true;
				}

				return !deepEqual(
					{ ...isDeletedPermission, id: undefined },
					{ ...oldPermission, id: undefined },
				);
			})
			.filter((permission) => {
				return oldPermissions.some(
					(oldPermission) =>
						compare(oldPermission, permission) && oldPermission.id,
				);
			});

		await this.createRecords(itemsToCreate, "/permissions");
		await this.updateRecords(itemsToUpdate, "/permissions");
		await this.deleteRecords(itemsToDelete, "/permissions");
	}

	async applyDifference(difference: SnapshotDiffWithHash) {
		const response = await fetch(
			this.urlBuilder.setPath("/schema/apply").build(),
			{
				method: "POST",
				body: JSON.stringify(difference),
				headers: { "Content-Type": "application/json" },
			},
		);

		if (!response.ok) {
			const logger = new Logger();

			await logger.logObject(difference);
			await this.printErrorResponse(
				response,
				"Error occured while applying diff",
			);
		}
	}

	private async createRecords(itemsToCreate: unknown[], path: string) {
		const response = await fetch(this.urlBuilder.setPath(path).build(), {
			method: "POST",
			body: JSON.stringify(itemsToCreate),
			headers: { "Content-Type": "application/json" },
		});

		if (!response.ok) {
			await this.printErrorResponse(
				response,
				`Failed create item for the ${path}`,
			);
		}
	}

	private async updateRecords<T extends { id?: unknown }>(
		itemsToUpdate: T[],
		path: string,
	) {
		for (const item of itemsToUpdate) {
			const id = item?.id;

			if (!id) {
				continue;
			}

			const response = await fetch(
				this.urlBuilder.setPath(`${path}/${id}`).build(),
				{
					method: "PATCH",
					body: JSON.stringify(item),
					headers: { "Content-Type": "application/json" },
				},
			);

			if (!response.ok) {
				await this.printErrorResponse(response, `Failed update ${path}`);
			}
		}
	}

	private async deleteRecords<T extends { id?: unknown }>(
		itemsToDelete: T[],
		path: string,
	) {
		for (const permission of itemsToDelete) {
			if (!permission.id) {
				continue;
			}

			const response = await fetch(
				this.urlBuilder.setPath(`${path}/${permission.id}`).build(),
				{
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
				},
			);

			if (!response.ok) {
				await this.printErrorResponse(response, `Failed to delete ${path}`);
			}
		}
	}

	private async printErrorResponse(
		response: Response,
		message: string,
	): Promise<never> {
		const responseText = await response.text();
		const logger = new Logger();

		await logger.logError(message);
		await logger.logText(`Response text: ${responseText}`);

		throw new Error(`${message}\nResponse text: ${responseText}`);
	}
}
