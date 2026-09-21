<script lang="ts">
	import type { ScheduleError } from '$lib/schedule';

	let { error }: { error: ScheduleError } = $props();
</script>

<section class="card card-border mx-auto my-16 max-w-xl bg-base-100 shadow-sm" aria-labelledby="error-title">
	<div class="card-body items-center text-center">
		<div class="flex size-12 items-center justify-center rounded-full bg-error/10 text-error">
			<svg class="size-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path
					d="M12 8v5M12 16.5v.1"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
				/>
				<path
					d="M10.3 4.4 3.1 17a2 2 0 0 0 1.7 3h14.4a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0Z"
					stroke="currentColor"
					stroke-width="1.7"
				/>
			</svg>
		</div>
		{#if error.kind === 'configuration'}
			<h2 id="error-title" class="card-title mt-2">Schedule configuration needed</h2>
			<p class="max-w-lg text-sm opacity-65">
				Set the required private environment variables, then restart the application.
			</p>
			{#if error.missing}
				<div class="mt-3 flex flex-wrap justify-center gap-2">
					{#each error.missing as variable}
						<code class="badge badge-neutral badge-soft badge-sm">{variable}</code>
					{/each}
				</div>
			{/if}
		{:else if error.kind === 'permission'}
			<h2 id="error-title" class="card-title mt-2">Calendly permission required</h2>
			<p class="max-w-lg text-sm opacity-65">
				The configured token cannot read scheduled events for the SE Instructors group.
			</p>
		{:else if error.kind === 'authentication'}
			<h2 id="error-title" class="card-title mt-2">Calendly connection needs attention</h2>
			<p class="max-w-lg text-sm opacity-65">
				The configured token could not be authenticated. Replace it with a valid private token.
			</p>
		{:else}
			<h2 id="error-title" class="card-title mt-2">Schedule temporarily unavailable</h2>
			<p class="max-w-lg text-sm opacity-65">
				Calendly could not be reached. Refresh the schedule to try again.
			</p>
		{/if}
	</div>
</section>
