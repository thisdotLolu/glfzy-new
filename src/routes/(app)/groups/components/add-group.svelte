<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Input } from "$lib/components/ui/input";
	import { userStore } from "$lib/stores/userStore";
	import { Edit, Plus } from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import * as Select from "$lib/components/ui/select";
    $: ({ userData } = $userStore);

    interface Groups{
        name:string;
        description:string;
        no_of_players:number;
        id:number
        owner_id:string
    }
    


	export let showDialog: boolean;
	export let groupsLength:number;
	export let edit:boolean = false;
	export let groupId:number = 0;
	export let existingGroupName='';
	export let existingGroupNo=0;
	export let existingGroupDesc='';
    export let groups:Groups[] 

	let groupName = edit? existingGroupName : '';
	let description = edit? existingGroupDesc : '';
	$:playerLimit = userData?.subscription_tier === 'free' ? 8 : 10;
	$:ownerId = userData?.user_id;
	let editSelected = {value: existingGroupNo, label: existingGroupNo === 8 ? 'Eight (8)':existingGroupNo === 24 ? 'Twenty-four (24)':'Greater than Twenty four (25+)'}
	let selected = edit ? editSelected : { value: 8, label: 'Eight (8)'}
	
	$: console.log('Current noOfPlayers:',selected);
	console.log(groupsLength)
	console.log(groupId)

	async function saveToDatabase() {
    if (!groupName || !description) {
        toast.error("Missing fields.");
        return;
    }

    if (userData?.subscription_tier === 'free' && selected.value > 8) {
        toast.error("Insufficient Subscription");
        return;
    }
    console.log(groups)
    const ownedGroups = groups.filter(group => group.owner_id === userData?.user_id).length;

    if (userData?.subscription_tier === 'free' && ownedGroups >= 1 && !edit) {
    toast.error("You need a Pro or Enterprise subscription to create more than one group");
    return;
    }

    console.log(groupName, description, playerLimit, ownerId, selected.value);

    try {
        let groupResponse;
        if (edit) {
            groupResponse = await fetch(`/api/groups/${groupId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: groupName,
                    description,
                    player_limit: playerLimit,
                    owner_id: ownerId,
                    no_of_players: selected.value,
                }),
            });
        } else {
            groupResponse = await fetch('/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: groupName,
                    description,
                    player_limit: playerLimit,
                    owner_id: ownerId,
                    no_of_players: selected.value,
                }),
            });
        }

        if (!groupResponse.ok) {
            const errorData = await groupResponse.json();
            console.error("Error saving group:", errorData);
            toast.error("Failed to save group. Please try again.");
            return;
        }

        const groupResult = await groupResponse.json();
        console.log("Group saved:", groupResult);
        console.log("Group saved:", groupResult.data.id);

        if (!edit && groupResult.data) {
            const addMemberResponse = await fetch('/api/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: userData?.name,
                    email: userData?.email,
                    role: 'owner',
                    date_joined: new Date().toISOString(),
                }),
            });

            if (!addMemberResponse.ok) {
                const addMemberError = await addMemberResponse.json();
                console.error("Error adding owner to members table:", addMemberError);
                toast.error("Failed to add owner to the group.");
                return;
            }

            const newMember = await addMemberResponse.json();
            console.log("New member added:", newMember);

			console.log(newMember.data[0].id)
			console.log(groupResult?.data.id)

            const addGroupMemberResponse = await fetch('/api/group-members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groupId: groupResult?.data.id,
                    memberId: newMember?.data[0].id, 
                    role: 'owner',
                }),
            });

            if (!addGroupMemberResponse.ok) {
                const addGroupMemberError = await addGroupMemberResponse.json();
                console.error("Error adding owner to group-members:", addGroupMemberError);
                toast.error("Failed to add owner to the group-members table.");
                return;
            }

            console.log("Owner added to the group-members table.");
        }

        toast.success("Group saved successfully!");
        showDialog = false;
    } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred.");
    }
}


</script>

<Dialog.Root bind:open={showDialog}>
		<Dialog.Trigger asChild let:builder>
			<Button
				builders={[builder]}
				class="bg-[#289541] text-white hover:!bg-[#17792e] transition-all"
			>
			{#if edit}
			<svelte:component this={Edit} />
				Edit Group
			{:else}
			<svelte:component this={Plus} />
				Start New Group
			{/if}	
			</Button>
		</Dialog.Trigger>
		<Dialog.Content class="">
			<Dialog.Header>
				<Dialog.Title>Create a new Group</Dialog.Title>
				<Dialog.Description>
					Required fields are marked with '*':
				</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-4">
				<Input
					bind:value={groupName}
					title="Group Name"
					placeholder="Group Name *"
					class="w-full"
				/>
				<Input
					bind:value={description}
					placeholder="Description *"
					class="w-full"
				/>
				<div>
					<Select.Root
					bind:selected
					>
						<Select.Trigger 
						class="w-full">
						  <Select.Value placeholder="Number of Players" />
						</Select.Trigger>
						<Select.Content
						
						>
						  <Select.Item value={8}>Eight (8)</Select.Item>
						  {#if userData?.subscription_tier === 'free'}
						  <p class="text-[.7rem]">***You need to upgrade from a free subscription to select more than 8</p>
						{/if}
						  <Select.Item value={24} disabled={userData?.subscription_tier==='free'}>Twenty-four (24)</Select.Item>
						  {#if userData?.subscription_tier === 'premium'}
						  <p class="text-[.7rem]">***You need to upgrade from a free subscription to select more than 8</p>
						{/if}
						  <Select.Item value={0} disabled={userData?.subscription_tier==='free' || userData?.subscription_tier==='premium'}>Greater than Twenty four (25+)</Select.Item>
						</Select.Content>
					  </Select.Root>
				</div>
			</div>

			<div class="flex justify-end gap-4 mt-6">
				<Button variant="secondary" on:click={() => (showDialog = false)}>
					Cancel
				</Button>
				<Button variant="secondary" on:click={saveToDatabase}>
					Save
				</Button>
			</div>
		</Dialog.Content>
</Dialog.Root>