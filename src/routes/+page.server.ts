import { env } from '$env/dynamic/private';
import { getCalendlyTeams } from '$lib/server/calendly-teams';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	teams: getCalendlyTeams(env).map(({ slug, name }) => ({ slug, name }))
});
