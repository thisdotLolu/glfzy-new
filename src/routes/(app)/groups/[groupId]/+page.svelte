<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Forward, Trash } from 'lucide-svelte';
	import AddMember from '../components/add-member.svelte';
	import * as Table from '$lib/components/ui/table';
	import AddCourse from '../components/add-course.svelte';
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import Loader from '../../components/loader.svelte';
	import { userStore } from '$lib/stores/userStore';

  $: ({ userData} = $userStore);

  
	let groupId: string;
	let groupData: {
		name: string;
		description: string;
		player_limit: number;
		no_of_players: number;
    owner_id:string;
	} | null = null;
	let errorMessage: string | null = null;
	let showDialog = false;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let members: any = [];
	let isDeleting: boolean = false;
	let courseList: {
		id: number;
		name: string;
		address: string;
		holes: number;
		lng: string;
		lat: string;
	}[] = [];
  	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let selected: any = { value: '', label: '' };
  let isRemoving:boolean;
  let linkedCourse: { course_id: number; course_name: string } | null = null;

  console.log(members)


	onMount(async () => {
		groupId = $page.params.groupId;

		try {
			const response = await fetch(`/api/groups/${groupId}`);
			const result = await response.json();

			console.log(result);

			if (result.group && result.members) {
				groupData = result.group;
				members = result.members;
			} else {
				errorMessage = result.error || 'Error fetching group data';
			}

      const courseRes = await fetch(`/api/course-groups/${groupId}`);
			if (courseRes.ok) {
				const { course } = await courseRes.json();
				linkedCourse = course;
				if (linkedCourse) {
					selected = { value: linkedCourse.course_id, label: linkedCourse.course_name };
				}
			} else {
				console.error('Failed to fetch linked course');
			}
		} catch (error) {
			errorMessage = 'Failed to fetch data from the server.';
			toast.error('An error occured');
			console.error('Error fetching group:', error);
		}
	});

  const removeLinkedCourse = async () => {
		if (!confirm('Are you sure you want to unlink this course?')) return;

		isRemoving = true;
		try {
			const res = await fetch(`/api/course-groups/${groupId}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ groupId }),
			});

			if (!res.ok) {
				const error = await res.json();
				toast.error(error.error || 'Failed to unlink course.');
				return;
			}

			toast.success('Course unlinked successfully');
			linkedCourse = null;
		} catch (error) {
			console.error('Unexpected error:', error);
			toast.error('An unexpected error occurred.');
		} finally {
			isRemoving = false;
		}
	};

	async function deleteMember(email: string) {
		if (!confirm(`Are you sure you want to remove ${email} from the group?`))
			return;

		isDeleting = true;
		try {
			const response = await fetch('/api/members', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			const result = await response.json();

			if (!response.ok) {
				toast.error(result.error || 'Failed to delete member.');
			} else {
				toast.success('Member removed successfully.');
				// Optionally refresh data or update UI
			}
		} catch (error) {
			console.error('Unexpected error:', error);
			toast.error('An unexpected error occurred.');
		} finally {
			isDeleting = false;
		}
	}

	$:console.log(members);
	console.log('here')
</script>

{#if errorMessage}
	<div class="error">
		<p>{errorMessage}</p>
	</div>
{:else if groupData}
	<div class="flex flex-col items-start justify-start w-full">
		<div class="group-details">
			<h1 class="text-[2rem] font-semibold">{groupData.name}</h1>

			<p class="text-[1.2rem] font-semibold mt-[40px]">About:</p>
			<p class="text-[#bbbaba]">{groupData.description}</p>

			<div class="mt-[30px] flex items-center text-[1rem]">
				Total Number of Players: 
        <p class="text-[#bbbaba]">&nbsp; {groupData.no_of_players}</p>
			</div>

			<div class="flex items-center text-[1rem]">
				Group Course: 
        <p class="text-[#bbbaba]">&nbsp; {linkedCourse?.course_name ? linkedCourse?.course_name:'No Course Associated with this group'}</p> 
        {#if groupData.owner_id === userData?.user_id}
		{#if linkedCourse?.course_name}
        <Tooltip.Root> 
          <Tooltip.Trigger asChild let:builder>
            <Button 
            on:click={removeLinkedCourse}
            class='h-[20px] w-[20px] px-0 py-0 p-0 ml-3'
            builders={[builder]} variant="outline"><Trash
              size={20}  
            /> 
            {#if isRemoving}
            <Loader/>
            {/if}
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Remove Course</p>
          </Tooltip.Content>
        </Tooltip.Root>
        {/if}
        {/if}
			</div>
		</div>

    {#if groupData.owner_id === userData?.user_id}
		<div class="w-full items-center flex gap-2 mt-[20px]">
			<Button>
				<svelte:component this={Forward} />
				Invite
			</Button>
			<AddMember {showDialog} />
			<AddCourse 
      courseList={courseList}
      selected={selected}
      />
		</div>
		{/if}
		<div class="mt-[40px] w-full">
			<p class="text-[1.5rem] font-semibold">Group Members</p>
			<Table.Root>
				<Table.Caption>A list of your group's members.</Table.Caption>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Email</Table.Head>
						<Table.Head>Role</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each members as member}
						<Table.Row class="cursor-pointer capitalize">
							<Table.Cell class="font-medium"
								>{member?.members?.name}</Table.Cell
							>
							<Table.Cell class="lowercase">{member?.members?.email}</Table.Cell
							>
							<Table.Cell>{member?.role}</Table.Cell>
							{#if groupData.owner_id === userData?.user_id}
							<Table.Head>
								<button 
								    disabled={ member?.role === 'owner' || isDeleting}
									class="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-20"
									on:click={() => deleteMember(member.members.email)}
								>
									{#if isDeleting}
										Deleting...
									{/if}
									{!isDeleting && 'Remove'}
								</button>
							</Table.Head>
						
							{/if}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>
{/if}
