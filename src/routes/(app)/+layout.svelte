<script lang="ts">
	import Home from '~icons/lucide/home';
	import PanelLeft from '~icons/lucide/panel-left';
	import Settings from '~icons/lucide/settings';

	import Logo from '$lib/components/Logo.svelte';
	import PersonalMenu from '$lib/components/personal-menu.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import Breadcrumbs from './components/breadcrumbs.svelte';
	import NavLink from './components/nav-link.svelte';
	import { Clock, Flag, UsersRound } from 'lucide-svelte';
	import { Toaster } from 'svelte-sonner';

	export let data;
	let sheetOpen = false;

	const navLinks = [
		{
			name: 'Dashboard',
			path: '/dashboard',
			icon: Home,
		},
		{
			name: 'Groups',
			path: '/groups',
			icon: UsersRound,
		},
		{
			name: 'Tee Times',
			path: '/tee-times',
			icon: Clock,
		},
		{
			name: 'Courses',
			path: '/courses',
			icon: Flag,
		},
	];
</script>

<Toaster richColors position="top-right" />
<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<aside
		class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex"
	>
		<nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
			<a
				href="/"
				class="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 md:h-8 md:w-8"
			>
				<img
				class="h-[50px] w-[50px] object-cover"
				src={'/images/glfzy.png'}
				alt="logo"
							/>
				<span class="sr-only">Glfzy</span>
			</a>
			{#each navLinks as { name, path, icon: Icon }}
				<Tooltip.Root>
					<Tooltip.Trigger asChild let:builder>
						<NavLink
							href={path}
							class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
							activeClass="bg-accent text-accent-foreground"
							{builder}
						>
							<Icon class="h-5 w-5" />
							<span class="sr-only">{name}</span>
						</NavLink>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">{name}</Tooltip.Content>
				</Tooltip.Root>
			{/each}
		</nav>
		<!-- <nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<NavLink
						href="/settings"
						class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
						activeClass="bg-accent text-accent-foreground"
						{builder}
					>
						<Settings class="h-5 w-5" />
						<span class="sr-only">Settings</span>
					</NavLink>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Settings</Tooltip.Content>
			</Tooltip.Root>
		</nav> -->
	</aside>
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
		<header
			class="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
		>
			<Sheet.Root
			bind:open={sheetOpen}
			>
				<Sheet.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						size="icon"
						variant="outline"
						class="sm:hidden"
					>
						<PanelLeft class="h-5 w-5" />
						<span class="sr-only">Toggle Menu</span>
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="left" class="sm:max-w-xs">
					<nav class="grid gap-6 text-lg font-medium">
						<a
							href="##"
							class="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold text-primary-foreground md:text-base ml-5"
						>
							<img
								class="h-[100px] w-[100px] object-cover"
								src={'/images/glfzy.png'}
								alt="logo"
							/>
						</a>
						<a
							href="/dashboard"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
							on:click={()=>sheetOpen=false}
						>
							<Home class="h-5 w-5" />
							Dashboard
						</a>
						<a
							href="/groups"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
							on:click={()=>sheetOpen=false}
						>
							<UsersRound class="h-5 w-5" />
							Groups
						</a>
						<a
							href="/tee-times"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
							on:click={()=>sheetOpen=false}
						>
							<Clock class="h-5 w-5" />
							Tee Times
						</a>
						<a
							href="/courses"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
							on:click={()=>sheetOpen=false}
						>
							<Flag class="h-5 w-5" />
							Courses
						</a>
						<!-- <a
							href="/settings"
							class="flex h-9 items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
							on:click={()=>sheetOpen=false}
						>
							<Settings class="h-5 w-5" />
							<span class="">Settings</span>
						</a> -->
					</nav>
				</Sheet.Content>
			</Sheet.Root>
			<Breadcrumbs />
			<!-- <div class="relative ml-auto flex-1 md:grow-0">
				<Search
					class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
				/>
				<Input
					type="search"
					placeholder="Search..."
					class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
				/>
			</div> -->
			<PersonalMenu user={data.user} />
		</header>
		<main class="flex flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
			<slot />
		</main>
	</div>
</div>
