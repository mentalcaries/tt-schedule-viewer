<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { navigating } from '$app/state';
  import type { PageProps } from './$types';
  import logo from '$lib/assets/tt-text.svg';

  let { data }: PageProps = $props();
  let refreshing = $state(false);
  let loading = $derived(refreshing || navigating.to !== null);

  const civilDateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const civilDayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    day: 'numeric',
  });
  const rangeDateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  function civilDate(date: string) {
    return new Date(`${date}T12:00:00Z`);
  }

  function formatDay(date: string) {
    return civilDateFormatter.format(civilDate(date));
  }

  function formatDayNumber(date: string) {
    return civilDayFormatter.format(civilDate(date));
  }

  function formatRange(start: string, end: string) {
    return `${rangeDateFormatter.format(civilDate(start))} – ${rangeDateFormatter.format(civilDate(end))}`;
  }

  function formatTime(iso: string) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: data.timeZone,
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  }

  function formatUpdated(iso: string) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: data.timeZone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(iso));
  }

  function timezoneLabel() {
    const shortName = new Intl.DateTimeFormat('en-US', {
      timeZone: data.timeZone,
      timeZoneName: 'short',
    })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName')?.value;

    return shortName ? `${data.timeZone} (${shortName})` : data.timeZone;
  }

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
  <meta
    name="description"
    content="A read-only weekly view of scheduled SE instructor calls."
  />
</svelte:head>

{#if loading}
  <div
    class="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-sky-100"
    aria-hidden="true"
  >
    <div class="loading-bar h-full bg-sky-500"></div>
  </div>
{/if}

<main class="min-h-screen px-4 py-6 text-slate-900 sm:px-6 lg:px-8 lg:py-9">
  <div class="mx-auto max-w-[1540px]">
    <header
      class="mb-7 border-b border-slate-200 pb-6 lg:mb-9 lg:flex lg:items-end lg:justify-between"
    >
      <div>
        <div class="mb-4 flex items-center gap-2.5">
          <img src={logo} alt="Tripleten Text Logo" class="h-4"/>
          <p
            class="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase"
          >
            Internal schedule
          </p>
        </div>
        <h1
          class="font-display text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl"
        >
          AISE Instructor Team Schedule
        </h1>
        <div
          class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600"
        >
          <span class="font-medium text-slate-800"
            >{formatRange(data.startDate, data.endDate)}</span
          >
          <span class="hidden size-1 rounded-full bg-slate-300 sm:block"></span>
          <span class="inline-flex items-center gap-1.5">
            <svg
              class="size-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                stroke-width="1.7"
              />
              <path
                d="M3.5 12h17M12 3c2.2 2.45 3.3 5.45 3.3 9S14.2 18.55 12 21c-2.2-2.45-3.3-5.45-3.3-9S9.8 5.45 12 3Z"
                stroke="currentColor"
                stroke-width="1.7"
              />
            </svg>
            {timezoneLabel()}
          </span>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-0">
        <nav class="segmented-control" aria-label="Schedule range">
          <a
            href="/"
            aria-current={data.view === 'this-week' ? 'page' : undefined}
            >This week</a
          >
          <a
            href="?range=3"
            aria-current={data.view === 'three-weeks' ? 'page' : undefined}
          >
            Next 2 weeks
          </a>
        </nav>
        <button
          type="button"
          class="refresh-button"
          disabled={loading}
          onclick={refresh}
          aria-label="Refresh schedule"
        >
          <svg
            class:animate-spin={refreshing}
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
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
          Refresh
        </button>
      </div>
    </header>

    <div
      class="mb-5 flex min-h-6 flex-wrap items-center justify-between gap-2 text-xs text-slate-500"
    >
      <p aria-live="polite">
        {#if loading}
          Updating schedule…
        {:else}
          Last updated {formatUpdated(data.lastUpdated)}
        {/if}
      </p>
      {#if !data.error}
        <p>
          {data.eventCount}
          {data.eventCount === 1 ? 'call' : 'calls'} in view
        </p>
      {/if}
    </div>

    {#if data.error}
      <section class="state-panel" aria-labelledby="error-title">
        <div class="state-icon state-icon-error">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
        {#if data.error.kind === 'configuration'}
          <h2 id="error-title">Schedule configuration needed</h2>
          <p>
            Set the required private environment variables, then restart the
            application.
          </p>
          {#if data.error.missing}
            <div class="mt-5 flex flex-wrap justify-center gap-2">
              {#each data.error.missing as variable}
                <code>{variable}</code>
              {/each}
            </div>
          {/if}
        {:else if data.error.kind === 'permission'}
          <h2 id="error-title">Calendly permission required</h2>
          <p>
            The configured token cannot read scheduled events for the SE
            Instructors group.
          </p>
        {:else if data.error.kind === 'authentication'}
          <h2 id="error-title">Calendly connection needs attention</h2>
          <p>
            The configured token could not be authenticated. Replace it with a
            valid private token.
          </p>
        {:else}
          <h2 id="error-title">Schedule temporarily unavailable</h2>
          <p>
            Calendly could not be reached. Refresh the schedule to try again.
          </p>
        {/if}
      </section>
    {:else}
      {#if data.inviteeFailureCount > 0}
        <div class="warning-banner" role="status">
          <svg
            class="size-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              stroke-width="1.7"
            />
            <path
              d="M12 11v5M12 7.5v.1"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          Invitee details are unavailable for {data.inviteeFailureCount}
          {data.inviteeFailureCount === 1 ? 'call' : 'calls'}. All available
          schedule data is shown.
        </div>
      {/if}

      {#if data.overbookedStudents.length > 0}
        <section class="overbooking-panel" aria-labelledby="overbooking-title">
          <div class="overbooking-heading">
            <div class="overbooking-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M8 7V4m8 3V4M4.5 10h15"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
                <rect
                  x="4.5"
                  y="5.5"
                  width="15"
                  height="14"
                  rx="3"
                  stroke="currentColor"
                  stroke-width="1.7"
                />
                <path
                  d="M9 14h6M12 11v6"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <div>
              <h2 id="overbooking-title">Students over the weekly limit</h2>
              <p>
                These students booked more than two sessions in a
                Sunday–Saturday week.
              </p>
            </div>
          </div>
          <ul class="overbooking-list">
            {#each data.overbookedStudents as student, studentIndex (`${student.weekStart}-${studentIndex}`)}
              <li>
                <div>
                  <p class="overbooking-name">{student.name}</p>
                  {#if data.view === 'three-weeks'}
                    <p class="overbooking-week">
                      {formatRange(student.weekStart, student.weekEnd)}
                    </p>
                  {/if}
                </div>
                <span class="overbooking-count">
                  {student.sessionCount}
                  {student.sessionCount === 1 ? 'session' : 'sessions'}
                </span>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if data.eventCount === 0}
        <div class="empty-summary">
          <span class="empty-summary-mark">0</span>
          <div>
            <h2>No calls scheduled</h2>
            <p>
              The selected weeks are clear. Empty days remain visible below.
            </p>
          </div>
        </div>
      {/if}

      <div
        class:opacity-60={loading}
        class="space-y-8 transition-opacity duration-200"
        aria-busy={loading}
      >
        {#each data.weeks as week, weekIndex (week.key)}
          <section aria-labelledby={`week-${week.key}`}>
            <div class="mb-3 flex items-center gap-3">
              <h2
                id={`week-${week.key}`}
                class="text-sm font-bold text-slate-800"
              >
                {weekIndex === 0 ? 'Current week' : `Week ${weekIndex + 1}`}
              </h2>
              <div class="h-px flex-1 bg-slate-200"></div>
              <p class="text-xs text-slate-500">
                {formatRange(week.days[0].date, week.days[6].date)}
              </p>
            </div>

            <div class="week-grid">
              {#each week.days as day (day.date)}
                <article
                  class:today={day.date === data.today}
                  class="day-column"
                >
                  <header class="day-heading">
                    <div>
                      <p class="day-name">
                        {formatDay(day.date).split(',')[0]}
                      </p>
                      <p class="day-mobile-date">{formatDay(day.date)}</p>
                    </div>
                    <span class="day-number">{formatDayNumber(day.date)}</span>
                  </header>

                  <div class="day-events">
                    {#if day.events.length === 0}
                      <div class="empty-day">
                        <span></span>
                        No calls
                      </div>
                    {:else}
                      {#each day.events as event (event.key)}
                        <div class="event-card">
                          <p class="event-time">
                            {formatTime(event.startTime)} – {formatTime(
                              event.endTime,
                            )}
                          </p>
                          <h3>
                            {#if event.inviteesUnavailable}
                              <span class="text-amber-700"
                                >Invitee unavailable</span
                              >
                            {:else if event.invitees.length}
                              {event.invitees.join(', ')}
                            {:else}
                              Invitee not available
                            {/if}
                          </h3>
                          <dl>
                            <div>
                              <dt>Host</dt>
                              <dd>
                                {event.hosts.length
                                  ? event.hosts.join(', ')
                                  : 'Not available'}
                              </dd>
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
          </section>
        {/each}
      </div>
    {/if}
  </div>
</main>
