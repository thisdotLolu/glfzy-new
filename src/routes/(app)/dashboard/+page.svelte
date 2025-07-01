<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Link } from '$lib/components/ui/breadcrumb';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { ChevronRight } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import StatisticCard from '../components/statistic-card.svelte';
	import { userStore } from '$lib/stores/userStore';
	import SubscriptionAlert from './components/subscription-alert.svelte';
	import { goto } from '$app/navigation';
	import Loader from '../components/loader.svelte';
	$: ({ userData } = $userStore);
	
	let loading = false;
	let showSubscriptionAlert: boolean = false;

	let stats = {
		totalTeeTimes: 0,
		activeGroups: 0,
		upcomingTeeTimes: 0,
		averageGroupSize: '0',
	};

	let recentCourses: {
		name: string;
		address: string;
		holes: number;
		lng: string;
		lat: string;
	}[] = [];

	let recentTeeTimes: {
		creator_id: string;
		creator_name: string;
		date: string;
		group_id: number;
		group_name: string;
		id: number;
		players: { id: number; name: string; email: string }[];
		time: string;
	}[] = [];

	$: console.log(userData);

	const fetchStats = async () => {
		loading = true;
		try {
			const res = await fetch('/api/stats-count');
			if (res.ok) {
				stats = await res.json();
				console.log(stats);
			}
		} catch (err) {
			console.error('Error fetching dashboard stats', err);
		}
		loading=false;
	};

	onMount(async () => {
		loading = true
		if (userData?.subscription_expiry_date) {
			const expiryDate = new Date(userData.subscription_expiry_date);
			const currentDate = new Date();

			console.log('exp status', expiryDate < currentDate);

			if (expiryDate < currentDate) {
				showSubscriptionAlert = true;
			}
		}
		fetchStats();
		try {
			const res = await fetch('/api/dashboard');
			if (res.ok) {
				const { courses, teeTimes } = await res.json();
				recentCourses = courses || [];
				recentTeeTimes = teeTimes || []
			} else {
				console.error('Failed to fetch courses');
				console.log(res);
			}
		} catch (err) {
			console.error('Error fetching courses:', err);
		}
		loading = false
	});

</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="flex flex-col w-full">
	{#if showSubscriptionAlert}
		<SubscriptionAlert />
	{/if}
	<p class="text-[1.4rem] lg:hidden my-2 font-semibold">Dashboard</p>
	<div class="w-full lg:flex-row flex-col flex gap-5">
		<div class="flex lg:flex-row lg:flex-nowrap flex-wrap flex-row gap-4 w-full">
			<StatisticCard
				title="Total Tee Times"
				content={loading ? '...':stats.totalTeeTimes}
				className="lg:w-[25%] w-[47%]"
			/>

			<StatisticCard
				title="Active Groups"
				content={loading ? '...':stats.activeGroups}
				className="lg:w-[25%] w-[47%] "
			/>

			<StatisticCard
				title="Upcoming Tee Times"
				content={loading ? '...':stats.upcomingTeeTimes}
				className="lg:w-[25%] w-[47%] "
			/>

			<StatisticCard
				title="Average Group Size"
				content={loading ? '...':Math.floor(Number(stats.averageGroupSize))}
				className="lg:w-[25%] w-[47%] "
			/>
		</div>
	</div>

	<div class="mt-[20px] lg:flex lg:flex-row flex-col items-start gap-5">
		<Card.Root class="lg:w-[50%] w-full">
			<Card.Header>
				<Card.Title>Courses</Card.Title>
			</Card.Header>
			<div class="w-full flex items-center">
				<Card.Content class="w-full">
					<div class="lg:text-[1rem] text-[.8rem] flex w-full justify-between border-b py-1">
						<p>Recent Courses Added</p>
						<Link class="hover:underline" href="/courses">
							View All Courses >
						</Link>
					</div>

					
					   {#if loading}
					    <Loader/>
					   {:else}
						{#each recentCourses.slice(0, 3) as { name, address, lng, lat }}
							<Card.Root class="p-4 mt-[10px]">
								<p
									class="text-[1.2rem] dark:text-ring text-primary font-semibold"
								>
									{name}
								</p>
								<p class="dark:text-ring text-primary mt-2">{address}</p>
								<Badge
									class="bg-[#0f4d1d] hover:!bg-[#0f4d1d] mr-2 text-[#fff] p-1 px-2 my-2"
									>{lng} {lat}</Badge
								>
								<!-- <p class='dark:text-ring text-primary text-[.9rem]'>
									Total Holes : <span class='text-[#29ae5c] font-semibold'>{holes}</span>
								</p> -->
								<div class="w-full flex justify-end">
									<Button
										class="bg-[#0f4d1d] h-[35px] hover:!bg-[#0f4d1d] text-[#fff]"
									>
										View Course Details
									</Button>
								</div>
							</Card.Root>
						{/each}
					 {/if}
					 {#if loading === false && recentCourses.length < 1 }
					  <p>no courses available</p>
					 {/if}
				</Card.Content>
			</div>
		</Card.Root>

		<Card.Root class="lg:w-[50%] w-full lg:mt-0 mt-[20px] py-[10px]">
			<Card.Header>
				<Card.Title>Tee Times</Card.Title>
			</Card.Header>
			<div class="w-full flex items-center">
				<Card.Content class="w-[100%] p-1 px-6">
					<div class="flex w-full lg:text-[1rem] text-[.8rem] justify-between border-b pb-1">
						<p>Recent Tee Times</p>
						<Link class="lg:text-[1rem] text-[.8rem] hover:underline" href="/courses">
							See Your Tee Times >
						</Link>
					</div>
					 {#if loading}
					    <Loader/>
					   {:else}
					{#each recentTeeTimes as {  date, players, group_name,creator_name,time,id }}
						<Card.Root class="p-4 mt-[10px]">
							<p
								class="text-[1.2rem] dark:text-ring text-primary font-semibold"
							>
								{group_name}
							</p>
							<!-- <p class="dark:text-ring text-primary mt-2">{courseLocation}</p> -->
							<p class="my-2 text-[.9rem] dark:text-ring text-primary">
								{date}, {time}
							</p>
							{#each players as { name }}
								<Badge
									class="bg-[#0f4d1d] mr-2 hover:!bg-[#0f4d1d] text-[#fff] p-1 px-2 my-2"
									>{name}</Badge
								>
							{/each}
							<p class="dark:text-ring text-primary text-[.9rem]">
								Organizer : <span class="text-[#29ae5c] font-semibold"
									>{creator_name}</span
								>
							</p>
							{#if userData?.name === creator_name}
							<div class="w-full flex justify-start mt-[10px] gap-2">
								<Button
								    on:click={()=>goto(`/tee-times/${id}`)}
									class="bg-[#0f4d1d] h-[30px] hover:!bg-[#0f4d1d] text-[#fff]"
								>
									View Details >
								</Button>
								
							</div>
							{/if}
						</Card.Root>
					{/each}
					{/if}
					 {#if loading === false && recentTeeTimes.length < 1 }
					  <p>no tee times available</p>
					 {/if}
				</Card.Content>
				<!-- <Card.Content class='w-[50%]'>
				<p>Courses Created</p>
				</Card.Content> -->
			</div>
		</Card.Root>
	</div>
</div>
