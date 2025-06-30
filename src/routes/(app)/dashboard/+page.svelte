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
	$: ({ userData} = $userStore);
	
	let showSubscriptionAlert:boolean=false;

	let stats = {
	totalTeeTimes: 0,
	activeGroups: 0,
	upcomingTeeTimes: 0,
	averageGroupSize: '0',
};
	
	let recentCourses:{
		name:string, address:string, holes:number, lng:string,lat:string
	}[] = [];

	$:console.log(userData)

	const fetchStats=async()=>{
		try {
		const res = await fetch('/api/stats-count');
		if (res.ok) {
			stats = await res.json();
			console.log(stats)
		}
	} catch (err) {
		console.error('Error fetching dashboard stats', err);
	}
	}

	
	onMount(async () => {
		if (userData?.subscription_expiry_date) {
			const expiryDate = new Date(userData.subscription_expiry_date);
			const currentDate = new Date();

			console.log("exp status",expiryDate < currentDate)

			if (expiryDate < currentDate) {
				showSubscriptionAlert = true;
			}
	}
	fetchStats()
	try {
		const res = await fetch('/api/courses');
		if (res.ok) {
			const { courses } = await res.json();
			recentCourses = courses || [];
		} else {
			console.error('Failed to fetch courses');
			console.log(res)
		}
	} catch (err) {
		console.error('Error fetching courses:', err);
	}
});

	const recentTeeTimes = [
		{
			selectedCourse:'Pebble Beach Golf Links',
			courseLocation:"Pebble Beach, California",
			date:"17-11-2024, 13:00PM EST",
			players:[{name:'Alisson Jibly'},{name:'Cris Jones'},{name:'Dries VDB'}],
			organizer:'Ebe David'
		},
		{
			selectedCourse:'Cypress Point Club',
			courseLocation:"Pebble Beach, California",
			date:"17-03-2025, 13:00PM EST",
			players:[{name:'Pandy Graeme'},{name:'Robert Hunter'},{name:'Ben Hogan'}],
			organizer:'Aliste McKenzie'
		},
		{
			selectedCourse:'Royal County Down Golf Club',
			courseLocation:"Northern Ireland, Newcastle",
			date:"27-05-2025, 15:00PM EST",
			players:[{name:'Colt Steele'},{name:'Henry Winter'},{name:'Tommy Morrison'}],
			organizer:'May Hezlet'
		},
	]
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class='flex flex-col w-full'>
	{#if showSubscriptionAlert} 
	<SubscriptionAlert/>
	{/if}
	<p class='text-[1.4rem] lg:hidden my-2 font-semibold'>Dashboard</p>
	<div class='w-full lg:flex-row flex-col flex gap-5'>
		  
		  <div class="flex lg:flex-row flex-col gap-4 w-full">
			<StatisticCard 
			  title="Total Tee Times" 
			  content={stats.totalTeeTimes} 
			  className="lg:w-[25%] w-full" 
			/>
		  
			<StatisticCard 
			  title="Active Groups" 
			  content={stats.activeGroups} 
			  className="lg:w-[25%] w-full"
			/>
		  
			<StatisticCard 
			  title="Upcoming Tee Times" 
			  content={stats.upcomingTeeTimes} 
			  className="lg:w-[25%] w-full"
			/>
		  
			<StatisticCard 
			  title="Average Group Size" 
			  content={Math.floor(Number(stats.averageGroupSize))} 
			  className="lg:w-[25%] w-full"
			/>
		  </div>
		  
	</div>

	<div class="mt-[20px] lg:flex lg:flex-row flex-col items-start gap-5">
		<Card.Root class='lg:w-[50%] w-full'>
			<Card.Header>
				<Card.Title>Courses</Card.Title>
			</Card.Header>
			<div class='w-full flex items-center'>
				<Card.Content class='w-full'>
					<div class='flex w-full justify-between border-b py-1'>
						<p>Recent Courses Added</p>
						<Link class='hover:underline' href='/courses'>
							View All Courses >
						</Link>
					</div>
		
					{#if recentCourses.length > 0}
						{#each recentCourses.slice(0,3) as { name, address, lng,lat }}
							<Card.Root class='p-4 mt-[10px]'>
								<p class='text-[1.2rem] dark:text-ring text-primary font-semibold'>{name}</p>
								<p class='dark:text-ring text-primary mt-2'>{address}</p>
								<Badge
									class='bg-[#0f4d1d] hover:!bg-[#0f4d1d] mr-2 text-[#fff] p-1 px-2 my-2'
									>{lng} {lat}</Badge
								>
								<!-- <p class='dark:text-ring text-primary text-[.9rem]'>
									Total Holes : <span class='text-[#29ae5c] font-semibold'>{holes}</span>
								</p> -->
								<div class='w-full flex justify-end'>
									<Button class='bg-[#0f4d1d] h-[35px] hover:!bg-[#0f4d1d] text-[#fff]'>
										View Course Details
									</Button>
								</div>
							</Card.Root>
						{/each}
					{:else}
						<p>No recent courses available.</p>
					{/if}
				</Card.Content>
			</div>
		</Card.Root>
		
		<Card.Root class='lg:w-[50%] w-full lg:mt-0 mt-[20px]'>
			<Card.Header>
				<Card.Title>Tee Times</Card.Title>
			</Card.Header>
			<div class='w-full flex items-center'>
				<Card.Content class='w-[100%] p-1 px-6'>
				<div class='flex w-full justify-between border-b pb-1'>
					<p>Recent Tee Times</p>
					<Link 
					class='hover:underline'
					href='/courses'>
						See all Tee Times >
					</Link>
				</div>
				{#each recentTeeTimes as {selectedCourse,courseLocation,date,players,organizer}}
				<Card.Root
				class='p-4 mt-[10px]'
				>
				    <p class='text-[1.2rem] dark:text-ring text-primary font-semibold'>{selectedCourse}</p>
					<p class='dark:text-ring text-primary mt-2'>{courseLocation}</p>
					<p class='my-2 text-[.9rem] dark:text-ring text-primary'>{date}</p>
					{
					#each players as {name}}
					<Badge
					class='bg-[#0f4d1d] mr-2 hover:!bg-[#0f4d1d] text-[#fff] p-1 px-2 my-2'
					>{name}</Badge>
					{/each}
					<p class='dark:text-ring text-primary text-[.9rem]'>Organizer : <span class='text-[#29ae5c] font-semibold'>{organizer}</span> </p>
					<div class='w-full flex justify-start mt-[10px] gap-2'>
					<Button
					class='bg-[#0f4d1d] h-[35px] hover:!bg-[#0f4d1d] text-[#fff]'
					>
						View Details
					</Button>
					<Button
					class='bg-[#0f4d1d] !flex !items-center h-[35px] hover:!bg-[#0f4d1d] text-[#fff]'
					>
						Join <ChevronRight
						size={15}
						/>
					</Button>
					</div>
				</Card.Root>
				{/each}
				</Card.Content>
				<!-- <Card.Content class='w-[50%]'>
				<p>Courses Created</p>
				</Card.Content> -->
			</div>
		</Card.Root>
	</div>
</div>

