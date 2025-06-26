<script lang="ts">
	import { page } from '$app/stores';

	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	// import { userStore } from '$lib/stores/userStore';
	import { Plus } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	// $: ({ loading, error } = $userStore);
	let memberEmail = '';
	let memberName = '';
	let isLoading: boolean = false;

	export let showDialog: boolean;

	// import { enhance } from '$app/forms';
	import Loader from '../../components/loader.svelte';
	import { PUBLIC_APP_URL } from '$env/static/public';

	// function handleResponse() {
	// 	console.log('');
	// }

	async function addMemberToGroup() {
    isLoading = true;
    try {
        const checkMemberResponse = await fetch('/api/members/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: memberEmail }),
        });

        let existingMember = await checkMemberResponse.json();

        if (!existingMember.data) {
            const addMemberResponse = await fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: memberEmail,
                    name: memberName,
                    role: 'member',
                }),
            });

            if (!addMemberResponse.ok) {
                toast.error('Failed to add member.');
                return;
            }

            const addedMember = await addMemberResponse.json();
            if (!addedMember.data || addedMember.data.length === 0) {
                throw new Error('Failed to retrieve new member data.');
            }

            existingMember.data = addedMember.data[0];
        }

        const memberId = existingMember.data.id;
        const groupId = $page.params.groupId;

        const checkGroupMemberResponse = await fetch('/api/group-members/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId, memberId }),
        });

        const groupMemberCheck = await checkGroupMemberResponse.json();

        if (groupMemberCheck.exists) {
            toast.error('Member is already in this group.');
            isLoading = false;
            return;
        }

        const addGroupMemberResponse = await fetch('/api/group-members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                groupId,
                memberId,
                role: 'member',
            }),
        });

        if (!addGroupMemberResponse.ok) {
            toast.error('Failed to add member to the group.');
            return;
        }

        // 🔹 Call the API to send an email after the member is added
        const sendEmailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: memberEmail,
                subject: "Invitation On Glfzy!",
                body: `Hello, ${memberName}\n\nYou have been invited to join this group on Glfzy.\n\nJoin here: ${PUBLIC_APP_URL}/groups/${groupId}`,
            }),
        });

        const emailResult = await sendEmailResponse.json();

        if (emailResult.error) {
            console.error("Email sending failed:", emailResult.error);
            toast.error("Failed to send invitation email.");
        } else {
            toast.success("Member added and email sent!");
        }

        showDialog = false;
        isLoading = false;
    } catch (error) {
        isLoading = false;
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
			<Plus /> Add A Member
		</Button>
	</Dialog.Trigger>

	<Dialog.Content class="">
		<Dialog.Header>
			<Dialog.Title>Add a new member</Dialog.Title>
			<Dialog.Description>
				Required fields are marked with '*':
			</Dialog.Description>
		</Dialog.Header>

		<!-- FORM NOW ONLY TAKES MEMBER NAME & EMAIL -->
		<form class="space-y-4" on:submit|preventDefault={addMemberToGroup}>
			<Input
				bind:value={memberName}
				title="Member Name"
				placeholder="Member Name *"
				class="w-full"
				name="memberName"
			/>
			<Input
				bind:value={memberEmail}
				placeholder="Member Email *"
				class="w-full"
				type="email"
				name="memberEmail"
			/>

			<div class="flex justify-end gap-4 mt-6">
				<Button variant="secondary" on:click={() => (showDialog = false)}>
					Cancel
				</Button>
				<Button type="submit" variant="secondary">
					Save
					{#if isLoading}
						<Loader />
					{/if}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
