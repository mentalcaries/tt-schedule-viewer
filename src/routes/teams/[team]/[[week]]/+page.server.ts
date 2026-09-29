import { env } from '$env/dynamic/private';
import type { ScheduleError, ScheduleEvent, ScheduleView } from '$lib/schedule';
import { CalendlyRequestError, getSchedule } from '$lib/server/calendly';
import { getCalendlyTeams, isCalendlyUri } from '$lib/server/calendly-teams';
import { createScheduleRange, isValidTimeZone } from '$lib/server/date-range';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const DEFAULT_TIMEZONE = 'America/New_York';

function createWeeks(dates: string[], events: ScheduleEvent[]) {
	const eventsByDate = new Map<string, ScheduleEvent[]>();

	for (const event of events) {
		const dateEvents = eventsByDate.get(event.date) ?? [];
		dateEvents.push(event);
		eventsByDate.set(event.date, dateEvents);
	}

	return Array.from({ length: dates.length / 7 }, (_, weekIndex) => ({
		key: dates[weekIndex * 7],
		days: dates.slice(weekIndex * 7, weekIndex * 7 + 7).map((date) => ({
			date,
			events: eventsByDate.get(date) ?? []
		}))
	}));
}

export const load: PageServerLoad = async ({ depends, params, setHeaders }) => {
	depends('app:schedule');
	setHeaders({ 'cache-control': 'private, no-store' });

	if (params.week && params.week !== 'last-week' && params.week !== 'next-week') {
		error(404, 'Schedule week not found');
	}

	const view: ScheduleView =
		params.week === 'last-week'
			? 'last-week'
			: params.week === 'next-week'
				? 'next-week'
				: 'current-week';
	const weekOffset = view === 'last-week' ? -1 : view === 'next-week' ? 1 : 0;
	const configuredTimeZone = env.DISPLAY_TIMEZONE?.trim() || DEFAULT_TIMEZONE;
	const timeZoneIsValid = isValidTimeZone(configuredTimeZone);
	const timeZone = timeZoneIsValid ? configuredTimeZone : DEFAULT_TIMEZONE;
	const range = createScheduleRange(new Date(), timeZone, weekOffset);
	const configuredTeams = getCalendlyTeams(env);
	const selectedTeam = configuredTeams.find((team) => team.slug === params.team) ?? null;

	if (configuredTeams.length > 0 && !selectedTeam) {
		error(404, 'Instructor team not found');
	}

	const teams = configuredTeams.map(({ slug, name }) => ({ slug, name }));
	const base = {
		view,
		teams,
		selectedTeam: selectedTeam ? { slug: selectedTeam.slug, name: selectedTeam.name } : null,
		timeZone,
		today: range.today,
		startDate: range.startDate,
		endDate: range.dates.at(-1)!,
		lastUpdated: new Date().toISOString()
	} as const;

	const organizationUri = env.CALENDLY_ORGANIZATION_URI?.trim() ?? '';
	const missing = [
		!organizationUri && 'CALENDLY_ORGANIZATION_URI',
		!selectedTeam &&
			(env.CALENDLY_TEAMS?.trim()
				? 'CALENDLY_TEAMS (no teams with valid configuration and PATs)'
				: 'CALENDLY_TEAMS or CALENDLY_TOKEN + CALENDLY_GROUP_URI'),
		!timeZoneIsValid && 'DISPLAY_TIMEZONE (invalid IANA timezone)',
		organizationUri && !isCalendlyUri(organizationUri, 'organizations') &&
			'CALENDLY_ORGANIZATION_URI (invalid URI)'
	].filter((item): item is string => Boolean(item));

	if (missing.length > 0) {
		return {
			...base,
			weeks: createWeeks(range.dates, []),
			eventCount: 0,
			inviteeFailureCount: 0,
			overbookedStudents: [],
			error: { kind: 'configuration', missing } satisfies ScheduleError
		};
	}

	try {
		const result = await getSchedule(
			{
				token: selectedTeam!.token,
				organizationUri,
				groupUri: selectedTeam!.groupUri,
				timeZone
			},
			range
		);

		return {
			...base,
			weeks: createWeeks(range.dates, result.events),
			eventCount: result.events.length,
			inviteeFailureCount: result.inviteeFailureCount,
			overbookedStudents: result.overbookedStudents,
			error: null
		};
	} catch (caughtError) {
		const kind: ScheduleError['kind'] =
			caughtError instanceof CalendlyRequestError ? caughtError.kind : 'unavailable';

		return {
			...base,
			weeks: createWeeks(range.dates, []),
			eventCount: 0,
			inviteeFailureCount: 0,
			overbookedStudents: [],
			error: { kind } satisfies ScheduleError
		};
	}
};
