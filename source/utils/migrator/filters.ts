import {Diff} from 'deep-diff';
import {Collection, DiffKind, SnapshotField} from './interfaces.js';

export const filterCollections = (
	collections: {
		collection: string;
		diff: Diff<Collection | undefined>[];
	}[],
) => {
	return collections
		.map(collections => {
			return {
				...collections,
				diff: collections.diff.filter(
					diff =>
						!(
							diff.kind === DiffKind.EDIT &&
							['color', 'group', 'hidden', 'icon'].includes(
								diff?.path?.at(-1) || '',
							)
						),
				),
			};
		})
		.filter(collection => collection.diff.length);
};

export const filterFields = (
	fields: {
		collection: string;
		field: string;
		diff: Diff<SnapshotField | undefined>[];
	}[],
) => {
	return fields
		.map(field => {
			return {
				...field,
				diff: field.diff.filter(
					diff =>
						diff.kind !== DiffKind.EDIT ||
						!['color', 'group', 'hidden', 'icon'].includes(
							diff?.path?.at(-1) || '',
						),
				),
			};
		})
		.filter(field => field.diff.length);
};

export const filterFieldsFolder = (
	fields: {
		collection: string;
		field: string;
		diff: Diff<SnapshotField | undefined>[];
	}[],
) => {
	return fields
		.map(field => {
			const newField = {
				...field,
				diff: field.diff.filter(
					diff =>
						diff.kind !== DiffKind.EDIT ||
						!['folder'].includes(diff?.path?.at(-1) || ''),
				),
			};

			if (
				field.collection === 'directus_users' &&
				field.field === 'links-k_t2aw'
			) {
				newField.diff = newField.diff.filter(
					diff => diff.kind !== DiffKind.EDIT,
				);
			}

			return newField;
		})
		.filter(field => field.diff.length);
};
