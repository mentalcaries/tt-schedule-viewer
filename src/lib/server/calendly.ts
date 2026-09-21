import { getDateKey, type ScheduleRange } from './date-range';
import type { OverbookedStudent, ScheduleEvent } from '$lib/schedule';

export type { OverbookedStudent, ScheduleEvent } from '$lib/schedule';

interface CalendlyConfig {
	token: string;
	organizationUri: string;
	groupUri: string;
	timeZone: string;
}

interface RawScheduledEvent {
	uri: string;
	name: string | null;
	status: 'active' | 'canceled';
	start_time: string;
	end_time: string;
	event_memberships: Array<{ user_name?: string }>;
}

interface RawInvitee {
	name: string;
	email: string;
	status: 'active' | 'canceled';
}

interface InviteeIdentity {
	name: string;
	email: string;
}

interface PaginatedResponse<T> {
	collection: T[];
	pagination: { next_page_token: string | null };
}

export interface ScheduleResult {
	events: ScheduleEvent[];
	inviteeFailureCount: number;
	overbookedStudents: OverbookedStudent[];
}

export type CalendlyErrorKind = 'authentication' | 'permission' | 'unavailable';

export class CalendlyRequestError extends Error {
	constructor(public readonly kind: CalendlyErrorKind) {
		super('Calendly request failed');
		this.name = 'CalendlyRequestError';
	}
}

function eventUuid(uri: string) {
	try {
		const url = new URL(uri);
		const match = url.pathname.match(/^\/scheduled_events\/([^/]+)$/);
		return url.origin === 'https://api.calendly.com' ? match?.[1] : undefined;
	} catch {
		return undefined;
	}
}

function uniqueNames(names: Array<string | undefined>) {
	return [...new Set(names.map((name) => name?.trim()).filter((name): name is string => Boolean(name)))];
}

async function calendlyGet<T>(url: URL, token: string): Promise<PaginatedResponse<T>> {
	let response: Response;

	try {
		response = await fetch(url, {
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${token}`
			},
			cache: 'no-store'
		});
	} catch {
		throw new CalendlyRequestError('unavailable');
	}

	if (!response.ok) {
		if (response.status === 401) throw new CalendlyRequestError('authentication');
		if (response.status === 403) throw new CalendlyRequestError('permission');
		throw new CalendlyRequestError('unavailable');
	}

	try {
		const data = (await response.json()) as Partial<PaginatedResponse<T>>;
		if (!Array.isArray(data.collection) || !data.pagination) throw new Error('Invalid response');
		return data as PaginatedResponse<T>;
	} catch {
		throw new CalendlyRequestError('unavailable');
	}
}

async function listScheduledEvents(config: CalendlyConfig, range: ScheduleRange) {
	const events: RawScheduledEvent[] = [];
	const seenTokens = new Set<string>();
	let pageToken: string | null = null;

	do {
		const url = new URL('https://api.calendly.com/scheduled_events');
		url.searchParams.set('organization', config.organizationUri);
		url.searchParams.set('group', config.groupUri);
		url.searchParams.set('status', 'active');
		url.searchParams.set('min_start_time', range.minStartTime);
		url.searchParams.set('max_start_time', range.maxStartTime);
		url.searchParams.set('sort', 'start_time:asc');
		url.searchParams.set('count', '100');
		if (pageToken) url.searchParams.set('page_token', pageToken);

		const page = await calendlyGet<RawScheduledEvent>(url, config.token);
		events.push(...page.collection);
		pageToken = page.pagination.next_page_token;

		if (pageToken) {
			if (seenTokens.has(pageToken)) throw new CalendlyRequestError('unavailable');
			seenTokens.add(pageToken);
		}
	} while (pageToken);

	return events;
}

async function listInvitees(eventUri: string, token: string) {
	const uuid = eventUuid(eventUri);
	if (!uuid) throw new CalendlyRequestError('unavailable');

	const invitees: InviteeIdentity[] = [];
	const seenTokens = new Set<string>();
	let pageToken: string | null = null;

	do {
		const url = new URL(`https://api.calendly.com/scheduled_events/${uuid}/invitees`);
		url.searchParams.set('status', 'active');
		url.searchParams.set('sort', 'created_at:asc');
		url.searchParams.set('count', '100');
		if (pageToken) url.searchParams.set('page_token', pageToken);

		const page = await calendlyGet<RawInvitee>(url, token);
		invitees.push(
			...page.collection.map((invitee) => ({
				name: invitee.name.trim(),
				email: invitee.email.trim().toLowerCase()
			}))
		);
		pageToken = page.pagination.next_page_token;

		if (pageToken) {
			if (seenTokens.has(pageToken)) throw new CalendlyRequestError('unavailable');
			seenTokens.add(pageToken);
		}
	} while (pageToken);

	return invitees;
}

async function mapWithConcurrency<T, R>(
	items: T[],
	concurrency: number,
	mapper: (item: T, index: number) => Promise<R>
) {
	const results = new Array<R>(items.length);
	let nextIndex = 0;

	async function worker() {
		while (nextIndex < items.length) {
			const index = nextIndex;
			nextIndex += 1;
			results[index] = await mapper(items[index], index);
		}
	}

	await Promise.all(
		Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
	);
	return results;
}

export async function getSchedule(
	config: CalendlyConfig,
	range: ScheduleRange
): Promise<ScheduleResult> {
	const rawEvents = (await listScheduledEvents(config, range)).filter((event) => {
		const date = getDateKey(new Date(event.start_time), config.timeZone);
		return date >= range.startDate && date < range.endDateExclusive;
	});

	let inviteeFailureCount = 0;
	const eventResults = await mapWithConcurrency(rawEvents, 6, async (event, index) => {
		let invitees: InviteeIdentity[] = [];
		let inviteesUnavailable = false;

		try {
			invitees = await listInvitees(event.uri, config.token);
		} catch {
			inviteesUnavailable = true;
			inviteeFailureCount += 1;
		}

		return {
			event: {
				key: `${event.start_time}-${index}`,
				date: getDateKey(new Date(event.start_time), config.timeZone),
				name: event.name?.trim() || 'Scheduled call',
				startTime: event.start_time,
				endTime: event.end_time,
				hosts: uniqueNames(event.event_memberships?.map((membership) => membership.user_name) ?? []),
				invitees: uniqueNames(invitees.map((invitee) => invitee.name)),
				inviteesUnavailable
			} satisfies ScheduleEvent,
			invitees
		};
	});

	const datesToWeeks = new Map(
		range.dates.map((date, index) => {
			const weekOffset = Math.floor(index / 7) * 7;
			return [date, { start: range.dates[weekOffset], end: range.dates[weekOffset + 6] }] as const;
		})
	);
	const studentCounts = new Map<string, OverbookedStudent>();

	for (const { event, invitees } of eventResults) {
		const week = datesToWeeks.get(event.date);
		if (!week) continue;

		const uniqueInvitees = new Map(
			invitees
				.filter((invitee) => invitee.email)
				.map((invitee) => [invitee.email, invitee] as const)
		);

		for (const invitee of uniqueInvitees.values()) {
			const key = `${week.start}\u0000${invitee.email}`;
			const existing = studentCounts.get(key);
			studentCounts.set(key, {
				name: existing?.name || invitee.name || 'Name unavailable',
				sessionCount: (existing?.sessionCount ?? 0) + 1,
				weekStart: week.start,
				weekEnd: week.end
			});
		}
	}

	const overbookedStudents = [...studentCounts.values()]
		.filter((student) => student.sessionCount > 2)
		.sort(
			(a, b) =>
				a.weekStart.localeCompare(b.weekStart) ||
				b.sessionCount - a.sessionCount ||
				a.name.localeCompare(b.name)
		);

	return {
		events: eventResults.map((result) => result.event),
		inviteeFailureCount,
		overbookedStudents
	};
}
