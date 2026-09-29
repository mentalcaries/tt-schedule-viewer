<script lang="ts">
  import logo from '$lib/assets/tt-text.svg';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Instructor Team Schedules</title>
  <meta
    name="description"
    content="Select an instructor team to view its weekly schedule."
  />
</svelte:head>

<main
  class="min-h-screen bg-base-200 px-4 pt-20 pb-10 text-base-content sm:px-6 sm:pt-28 lg:pt-40"
>
  <div class="mx-auto w-full max-w-4xl">
    <header class="text-center">
      <div class="mb-5 flex items-center justify-center gap-2.5">
        <img src={logo} alt="Tripleten Text Logo" class="h-4" />
        <p
          class="text-xs font-bold tracking-[0.16em] text-base-content/55 uppercase"
        >
          Internal schedule
        </p>
      </div>
      <h1
        class="font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
      >
        Choose a program
      </h1>
      <p class="mt-3 text-sm text-base-content/60">
        Select an instructor team to view its weekly schedule.
      </p>
    </header>

    {#if data.teams.length > 0}
      <nav
        class="mt-9 flex flex-wrap justify-center gap-4"
        aria-label="Instructor programs"
      >
        {#each data.teams as team (team.slug)}
          <a
            href={`/teams/${team.slug}`}
            class="card card-border group w-full bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]"
          >
            <div class="card-body flex-row items-center justify-between gap-5">
              <div>
                <p
                  class="text-xs font-bold tracking-wide text-base-content/45 uppercase"
                >
                  Program
                </p>
                <h2 class="mt-1 text-xl font-bold">{team.name}</h2>
              </div>
              <svg
                class="size-5 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-70"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m9 5 7 7-7 7"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </a>
        {/each}
      </nav>
    {:else}
      <section
        class="card card-border mx-auto mt-9 max-w-xl bg-base-100 text-center shadow-sm"
      >
        <div class="card-body items-center">
          <h2 class="card-title">No programs available</h2>
          <p class="text-sm opacity-65">
            Add a valid team definition and PAT to the private environment
            configuration.
          </p>
        </div>
      </section>
    {/if}
  </div>
</main>
