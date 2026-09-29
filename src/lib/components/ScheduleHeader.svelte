<script lang="ts">
	import logo from '$lib/assets/tt-text.svg';
	import {
		formatRange,
		formatTimezone,
		formatUpdated,
		type ScheduleTeam,
		type ScheduleView
	} from '$lib/schedule';

	interface Props {
		startDate: string;
		endDate: string;
		timeZone: string;
		lastUpdated: string;
		eventCount: number;
		teams: ScheduleTeam[];
		selectedTeam: ScheduleTeam | null;
		view: ScheduleView;
		loading: boolean;
		refreshing: boolean;
		hasError: boolean;
		onRefresh: () => Promise<void>;
	}

	let {
		startDate,
		endDate,
		timeZone,
		lastUpdated,
		eventCount,
		teams,
		selectedTeam,
		view,
		loading,
		refreshing,
		hasError,
		onRefresh
	}: Props = $props();

	const weekPaths: Record<ScheduleView, string> = {
		'last-week': '/last-week',
		'current-week': '',
		'next-week': '/next-week'
	};

	function teamHref(slug: string) {
		return `/teams/${slug}${weekPaths[view]}`;
	}

	function weekHref(week: '' | '/last-week' | '/next-week') {
		return selectedTeam ? `/teams/${selectedTeam.slug}${week}` : '/';
	}

	function changeTeam(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		window.location.assign(teamHref(select.value));
	}
</script>

{#if loading}
	<progress
		class="progress progress-info fixed inset-x-0 top-0 z-50 h-1 w-full rounded-none"
		aria-label="Updating schedule"
	></progress>
{/if}

<header class="mb-7 border-b border-base-300 pb-6 lg:mb-9 lg:flex lg:items-end lg:justify-between">
	<div>
		<a href="/" class="mb-4 flex w-fit items-center gap-2.5" aria-label="Choose another program">
			<img src={logo} alt="Tripleten Text Logo" class="h-4" />
			<p class="text-xs font-bold tracking-[0.16em] text-base-content/55 uppercase">
				Internal schedule
			</p>
		</a>
		<h1 class="font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
			{selectedTeam ? `${selectedTeam.name} Instructor Team Schedule` : 'Instructor Team Schedule'}
		</h1>
		<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-base-content/65">
			<span class="font-medium text-base-content/85">{formatRange(startDate, endDate)}</span>
			<span class="hidden size-1 rounded-full bg-base-content/25 sm:block"></span>
			<span class="inline-flex items-center gap-1.5">
				<svg class="size-4 opacity-60" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7" />
					<path
						d="M3.5 12h17M12 3c2.2 2.45 3.3 5.45 3.3 9S14.2 18.55 12 21c-2.2-2.45-3.3-5.45-3.3-9S9.8 5.45 12 3Z"
						stroke="currentColor"
						stroke-width="1.7"
					/>
				</svg>
				{formatTimezone(timeZone)}
			</span>
		</div>
	</div>

	<div class="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:mt-0 lg:justify-end">
		{#if teams.length > 0}
			<div class="form-control">
				<label for="team-select" class="mb-1 text-[0.625rem] font-bold tracking-wide uppercase opacity-60">
					Program
				</label>
				<select
					id="team-select"
					class="select select-sm min-w-32"
					onchange={changeTeam}
				>
					{#each teams as team (team.slug)}
						<option value={team.slug} selected={team.slug === selectedTeam?.slug}>{team.name}</option>
					{/each}
				</select>
			</div>
		{/if}
		<nav class="join grid grid-cols-3" aria-label="Schedule week">
			<a
				href={weekHref('/last-week')}
				class:btn-active={view === 'last-week'}
				class="btn btn-sm join-item"
				aria-current={view === 'last-week' ? 'page' : undefined}>Last week</a
			>
			<a
				href={weekHref('')}
				class:btn-active={view === 'current-week'}
				class="btn btn-sm join-item"
				aria-current={view === 'current-week' ? 'page' : undefined}>Current week</a
			>
			<a
				href={weekHref('/next-week')}
				class:btn-active={view === 'next-week'}
				class="btn btn-sm join-item"
				aria-current={view === 'next-week' ? 'page' : undefined}>Next week</a
			>
		</nav>
		<button
			type="button"
			class="btn btn-sm btn-outline"
			disabled={loading}
			onclick={onRefresh}
			aria-label="Refresh schedule"
		>
			{#if refreshing}
				<span class="loading loading-spinner loading-xs" aria-hidden="true"></span>
			{:else}
				<svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M19.5 8.5A8 8 0 1 0 20 14"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
					/>
					<path
						d="m16 5 3.8 3.7L23 4.5"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{/if}
			Refresh
		</button>
	</div>
</header>

<div class="mb-5 flex min-h-6 flex-wrap items-center justify-between gap-2 text-xs opacity-60">
	<p aria-live="polite">
		{#if loading}
			Updating schedule…
		{:else}
			Last updated {formatUpdated(lastUpdated, timeZone)}
		{/if}
	</p>
	{#if !hasError}
		<p>{eventCount} {eventCount === 1 ? 'call' : 'calls'} in view</p>
	{/if}
</div>
