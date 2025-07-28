import type { Field, FieldMeta, Relation, RelationMeta } from "@directus/types";
import type { Table } from "@directus/schema";
import type { Diff } from "deep-diff";

export interface ConfigObject {
	environments: DirectusEnvironmentCredentials[];
}

export type TokenDirectusEnvironmentCredentials = {
	link: string;
	token: string;
};

export type LoginPasswordDirectusEnvironmentCredentials = {
	link: string;
	login: string;
	password: string;
};

export type DirectusEnvironmentCredentials =
	| TokenDirectusEnvironmentCredentials
	| LoginPasswordDirectusEnvironmentCredentials;

export type StatusChangeCallback = (status: string) => void;

/* From Directus source code*/

export type CollectionMeta = {
	collection: string;
	note: string | null;
	hidden: boolean;
	singleton: boolean;
	icon: string | null;
	translations: Record<string, string>;
	versioning: boolean;
	item_duplication_fields: string[] | null;
	accountability: "all" | "accountability" | null;
	group: string | null;
};

export type Collection = {
	collection: string;
	fields?: Field[];
	meta: CollectionMeta | null;
	schema: Table | null;
};

export type Snapshot = {
	version: number;
	directus: string;
	vendor?: DatabaseClient;
	collections: Collection[];
	fields: SnapshotField[];
	relations: SnapshotRelation[];
};

export type SnapshotField = Field & { meta: Omit<FieldMeta, "id"> };
export type SnapshotRelation = Relation & { meta: Omit<RelationMeta, "id"> };

export type SnapshotWithHash = Snapshot & { hash: string };

export type SnapshotDiff = {
	collections: {
		collection: string;
		diff: Diff<Collection | undefined>[];
	}[];
	fields: {
		collection: string;
		field: string;
		diff: Diff<SnapshotField | undefined>[];
	}[];
	relations: {
		collection: string;
		field: string;
		related_collection: string | null;
		diff: Diff<SnapshotRelation | undefined>[];
	}[];
};

export type SnapshotDiffWithHash = { hash: string; diff: SnapshotDiff };

/**
 * Indicates the kind of change based on comparisons by deep-diff package
 */
export const DiffKind = {
	/** indicates a newly added property/element */
	NEW: "N",
	/** indicates a property/element was deleted */
	DELETE: "D",
	/** indicates a property/element was edited */
	EDIT: "E",
	/** indicates a change occurred within an array */
	ARRAY: "A",
} as const;

export type Driver =
	| "mysql"
	| "pg"
	| "cockroachdb"
	| "sqlite3"
	| "oracledb"
	| "mssql";

export const DatabaseClients = [
	"mysql",
	"postgres",
	"cockroachdb",
	"sqlite",
	"oracle",
	"mssql",
	"redshift",
] as const;
export type DatabaseClient = (typeof DatabaseClients)[number];
