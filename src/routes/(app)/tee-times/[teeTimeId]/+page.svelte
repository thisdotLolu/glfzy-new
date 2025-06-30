<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Calendar, Clock } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import AddScore from '../components/add-score.svelte';
	import * as Table from '$lib/components/ui/table';
	import { convertBlobUrlToFile } from '$lib/utils';
	import { uploadImage } from '$lib/supabase/storage/client';

	let teeTime: {
		id: number;
		group_id: string;
		date: string;
		time: string;
		scorecard_image_url:string;
		description: string;
		players: { name: string; id:string; email: string;}[];
		group_name: string;
	} | null = null;

	let teeTimeId = '';
	let isLoading = false;

	teeTimeId = $page.params.teeTimeId;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fileInput:any;
  let selectedFile = null;
  let uploadUrl:string = ''
  let dbImageUrl:string = '';
  let playerScores: { id: number; player_id: number; player_name: string; score: number }[] = [];

  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleFileSelect(event:any) {
    const files = event.target.files;
    if (files.length > 0) {
        selectedFile = files[0];
        uploadUrl = URL.createObjectURL(selectedFile);
        const imageFile = await convertBlobUrlToFile(uploadUrl);

        const { imageUrl, error } = await uploadImage({
            file: imageFile,
            bucket: 'scorecard_images'
        });

        if (error) {
            console.error(error);
            return;
        }

        dbImageUrl = imageUrl;

        const res = await fetch(`/api/tee-times/${teeTimeId}/score-card`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: dbImageUrl })
        });

        const result = await res.json();

		console.log(result)
        if (!res.ok) {
			console.log(result)
            toast.error(result.error || 'Failed to update Tee Time with image');
        } else {
            toast.success('Scorecard image uploaded successfully');
        }
    }
}

  function triggerFileInput() {
    fileInput.click();
  }

	function formatDate(dateString: string) {
		const [day, month, year] = dateString.split('-').map(Number);
		const date = new Date(year, month - 1, day);

		return new Intl.DateTimeFormat('en-GB', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(date);
	}

	async function fetchTeeTime() {
		isLoading = true;
		try {
			const res = await fetch(`/api/tee-times/${teeTimeId}`);
			const result = await res.json();

			if (res.ok) {
				teeTime = result.teeTime;
			} else {
				toast.error(result.error || 'Failed to fetch Tee Time');
			}
		} catch (err) {
			console.log(err);
			toast.error('Unexpected error occurred');
		} finally {
			isLoading = false;
		}
	}

	
async function fetchPlayerScores() {
	try {
		const res = await fetch(`/api/tee-time-players?tee_time_id=${teeTimeId}&group_id=${teeTime?.group_id}`);
		const result = await res.json();

		if (res.ok) {
			playerScores = result.playerScores;
		} else {
			toast.error(result.error || 'Failed to fetch player scores');
		}
	} catch (err) {
		console.log(err);
		toast.error('Unexpected error occurred while fetching scores');
	}
}

onMount(async () => {
	await fetchTeeTime();
	await fetchPlayerScores();
});



	async function removePlayer(playerName: string) {
		if (!confirm(`Are you sure you want to remove ${playerName}?`)) return;
		const updatedPlayers = teeTime!.players.filter((player) => player.name !== playerName);

		try {
			const res = await fetch(`/api/tee-times/${teeTimeId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ players: updatedPlayers })
			});

			const result = await res.json();

			if (res.ok) {
				toast.success('Player removed successfully');
				teeTime!.players = updatedPlayers;
			} else {
				toast.error(result.error || 'Failed to update Tee Time');
			}
		} catch (err) {
			console.log(err);
			toast.error('Unexpected error occurred');
		} 
	}

	async function cancelTeeTime() {
		if (!confirm('Are you sure you want to cancel this Tee Time?')) return;

		try {
			const res = await fetch(`/api/tee-times/${teeTimeId}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				toast.success('Tee Time Cancelled');
				goto('/tee-times');
			} else {
				toast.error('Failed to cancel Tee Time');
			}
		} catch (err) {
			console.log(err);
			toast.error('Unexpected error occurred');
		}
	}

	function isPastOrToday(dateString: string) {
		const [day, month, year] = dateString.split('-').map(Number);
		const teeDate = new Date(year, month - 1, day);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		teeDate.setHours(0, 0, 0, 0);
		return teeDate <= today;
	}

	

</script>

<div class="flex flex-col justify-start w-full">
	{#if isLoading}
		<p>Loading...</p>
	{:else if teeTime}
		<div class="w-full">
			<h1 class="text-2xl font-bold mb-4 flex items-center gap-2"><Calendar/>{formatDate(teeTime.date)}</h1>
			<h1 class="text-2xl font-bold mb-4 flex items-center gap-2"><Clock/> {teeTime.time}</h1>
			<!-- {#if isPastOrToday(teeTime.date)} -->
				<AddScore players={teeTime.players} teeTimeId={teeTimeId}/>
			<!-- {/if} -->  
			<input
			type="file"
			bind:this={fileInput}
			on:change={handleFileSelect}
			style="display: none;"
			accept="image/*" 
		  />
		  
		  
		  <Button 
		 class='h-[30px] ml-4' 
		  on:click={triggerFileInput}>
			Upload Scorecard Image
		  </Button>
			<hr class='my-2'/>
			{#if teeTime.scorecard_image_url}
			<img
			src={teeTime.scorecard_image_url}
			alt='scorecard'
			class='w-[100%] h-[400px] object-contain'
			/>
			{:else if uploadUrl}
			<img
			src={uploadUrl}
			alt='scorecard'
			class='w-[50vw] h-[200px] object-cover'
			/>
			{:else}
			<p class='my-4'>No Score Card Upload</p>
			{/if}
			<p class='text-muted-foreground text-[1.4rem] mt-5'>{teeTime.group_name} </p>
			<p class='text-[1.2rem] font-medium my-4'>Tee Time creator says: {teeTime.description}</p>

			<h2 class="text-2xl font-semibold mt-10">Players & Scores</h2>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Player</Table.Head>
						{#if isPastOrToday(teeTime.date)}
							<Table.Head>Score</Table.Head>
						{/if}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each playerScores as player}
						<Table.Row>
							<Table.Cell>{player.player_name}</Table.Cell>
							{#if isPastOrToday(teeTime.date)}
								<Table.Cell>{player.score ?? '-'}</Table.Cell>
							{/if}
							{#if !isPastOrToday(teeTime.date)}
								<Table.Cell class='flex justify-end'>
									<Button on:click={() => removePlayer(player.player_name)} class="bg-red-500 hover:!bg-red-600 h-[30px] text-white px-2 py-1">
										Remove
									</Button>
								</Table.Cell>
							{/if}
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>

		</div>
	{:else}
		<p>No Tee Time Found</p>
	{/if}

	<Button on:click={() => cancelTeeTime()} class="bg-red-500 hover:!bg-red-600 h-[30px] mt-[100px] w-fit text-white px-2 py-1">
		Cancel Tee Time
	</Button>
</div>
