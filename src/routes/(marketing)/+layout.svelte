<script>
	import { onNavigate } from '$app/navigation';
	import PersonalMenu from '$lib/components/personal-menu.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils';
	import ChevronsUpDown from 'virtual:icons/lucide/chevrons-up-down';
	import MenuIcon from 'virtual:icons/lucide/menu';
	import XIcon from 'virtual:icons/lucide/x';
	import '../../app.css';
	import { WebsiteName } from '../../config';
	import HomeButton from './components/HomeButton.svelte';
	import ThemeSwitchButton from './components/ThemeSwitchButton.svelte';

	const menuItems = {
		'/': 'Home',
		'/#features': 'Features',
		'/#pricing': 'Pricing',
		'/contact': 'Contact',
	};

	let menuOpen = false;
	onNavigate((_) => {
		menuOpen = false;
	});

	export let data;
</script>

<header class="sticky top-0 z-10 border-b border-border bg-card py-4">
	<div
		class="container grid grid-cols-2 flex-nowrap items-center justify-between sm:grid-cols-[auto,auto,auto]"
	>
		<HomeButton />
		<nav class="hidden sm:block">
			<ul class="hidden flex-wrap px-1 text-lg font-bold sm:flex">
				{#each Object.entries(menuItems) as [href, text]}
					<li class="md:mx-2">
						<Button variant="ghost" {href} class="text-base text-foreground">
							{text}
						</Button>
					</li>
				{/each}
			</ul>
		</nav>
		<div class="hidden justify-self-end sm:flex sm:gap-4">
			{#if data.user}
				<Button href="/dashboard">Dashboard</Button>
			{:else}
				<Button href="/login">Get Started Now</Button>
			{/if}
			<PersonalMenu user={data.user} />
		</div>

		<div class="justify-self-end sm:hidden">
			<Drawer.Root bind:open={menuOpen}>
				<Drawer.Trigger asChild let:builder>
					<Button variant="ghost" size="icon" builders={[builder]}>
						<span class="sr-only">Menu</span>
						<MenuIcon />
					</Button>
				</Drawer.Trigger>
				<Drawer.Content>
					<Drawer.Header class="flex justify-end py-0">
						<Drawer.Close asChild let:builder>
							<Button variant="ghost" size="icon" builders={[builder]}>
								<span class="sr-only">Close</span>
								<XIcon />
							</Button>
						</Drawer.Close>
					</Drawer.Header>
					<Collapsible.Root>
						<Collapsible.Trigger asChild let:builder>
							<div class="p-2">
								<Button
									variant="ghost"
									class="flex w-full flex-nowrap gap-2 text-base"
									builders={[builder]}
								>
									Switch theme
									<ChevronsUpDown class="size-4" />
								</Button>
							</div>
						</Collapsible.Trigger>
						<Collapsible.Content>
							<ul
								class="grid grid-cols-[auto,auto] items-center gap-x-2 p-2 pt-0"
							>
								<li class="col-span-2 grid grid-cols-subgrid">
									<ThemeSwitchButton
										mode="system"
										class="col-span-2 grid grid-cols-subgrid"
									/>
								</li>
								<li class="col-span-2 grid grid-cols-subgrid">
									<ThemeSwitchButton
										mode="light"
										class="col-span-2 grid grid-cols-subgrid"
									/>
								</li>
								<li class="col-span-2 grid grid-cols-subgrid">
									<ThemeSwitchButton
										mode="dark"
										class="col-span-2 grid grid-cols-subgrid"
									/>
								</li>
							</ul>
						</Collapsible.Content>
					</Collapsible.Root>
					<Separator />
					<nav class="[&_ul]:flex [&_ul]:flex-col [&_ul]:p-2">
						<ul>
							{#each Object.entries(menuItems) as [href, text]}
								<li>
									<Button {href} variant="ghost" class="w-full py-6 text-base">
										{text}
									</Button>
								</li>
							{/each}
						</ul>
						<Separator />
						<ul class="">
							{#if !data.user}
								<li>
									<Button
										href="/register"
										variant="ghost"
										class="w-full py-6 text-base"
									>
										Register
									</Button>
								</li>
								<li>
									<Button
										href="/login"
										variant="ghost"
										class="w-full py-6 text-base"
									>
										Log in
									</Button>
								</li>
							{:else}
								<li>
									<Button
										href="/dashboard"
										variant="ghost"
										class="w-full py-6 text-base"
									>
										Dashboard
									</Button>
								</li>
								<!-- <li>
									<Button
										href="/settings"
										variant="ghost"
										class="w-full py-6 text-base"
									>
										Settings
									</Button>
								</li> -->
								<li>
									<Button
										href="/log-out"
										variant="ghost"
										class="w-full py-6 text-base"
									>
										Log out
									</Button>
								</li>
							{/if}
						</ul>
					</nav>
				</Drawer.Content>
			</Drawer.Root>
		</div>
	</div>
</header>

<main class="container mx-auto p-8">
	<slot />
</main>


<style>
	:root {
		scroll-behavior: smooth;
	}
</style>
