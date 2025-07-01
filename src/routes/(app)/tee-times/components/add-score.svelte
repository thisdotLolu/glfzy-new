<script lang="ts">
    /** eslint-disable svelte/valid-compile */
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';

	export let players: { name: string; email: string; id:string }[];
	export let teeTimeId: string;

	let selected: { value: string; label: string, email:string } | null = null;
	let score = '';

	onMount(() => {
		if (players.length > 0) {
			selected = { value: players[0].id, label: players[0].name, email: players[0].email };
		}
	});


	async function submitScore() {
		if (!score || !selected) {
			toast.error('Please select player and enter score');
			return;
		}

    console.log(selected)
		try {
			const res = await fetch(`/api/tee-times/${teeTimeId}/submitScore`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ player_name: selected.label, player_id:Number(selected.value),score: parseInt(score) }),
			});

			if (res.ok) {
				toast.success('Score submitted successfully');
				score = '';
			} else {
				const result = await res.json();
				toast.error(result.error || 'Failed to submit score');
			}
		} catch (err) {
			console.log(err);
			toast.error('Unexpected error occurred');
		}
		window.location.reload();
	}
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<Button class="bg-[#289541] text-white hover:!bg-[#17792e] h-[30px]">
			Add Score
		</Button>
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-[425px] lg:w-full w-[95vw]">
		<Dialog.Header>
			<Dialog.Title>Submit Score</Dialog.Title>
			<Dialog.Description>Select Player and Enter Score</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col">
			<label
            class="text-muted-foreground text-[.8rem]"
            for="player"
            >Player</label>
			<Select.Root bind:selected>
				<Select.Trigger class="w-full mb-4">
					<Select.Value placeholder="Select Player" />
				</Select.Trigger>
				<Select.Content>
					{#each players as player}
						<Select.Item value={player.id}>{player.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

            <label
            class="text-muted-foreground text-[.8rem]"
            for="score"
            >Score</label>
            <Input
               id='score'
               type="number" bind:value={score} min="1"
               placeholder="Enter score" 
                />
		</div>

		<Dialog.Footer>
			<Button on:click={submitScore} class="bg-[#289541] text-white hover:!bg-[#17792e]">
				Save Score
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
