export interface CalendarDate {
	year: number;
	month: number;
	day: number;
}

export interface ScheduleRange {
	startDate: string;
	endDateExclusive: string;
	minStartTime: string;
	maxStartTime: string;
	today: string;
	dates: string[];
}

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

function getDateTimeFormatter(timeZone: string) {
	let formatter = dateTimeFormatters.get(timeZone);

	if (!formatter) {
		formatter = new Intl.DateTimeFormat('en-US', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hourCycle: 'h23'
		});
		dateTimeFormatters.set(timeZone, formatter);
	}

	return formatter;
}

function getZonedParts(date: Date, timeZone: string) {
	const values: Record<string, number> = {};

	for (const part of getDateTimeFormatter(timeZone).formatToParts(date)) {
		if (part.type !== 'literal') values[part.type] = Number(part.value);
	}

	return {
		year: values.year,
		month: values.month,
		day: values.day,
		hour: values.hour,
		minute: values.minute,
		second: values.second
	};
}

function formatDate({ year, month, day }: CalendarDate) {
	return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
		.toString()
		.padStart(2, '0')}`;
}

function addDays(date: CalendarDate, amount: number): CalendarDate {
	const result = new Date(Date.UTC(date.year, date.month - 1, date.day + amount, 12));
	return {
		year: result.getUTCFullYear(),
		month: result.getUTCMonth() + 1,
		day: result.getUTCDate()
	};
}

function startOfWeek(date: CalendarDate) {
	const weekday = new Date(Date.UTC(date.year, date.month - 1, date.day, 12)).getUTCDay();
	return addDays(date, -weekday);
}

function zonedMidnightToUtc(date: CalendarDate, timeZone: string) {
	const target = Date.UTC(date.year, date.month - 1, date.day);
	let candidate = target;

	// Re-evaluate the offset because it can differ on either side of a DST boundary.
	for (let iteration = 0; iteration < 4; iteration += 1) {
		const parts = getZonedParts(new Date(candidate), timeZone);
		const representedAsUtc = Date.UTC(
			parts.year,
			parts.month - 1,
			parts.day,
			parts.hour,
			parts.minute,
			parts.second
		);
		const nextCandidate = target - (representedAsUtc - candidate);
		if (nextCandidate === candidate) break;
		candidate = nextCandidate;
	}

	return new Date(candidate);
}

export function isValidTimeZone(timeZone: string) {
	try {
		getDateTimeFormatter(timeZone).format(new Date());
		return true;
	} catch {
		return false;
	}
}

export function getDateKey(date: Date, timeZone: string) {
	const { year, month, day } = getZonedParts(date, timeZone);
	return formatDate({ year, month, day });
}

export function createScheduleRange(now: Date, timeZone: string, weekCount: 1 | 3): ScheduleRange {
	const todayParts = getZonedParts(now, timeZone);
	const today = { year: todayParts.year, month: todayParts.month, day: todayParts.day };
	const start = startOfWeek(today);
	const end = addDays(start, weekCount * 7);
	const dates = Array.from({ length: weekCount * 7 }, (_, index) =>
		formatDate(addDays(start, index))
	);

	return {
		startDate: formatDate(start),
		endDateExclusive: formatDate(end),
		minStartTime: zonedMidnightToUtc(start, timeZone).toISOString(),
		maxStartTime: zonedMidnightToUtc(end, timeZone).toISOString(),
		today: formatDate(today),
		dates
	};
}
