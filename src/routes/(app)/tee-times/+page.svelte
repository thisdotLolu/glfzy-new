<script lang='ts'>
	import { userStore } from "$lib/stores/userStore";
	import { onMount } from "svelte";
	import StatisticCard from "../components/statistic-card.svelte";
    import * as Table from "$lib/components/ui/table";
	import AddTeeTime from "./components/add-tee-time.svelte";
	import { toast } from "svelte-sonner";
    import { goto } from '$app/navigation';
    interface TeeTimes{
        id:number,
        group_id:string,
        date:string,
        time:string,
        description:string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        players:any[],
        group_name:string,
        creator_id:string
    }

    let stats = {
		totalTeeTimes: 0,
		activeGroups: 0,
		upcomingTeeTimes: 0,
		averageGroupSize: '0',
        pastTeeTimes:0
	};


    $: ({ loading, error } = $userStore);
    let showDialog = false;
    let creatorTeeTimes:TeeTimes[] = []

    $:console.log(stats)

    const fetchStats = async () => {
		loading = true;
		try {
			const res = await fetch('/api/stats-count');
			if (res.ok) {
                console.log(res)
				stats = await res.json();
				console.log(stats);
			}
		} catch (err) {
			console.error('Error fetching dashboard stats', err);
		}
		loading=false;
	};


	onMount(async () => {
    fetchStats()
		try {
			const response = await fetch('/api/tee-times', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});

			if (response.ok) {
				const result = await response.json();
				creatorTeeTimes = result.teeTimes;
			} else {
				toast.error('Error fetching created tee times');
			}
		} catch (err) {
			toast.error("Can't Fetch Data");
			console.error(err);
		}
    fetchStats();
	});


</script>


<div class='flex flex-col gap-5 w-full'>
    {#if loading}
        <div class="flex justify-center items-center h-full">
            <svg class="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.961 7.961 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    {:else if error}
        <div class="flex justify-center items-center h-full">
            <!-- <p>{error.message}</p> -->
        </div>
    {:else}
        <div class="w-full flex gap-3">
            <StatisticCard
                title='Past Tee Times'
                className='w-[50%]'
                content={stats.pastTeeTimes}
            />
            <StatisticCard
                title='Upcoming Tee Times'
                className='bg-[#289541] w-[50%]'
                contentClass='!text-[#ffff]'
                iconClassName='text-[#1a6d3b] text-[3rem]'
                content={stats.upcomingTeeTimes}
            />
        </div>

        <div class=' w-full flex items-center justify-start'>
            <div class="w-full items-center flex gap-2 mt-[20px]">
                <!-- <Button>
                    <svelte:component this={Forward} />
                    I
                </Button> -->
               <AddTeeTime
               {showDialog}
               />
            </div>       
        </div>


        <div class='mt-[40px] w-full'>
            <p class='text-[1.5rem] font-semibold'>Created Tee Times</p>
            <Table.Root>
                <Table.Caption>A list of your created Tee Times</Table.Caption>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Tee Time</Table.Head>
                        <Table.Head>Date</Table.Head>
                        <Table.Head>Players</Table.Head>
                        <Table.Head>Group</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each creatorTeeTimes as teeTime}
                        <Table.Row
                        class='cursor-pointer'
                        on:click={()=>{
                            goto(`/tee-times/${teeTime.id}`)
                        }}
                        >
                            <Table.Cell class="font-medium">{teeTime.time}</Table.Cell>
                            <Table.Cell>{teeTime.date}</Table.Cell>
                            <Table.Cell class='flex items-center flex-wrap gap-1'>
                                {#each teeTime.players as player, index}
                                    <p>
                                        {player.name}{index === teeTime.players.length - 1 ? '.' : ' ,'}
                                    </p>
                                {/each}
                            </Table.Cell>
                            <Table.Cell
                            class=''
                            > 
                            {teeTime.group_name}
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </div>
    {/if}
</div>