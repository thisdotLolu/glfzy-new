<script lang="ts">
	/** eslint-disable @typescript-eslint/no-explicit-any */
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import { CalendarIcon, Plus } from 'lucide-svelte';
	import * as Select from '$lib/components/ui/select';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';

  import {
    DateFormatter,
    type DateValue,
    getLocalTimeZone
  } from "@internationalized/date";
  import { cn } from "$lib/utils.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
	import { userStore } from '$lib/stores/userStore';


	interface Group {
		name: string;
		description: string;
		owner_id: string;
		no_of_players: string;
		player_limit: string;
		id: number;
	}

	interface SelectedGroup {
		value: number;
		label: string;
	}

	interface TeeTimeMembers {
		member_id: number;
		role: string;
		members: { name: string; email: string };
	}

	interface SelectedMember {
		id: number;
		name: string;
		email:string
	}


	export let showDialog: boolean;

    $: ({ userData } = $userStore);
	let groups: Group[] = [];
	let selectedGroup: SelectedGroup | null = null;
	let membersForTeeTime: TeeTimeMembers[] = [];
	let selectedMembers: SelectedMember[] = [];
	let teeTimeDescription = '';
    let teeTime='';
    const df = new DateFormatter("en-US", {
    dateStyle: "long"
  });
  
  let value: DateValue | undefined = undefined;
  let teeTimeDate = ``


    $:console.log(selectedMembers)
    $:console.log(selectedGroup)
    $:console.log(value)

	onMount(async () => {
		try {
			const response = await fetch('/api/groups', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});

			if (response.ok) {
				const result = await response.json();
				groups = result.groups;
			} else {
				toast.error('Error fetching groups');
			}
		} catch (err) {
			toast.error("Can't Fetch Data");
			console.error(err);
		}
	});

	async function fetchMembers() {
		if (!selectedGroup) return;

		try {
			const memberResponse = await fetch(`/api/groups/${selectedGroup.value}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});

			if (memberResponse.ok) {
				const memberResult = await memberResponse.json();
				membersForTeeTime = memberResult.members || [];
			} else {
				toast.error('Error fetching group data');
			}
		} catch (err) {
			toast.error('Failed to fetch group members');
			console.error(err);
		}
	}

	function toggleMemberSelection(member: TeeTimeMembers) {
		const existingIndex = selectedMembers.findIndex(m => m.id === member.member_id);
		
		if (existingIndex !== -1) {
			selectedMembers.splice(existingIndex, 1);
			selectedMembers = selectedMembers;
		} else {
			selectedMembers.push({
				id: member.member_id,
				name: member.members.name,
				email:member.members.email
			});
			selectedMembers = selectedMembers;
		}
	}

	async function handleSave() {
		if (!teeTime || !teeTimeDescription || !selectedGroup) {
			toast.error('Please fill in all required fields');
			return;
		}

		if (selectedMembers.length === 0) {
			toast.error('Please select at least 4 players from the members');
			return;
		}

        teeTimeDate = `${value?.day}-${value?.month}-${value?.year}`

		const teeTimeData = {
			time: teeTime,
			description: teeTimeDescription,
			group_id: selectedGroup.value,
            group_name:selectedGroup.label,
			players: selectedMembers,
            creator_id:userData?.user_id,
            date:teeTimeDate,
			creator_name:userData?.name
		};

		try {
            const response = await fetch('/api/tee-times',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(teeTimeData),
            })

            if(!response.ok){
                toast.error('Could not create Tee time')
                return
            }

			toast.success('Tee Time Created Successfully');
			showDialog = false;

			teeTime = '';
			teeTimeDescription = '';
			selectedGroup = null;
			selectedMembers = [];
		} catch (err) {
			toast.error('Failed to create Tee Time');
			console.error(err);
		}
	}

	$: if (selectedGroup) {
		fetchMembers();
	}
</script>

<Dialog.Root bind:open={showDialog}>
	<Dialog.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			class="bg-[#289541] text-white hover:!bg-[#17792e] transition-all"
		>
			<svelte:component this={Plus} />
			Create New Tee Time
		</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create a new Tee Time</Dialog.Title>
			<!-- <Dialog.Description>
				Required fields are marked with '*':
			</Dialog.Description> -->
		</Dialog.Header>

		<div class="space-y-4"> 
			
			<div class="">
				<Select.Root bind:selected={selectedGroup}>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Select A Group" />
					</Select.Trigger>
					<Select.Content>
						{#each groups as group}
							<Select.Item value={group.id}>{group.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

            {#if selectedGroup && membersForTeeTime.length > 0} 
                <p class='text-[.8rem]'>Add players from your group</p>
            {/if}
            {#if selectedGroup && membersForTeeTime.length === 0} 
                <p class='text-[.8rem]'>No members found in selected group</p>
            {/if}
            <div class='flex flex-wrap gap-2'>
                {#each membersForTeeTime as item}
			<div class="flex items-start space-x-1">
				<Checkbox 
					id={item.member_id.toString()} 
					checked={selectedMembers.some(m => m.id === item.member_id)}
					onCheckedChange={() => toggleMemberSelection(item)}
				/>
				<label 
					for={item.member_id.toString()}
					class="text-sm font-normal cursor-pointer"
				>
					{item.members.name}
				</label>
			</div>
			{/each}
            </div>
			

			{#if selectedMembers.length > 0}
			<div class="mt-4">
				<p class="text-sm font-medium">Selected Members:</p>
				<ul class="list-disc pl-5">
					{#each selectedMembers as member}
						<li>{member.name}</li>
					{/each}
				</ul>
			</div>
			{/if}

            <Popover.Root>
                <Popover.Trigger asChild let:builder>
                  <Button
                    variant="outline"
                    class={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !value && "text-muted-foreground"
                    )}
                    builders={[builder]}
                  >
                    <CalendarIcon class="mr-2 h-4 w-4" />
                    {value ? df.format(value.toDate(getLocalTimeZone())) : "Select Date For Tee Time"}
                  </Button>
                </Popover.Trigger>
                <Popover.Content class="w-auto p-0" align="start">
                  <Calendar bind:value />
                </Popover.Content>
              </Popover.Root>

              <div class=''>
                <Input
                bind:value={teeTime} 
				title="Add a Time (With timezone)" 
				placeholder="Input the Tee time e.g 11:24am (UTC-5)" 
				class="w-full" 
                />

                <Textarea 
				bind:value={teeTimeDescription} 
				placeholder="Add some notes / description for this Tee time *" 
				class="w-full mt-3" 
			/>

              </div>

        </div>

		<div class="flex justify-end gap-4 mt-6">
			<Button variant="secondary" on:click={() => (showDialog = false)}>
				Cancel
			</Button>
			<Button variant="secondary" on:click={handleSave}>Save</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>