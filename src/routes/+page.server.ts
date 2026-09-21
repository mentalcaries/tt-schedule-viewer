import { env } from '$env/dynamic/private';
import { CalendlyRequestError, getSchedule, type ScheduleEvent } from '$lib/server/calendly';
import { createScheduleRange, isValidTimeZone } from '$lib/server/date-range';
import type { PageServerLoad } from './$types';

const DEFAULT_TIMEZONE = 'America/New_York';

type ErrorKind = 'configuration' | 'authentication' | 'permission' | 'unavailable';

interface ScheduleError {
	kind: ErrorKind;
	missing?: string[];
}

function isCalendlyUri(value: string, resource: 'organizations' | 'groups') {
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

export const load: PageServerLoad = async ({ depends, setHeaders, url }) => {
	depends('app:schedule');
	setHeaders({ 'cache-control': 'private, no-store' });

	const view = url.searchParams.get('range') === '3' ? 'three-weeks' : 'this-week';
	const weekCount = view === 'three-weeks' ? 3 : 1;
	const configuredTimeZone = env.DISPLAY_TIMEZONE?.trim() || DEFAULT_TIMEZONE;
	const timeZoneIsValid = isValidTimeZone(configuredTimeZone);
	const timeZone = timeZoneIsValid ? configuredTimeZone : DEFAULT_TIMEZONE;
	const range = createScheduleRange(new Date(), timeZone, weekCount);
	const base = {
		view,
		timeZone,
		today: range.today,
		startDate: range.startDate,
		endDate: range.dates.at(-1)!,
		lastUpdated: new Date().toISOString()
	} as const;

	const token = env.CALENDLY_TOKEN?.trim() ?? '';
	const organizationUri = env.CALENDLY_ORGANIZATION_URI?.trim() ?? '';
	const groupUri = env.CALENDLY_GROUP_URI?.trim() ?? '';
	const missing = [
		!token && 'CALENDLY_TOKEN',
		!organizationUri && 'CALENDLY_ORGANIZATION_URI',
		!groupUri && 'CALENDLY_GROUP_URI',
		!timeZoneIsValid && 'DISPLAY_TIMEZONE (invalid IANA timezone)',
		organizationUri && !isCalendlyUri(organizationUri, 'organizations') &&
			'CALENDLY_ORGANIZATION_URI (invalid URI)',
		groupUri && !isCalendlyUri(groupUri, 'groups') && 'CALENDLY_GROUP_URI (invalid URI)'
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
			{ token, organizationUri, groupUri, timeZone },
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
	} catch (error) {
		const kind: ErrorKind =
			error instanceof CalendlyRequestError ? error.kind : 'unavailable';

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
