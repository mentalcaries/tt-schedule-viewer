<script lang="ts">
	import {
		formatDay,
		formatDayNumber,
		formatRange,
		formatTime,
		type ScheduleWeek
	} from '$lib/schedule';

	interface Props {
		weeks: ScheduleWeek[];
		today: string;
		timeZone: string;
		loading: boolean;
	}

	let { weeks, today, timeZone, loading }: Props = $props();
</script>

<div class:opacity-60={loading} class="space-y-8 transition-opacity duration-200" aria-busy={loading}>
	{#each weeks as week, weekIndex (week.key)}
		<section aria-labelledby={`week-${week.key}`}>
			<div class="mb-3 flex items-center gap-3">
				<h2 id={`week-${week.key}`} class="text-base font-bold">
					{weekIndex === 0 ? 'Current week' : `Week ${weekIndex + 1}`}
				</h2>
				<div class="h-px flex-1 bg-base-300"></div>
				<p class="text-sm opacity-60">{formatRange(week.days[0].date, week.days[6].date)}</p>
			</div>

			<!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable calendar must be keyboard-focusable.) -->
			<div
				class="calendar-scroll"
				role="region"
				tabindex="0"
				aria-label={`Week of ${formatDay(week.days[0].date)} calendar`}
			>
				<div class="week-grid">
					{#each week.days as day (day.date)}
						<article class:today={day.date === today} class="day-column card card-border bg-base-100 shadow-sm">
							<header class="day-heading">
								<div>
									<p class="day-name">{formatDay(day.date).split(',')[0]}</p>
									<p class="day-mobile-date">{formatDay(day.date)}</p>
								</div>
								<span class="day-number">{formatDayNumber(day.date)}</span>
							</header>

							<div class="day-events">
								{#if day.events.length === 0}
									<div class="empty-day"><span></span>No calls</div>
								{:else}
									{#each day.events as event (event.key)}
										<div class="event-card card card-border bg-base-100 shadow-sm">
											<p class="event-time">
												{formatTime(event.startTime, timeZone)} – {formatTime(event.endTime, timeZone)}
											</p>
											<h3>
												{#if event.inviteesUnavailable}
													<span class="text-warning">Invitee unavailable</span>
												{:else if event.invitees.length}
													{event.invitees.join(', ')}
												{:else}
													Invitee not available
												{/if}
											</h3>
											<dl>
												<div>
													<dt>Host</dt>
													<dd>{event.hosts.length ? event.hosts.join(', ') : 'Not available'}</dd>
												</div>
												<div class="meeting-detail">
													<dt>Meeting</dt>
													<dd>{event.name}</dd>
												</div>
											</dl>
										</div>
									{/each}
								{/if}
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>
	{/each}
</div>
