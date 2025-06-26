<script lang='ts' >
import { onMount } from 'svelte';
    import { UsersRound } from 'lucide-svelte';
    import StatisticCard from '../components/statistic-card.svelte';
    import * as Table from "$lib/components/ui/table";
    import { userStore } from '$lib/stores/userStore';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import AddGroup from './components/add-group.svelte';
    import * as Tabs from "$lib/components/ui/tabs";
    $: ({ userData, loading, error } = $userStore);

    interface Groups{
        name:string;
        description:string;
        no_of_players:number;
        id:number;
        owner_id:string
    }
    

    let groups:Groups[] = [];
    let showDialog = false;


    $: console.log("userdata", userData);

    onMount(async () => {
        try {
            const response = await fetch('/api/groups', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                groups = result.groups;
            } else {
                error = await response.json();
            }
        } catch (err) {
            // error = { message: 'Failed to fetch groups.' };
            toast.error("Can't Fetch data")
            console.error(err);
        }
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
                title='Your Groups'
                className='w-[50%]'
                content={groups.length}
            />
            {#each groups as group}
            <StatisticCard
                title={group.name}
                className='bg-[#289541] w-[50%]'
                contentClass='!text-[#ffff]'
                icon={UsersRound}
                iconClassName='text-[#1a6d3b] text-[3rem]'
            />
            {/each}
        </div>

        <div class="w-full flex items-center gap-2">
            <AddGroup
            groups={groups}
            groupsLength={groups.length}
            {showDialog} />
         
        </div>

        <div class='mt-[40px] w-full'>
            <Tabs.Root value="group" class="w-full">
                <Tabs.List>
                  <Tabs.Trigger value="group">Groups</Tabs.Trigger>
                  <Tabs.Trigger value="member-requests">Group Timeline</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content 
                class='!w-full'
                value="group">
                    <Table.Root>
                        <Table.Caption>A list of your groups.</Table.Caption>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Name</Table.Head>
                                <Table.Head>Description</Table.Head>
                                <Table.Head>Players</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each groups as group}
                                <Table.Row
                                class='cursor-pointer'
                                on:click={()=>{
                                    goto(`/groups/${group.id}`)
                                }}
                                >
                                    <Table.Cell class="font-medium">{group.name}</Table.Cell>
                                    <Table.Cell>{group.description}</Table.Cell>
                                    <Table.Cell>{group.no_of_players}</Table.Cell>
                                    <Table.Head
                                    
                                    class='cursor-pointer w-[20px]'
                                    > 
                                    <button
                                    on:click|stopPropagation
                                    >
                                    <AddGroup
                                    groups={groups}
                                    existingGroupName={group.name}
                                    existingGroupDesc={group.description}
                                    existingGroupNo={group.no_of_players}
                                    groupId={group.id}
                                    edit={true}
                                    groupsLength={groups.length}
                                    {showDialog} />
                                </button>
                     
                                    </Table.Head>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </Tabs.Content>
                <Tabs.Content value="password">Change your password here.</Tabs.Content>
              </Tabs.Root>
        </div>
    {/if}
</div>
