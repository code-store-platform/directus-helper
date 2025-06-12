import { UrlBuilder } from "./UrlBuilder.js";
import type {
	DirectusEnvironmentCredentials,
	Snapshot,
	SnapshotDiffWithHash,
} from "./interfaces.js";
import type { Flow, Role } from "@directus/types";
import { FlowCreationTransactionBuilder } from "./FlowCreationTransactionBuilder.js";
import { Logger } from "../Logger/Logger.js";

export class DirectusEnvironment {
	constructor(private readonly credentials: DirectusEnvironmentCredentials) { }

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
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (e: any) {
			throw new Error(
				`Failed to parse response on diff fetch. Maybe instances are already the same\n Response text: ${e.message || responseText || "<empty>"
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
