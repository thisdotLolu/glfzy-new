<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { toast } from "svelte-sonner";
	import Textarea from "$lib/components/ui/textarea/textarea.svelte";

	export let locationDetails: {
		name: string;
		address: string;
		lng: number;
		lat: number;
	};
	export let showDialog: boolean; 
	let description:string;

	export function formatCoordinates(lat: number, lng: number): { lat: string; lng: string } {
	function toDMS(degree: number): string {
		const absolute = Math.abs(degree);
		const degrees = Math.floor(absolute);
		const minutesFloat = (absolute - degrees) * 60;
		const minutes = Math.floor(minutesFloat);
		const seconds = Math.round((minutesFloat - minutes) * 60);

		return `${degrees}°${minutes}′${seconds}″`;
	}

	const latDirection = lat >= 0 ? "N" : "S";
	const lngDirection = lng >= 0 ? "E" : "W";

	return {
		lat: `${toDMS(lat)}${latDirection}`,
		lng: `${toDMS(lng)}${lngDirection}`,
	};
}

	$: formattedCoordinates = formatCoordinates(locationDetails.lat, locationDetails.lng);

	async function saveToDatabase() {
		if (!locationDetails == null) {
			toast.error("Please provide all required details.");
			return;
		}

		try {
			const response = await fetch('/api/courses', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: locationDetails.name,
					address: locationDetails.address,
					lng: formattedCoordinates.lng,
					lat: formattedCoordinates.lat,
					description
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Error saving course:", errorData);
				toast.error("Failed to save course. Please try again.");
				return;
			}

			const result = await response.json();
			console.log("Course saved:", result);
			toast.success("Course saved successfully!");
		} catch (error) {
			console.error("Unexpected error:", error);
			toast.error("An unexpected error occurred.");
		}

		showDialog = false;
		window.location.reload();
	}
</script>

<Dialog.Root bind:open={showDialog}>
	<Dialog.Trigger asChild let:builder>
		<Button
			variant="secondary"
			class="flex flex-nowrap items-center gap-2 h-9"
			builders={[builder]}
		>
			Save Course
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="lg:w-full w-[95vw]">
		<Dialog.Header>
			<Dialog.Title>Confirm Location Details</Dialog.Title>
			<Dialog.Description>
				Please confirm the details below before saving:
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<Input
				bind:value={locationDetails.name}
				placeholder="Name"
				class="w-full"
			/>
			<Input
				bind:value={locationDetails.address}
				placeholder="Address"
				class="w-full"
			/>
			<Input
				bind:value={formattedCoordinates.lng}
				placeholder="Longitude"
				class="w-full"
				disabled
			/>
			<Input
				bind:value={formattedCoordinates.lat}
				placeholder="Latitude"
				class="w-full"
				disabled
			/>
			<!-- <Input
				bind:value={holes}
				placeholder="Holes"
				type="number"
				class="w-full"
			/> -->
			<Textarea
			bind:value={description}
			placeholder="Course Description"
			class="w-full"
		    />
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

