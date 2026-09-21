export type ScheduleView = 'this-week' | 'three-weeks';

export type ScheduleErrorKind =
	| 'configuration'
	| 'authentication'
	| 'permission'
	| 'unavailable';

export interface ScheduleError {
	kind: ScheduleErrorKind;
	missing?: string[];
}

export interface ScheduleEvent {
	key: string;
	date: string;
	name: string;
	startTime: string;
	endTime: string;
	hosts: string[];
	invitees: string[];
	inviteesUnavailable: boolean;
}

export interface OverbookedStudent {
	name: string;
	sessionCount: number;
	weekStart: string;
	weekEnd: string;
}

export interface ScheduleDay {
	date: string;
	events: ScheduleEvent[];
}

export interface ScheduleWeek {
	key: string;
	days: ScheduleDay[];
}

const civilDateFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'UTC',
	weekday: 'short',
	month: 'short',
	day: 'numeric'
});

const civilDayFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'UTC',
	day: 'numeric'
});

const rangeDateFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'UTC',
	month: 'short',
	day: 'numeric',
	year: 'numeric'
});

function civilDate(date: string) {
	return new Date(`${date}T12:00:00Z`);
}

export function formatDay(date: string) {
	return civilDateFormatter.format(civilDate(date));
}

export function formatDayNumber(date: string) {
	return civilDayFormatter.format(civilDate(date));
}

export function formatRange(start: string, end: string) {
	return `${rangeDateFormatter.format(civilDate(start))} – ${rangeDateFormatter.format(civilDate(end))}`;
}

export function formatTime(iso: string, timeZone: string) {
	return new Intl.DateTimeFormat('en-US', {
		timeZone,
		hour: 'numeric',
		minute: '2-digit'
	}).format(new Date(iso));
}

export function formatUpdated(iso: string, timeZone: string) {
	return new Intl.DateTimeFormat('en-US', {
		timeZone,
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit'
	}).format(new Date(iso));
}

export function formatTimezone(timeZone: string) {
	const shortName = new Intl.DateTimeFormat('en-US', {
		timeZone,
		timeZoneName: 'short'
	})
		.formatToParts(new Date())
		.find((part) => part.type === 'timeZoneName')?.value;

	return shortName ? `${timeZone} (${shortName})` : timeZone;
}
