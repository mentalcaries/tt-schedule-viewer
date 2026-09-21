<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { navigating } from '$app/state';
	import ScheduleCalendar from '$lib/components/ScheduleCalendar.svelte';
	import ScheduleError from '$lib/components/ScheduleError.svelte';
	import ScheduleHeader from '$lib/components/ScheduleHeader.svelte';
	import ScheduleNotices from '$lib/components/ScheduleNotices.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let refreshing = $state(false);
	let loading = $derived(refreshing || navigating.to !== null);

	async function refresh() {
		if (refreshing) return;
		refreshing = true;
		try {
			await invalidateAll();
		} finally {
			refreshing = false;
		}
	}
</script>

<svelte:head>
	<title>SE Instructor Schedule</title>
	<meta name="description" content="A read-only weekly view of scheduled SE instructor calls." />
</svelte:head>

<main class="min-h-screen bg-base-200 px-4 py-6 text-base-content sm:px-6 lg:px-8 lg:py-9">
	<div class="mx-auto max-w-[1540px]">
		<ScheduleHeader
			startDate={data.startDate}
			endDate={data.endDate}
			timeZone={data.timeZone}
			lastUpdated={data.lastUpdated}
			eventCount={data.eventCount}
			view={data.view}
			{loading}
			{refreshing}
			hasError={Boolean(data.error)}
			onRefresh={refresh}
		/>

		{#if data.error}
			<ScheduleError error={data.error} />
		{:else}
			<ScheduleNotices
				inviteeFailureCount={data.inviteeFailureCount}
				overbookedStudents={data.overbookedStudents}
				eventCount={data.eventCount}
				view={data.view}
			/>
			<ScheduleCalendar
				weeks={data.weeks}
				today={data.today}
				timeZone={data.timeZone}
				{loading}
			/>
		{/if}
	</div>
</main>
