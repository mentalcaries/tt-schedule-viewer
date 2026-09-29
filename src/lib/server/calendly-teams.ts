import type { ScheduleTeam } from '$lib/schedule';

interface CalendlyTeamDefinition {
	slug: string;
	name: string;
	groupUri: string;
	tokenEnv: string;
}

export interface CalendlyTeam extends ScheduleTeam {
	groupUri: string;
	token: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function isCalendlyUri(value: string, resource: 'organizations' | 'groups') {
	try {
		const url = new URL(value);
		return (
			url.origin === 'https://api.calendly.com' &&
			new RegExp(`^/${resource}/[^/]+$`).test(url.pathname)
		);
	} catch {
		return false;
	}
}

function parseDefinition(value: unknown): CalendlyTeamDefinition | null {
	if (!isRecord(value)) return null;

	const slug = typeof value.slug === 'string' ? value.slug.trim().toLowerCase() : '';
	const name = typeof value.name === 'string' ? value.name.trim() : '';
	const groupUri = typeof value.groupUri === 'string' ? value.groupUri.trim() : '';
	const tokenEnv = typeof value.tokenEnv === 'string' ? value.tokenEnv.trim() : '';

	if (
		!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
		!name ||
		!isCalendlyUri(groupUri, 'groups') ||
		!/^[A-Z][A-Z0-9_]*$/.test(tokenEnv)
	) {
		return null;
	}

	return { slug, name, groupUri, tokenEnv };
}

export function getCalendlyTeams(environment: Record<string, string | undefined>): CalendlyTeam[] {
	const configuredTeams = environment.CALENDLY_TEAMS?.trim();

	if (!configuredTeams) {
		const token = environment.CALENDLY_TOKEN?.trim() ?? '';
		const groupUri = environment.CALENDLY_GROUP_URI?.trim() ?? '';
		return token && isCalendlyUri(groupUri, 'groups')
			? [{ slug: 'aise', name: 'AISE', groupUri, token }]
			: [];
	}

	let values: unknown;
	try {
		values = JSON.parse(configuredTeams);
	} catch {
		return [];
	}

	if (!Array.isArray(values)) return [];

	const teams: CalendlyTeam[] = [];
	const seenSlugs = new Set<string>();

	for (const value of values) {
		const definition = parseDefinition(value);
		if (!definition || seenSlugs.has(definition.slug)) continue;

		const token = environment[definition.tokenEnv]?.trim() ?? '';
		if (!token) continue;

		seenSlugs.add(definition.slug);
		teams.push({
			slug: definition.slug,
			name: definition.name,
			groupUri: definition.groupUri,
			token
		});
	}

	return teams;
}
