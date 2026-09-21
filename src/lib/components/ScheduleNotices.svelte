<script lang="ts">
	import { formatRange, type OverbookedStudent, type ScheduleView } from '$lib/schedule';

	interface Props {
		inviteeFailureCount: number;
		overbookedStudents: OverbookedStudent[];
		eventCount: number;
		view: ScheduleView;
	}

	let { inviteeFailureCount, overbookedStudents, eventCount, view }: Props = $props();
</script>

{#if inviteeFailureCount > 0}
	<div class="alert alert-warning alert-soft mb-5 text-xs" role="status">
		<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7" />
			<path d="M12 11v5M12 7.5v.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
		</svg>
		<span>
			Invitee details are unavailable for {inviteeFailureCount}
			{inviteeFailureCount === 1 ? 'call' : 'calls'}. All available schedule data is shown.
		</span>
	</div>
{/if}

{#if overbookedStudents.length > 0}
	<section
		class="alert mb-6 items-start border border-l-4 border-warning/60 bg-warning/20 text-warning-content"
		aria-labelledby="overbooking-title"
	>
		<div class="grid size-9 shrink-0 place-items-center rounded-box bg-warning/20 text-warning-content">
			<svg class="size-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M8 7V4m8 3V4M4.5 10h15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
				<rect x="4.5" y="5.5" width="15" height="14" rx="3" stroke="currentColor" stroke-width="1.7" />
				<path d="M9 14h6M12 11v6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
			</svg>
		</div>
		<div class="w-full lg:grid lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,2fr)] lg:gap-5">
			<div>
				<h2 id="overbooking-title" class="font-bold">Students over the weekly limit</h2>
				<p class="mt-0.5 text-xs opacity-75">
					These students booked more than two sessions in a Sunday–Saturday week.
				</p>
			</div>
			<ul
				class="mt-3 grid gap-2 text-base-content sm:grid-cols-2 lg:mt-0"
			>
				{#each overbookedStudents as student, studentIndex (`${student.weekStart}-${studentIndex}`)}
					<li
						class="flex items-center justify-between gap-4 rounded-box border border-base-300 bg-base-100 px-3 py-2 shadow-xs"
					>
						<div>
							<p class="text-sm font-bold">{student.name}</p>
							{#if view === 'three-weeks'}
								<p class="mt-0.5 text-[0.625rem] opacity-65">
									{formatRange(student.weekStart, student.weekEnd)}
								</p>
							{/if}
						</div>
						<span class="badge badge-warning badge-sm whitespace-nowrap font-bold">
							{student.sessionCount} {student.sessionCount === 1 ? 'session' : 'sessions'}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

{#if eventCount === 0}
	<div class="alert alert-info alert-soft mb-6">
		<span class="badge badge-info size-11 rounded-full text-base font-bold">0</span>
		<div>
			<h2 class="font-bold">No calls scheduled</h2>
			<p class="text-xs">The selected weeks are clear. Empty days remain visible below.</p>
		</div>
	</div>
{/if}
