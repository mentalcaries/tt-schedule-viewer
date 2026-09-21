<script lang="ts">
	import logo from '$lib/assets/tt-text.svg';
	import {
		formatRange,
		formatTimezone,
		formatUpdated,
		type ScheduleView
	} from '$lib/schedule';

	interface Props {
		startDate: string;
		endDate: string;
		timeZone: string;
		lastUpdated: string;
		eventCount: number;
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
		view,
		loading,
		refreshing,
		hasError,
		onRefresh
	}: Props = $props();
</script>

{#if loading}
	<progress
		class="progress progress-info fixed inset-x-0 top-0 z-50 h-1 w-full rounded-none"
		aria-label="Updating schedule"
	></progress>
{/if}

<header class="mb-7 border-b border-base-300 pb-6 lg:mb-9 lg:flex lg:items-end lg:justify-between">
	<div>
		<div class="mb-4 flex items-center gap-2.5">
			<img src={logo} alt="Tripleten Text Logo" class="h-4" />
			<p class="text-xs font-bold tracking-[0.16em] text-base-content/55 uppercase">
				Internal schedule
			</p>
		</div>
		<h1 class="font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
			AISE Instructor Team Schedule
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

	<div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-0">
		<nav class="join grid grid-cols-2" aria-label="Schedule range">
			<a
				href="/"
				class:btn-active={view === 'this-week'}
				class="btn btn-sm join-item"
				aria-current={view === 'this-week' ? 'page' : undefined}>This week</a
			>
			<a
				href="?range=3"
				class:btn-active={view === 'three-weeks'}
				class="btn btn-sm join-item"
				aria-current={view === 'three-weeks' ? 'page' : undefined}>Next 2 weeks</a
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
