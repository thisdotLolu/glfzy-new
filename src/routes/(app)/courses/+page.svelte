<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { onMount, onDestroy } from 'svelte';
	import AddCourse from './components/add-course.svelte';
	import { toast } from 'svelte-sonner';
	import * as Table from '$lib/components/ui/table';
	import { goto } from '$app/navigation';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface courseItem{
		id: number;
		name: string;
		address: string;
		holes: number;
		lng: string;
		lat: string;
	}

	const PRIVATE_MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

	let map: mapboxgl.Map | null = null;
	let mapContainer: HTMLDivElement | null = null;
	let lng = -71.224518; //Boston coords
	let lat = 42.213995;
	let zoom = 9;
	let searchQuery = '';
	let courseSearchQuery = '';
	let locationDetails = {
		name: '',
		address: '',
		lng: 0,
		lat: 0,
	};
	let showDialog = false;
	let courseLists: courseItem[] = [];
	let filteredCourses:courseItem[] = [];

	let isDesktop = false;

onMount(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    isDesktop = mql.matches;
    
    const handler = (e: MediaQueryListEvent) => {
        isDesktop = e.matches;
    };
    
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
});

	let count = 0;
	$: perPage = isDesktop ? 5 : 8;
	$: siblingCount = isDesktop ? 1 : 0;

	let currentPage = 1;

const fetchCourses = async () => {
	try {
		const courseListResponse = await fetch('/api/courses');
		const courseListJson = await courseListResponse.json();

		if (!courseListResponse.ok) {
			toast.error('An error occurred');
			console.log('Fetch error');
			return;
		}

		courseLists = courseListJson.courses;
		filteredCourses = [...courseLists];

		count = filteredCourses.length;
		currentPage = 1; 

		console.log('Fetched courses:', courseLists);
		console.log('Filtered courses:', filteredCourses);
		console.log('Paginated courses:', paginatedCourses);
	} catch (error) {
		console.log(error);
	}
};

	$: filteredCourses = courseLists.filter((course) =>
		course.name.toLowerCase().includes(courseSearchQuery.toLowerCase()),
	);

	$: paginatedCourses = filteredCourses.slice(
		(currentPage - 1) * perPage,
		currentPage * perPage,
	);

	console.log(paginatedCourses)
	console.log(filteredCourses)

	onMount(() => {
		if (!mapContainer) {
			console.error('Map container is not available!');
			return;
		}

		const initialState = { lng, lat, zoom };

		map = new mapboxgl.Map({
			container: mapContainer,
			accessToken: PRIVATE_MAPBOX_TOKEN,
			style: 'mapbox://styles/mapbox/outdoors-v11',
			center: [initialState.lng, initialState.lat],
			zoom: initialState.zoom,
		});

		console.log('Map initialized:', map);
		fetchCourses();
	});

	onDestroy(() => {
		if (map) {
			map.remove();
			console.log('Map instance destroyed');
		}
	});

	async function searchLocation() {
		if (!searchQuery) return;

		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
			searchQuery,
		)}.json?access_token=${PRIVATE_MAPBOX_TOKEN}&limit=1`;

		try {
			const response = await fetch(url);
			const data = await response.json();

			if (data.features && data.features.length > 0) {
				const feature = data.features[0];
				const { center, text, place_name } = feature;

				locationDetails = {
					name: text,
					address: place_name,
					lng: center[0],
					lat: center[1],
				};

				console.log('Location details:', locationDetails);

				if (map) {
					map.flyTo({
						center: [locationDetails.lng, locationDetails.lat],
						zoom: 14,
					});

					new mapboxgl.Marker()
						.setLngLat([locationDetails.lng, locationDetails.lat])
						.addTo(map);
				}
				setTimeout(() => {
					showDialog = true;
				}, 4000);
			} else {
				alert('Location not found.');
			}
		} catch (error) {
			console.error('Error searching for location:', error);
		}
	}
</script>

<svelte:head>
	<title>Courses</title>
</svelte:head>

<div class="w-full">
	<div class="flex mb-4 items-center">
		<Input bind:value={searchQuery} placeholder="Search" class="mr-2 flex-1" />
		<Button on:click={searchLocation} class="h-8 mr-2">Search</Button>
		<AddCourse bind:locationDetails {showDialog} />
	</div>

	<div
		class="map"
		bind:this={mapContainer}
		style="height: 500px; width: 92vw; margin-top: 30px"
	></div>

	<div class="flex mb-4 mt-[50px]">
		<Input
			bind:value={courseSearchQuery}
			placeholder="Search Added Courses"
			class="mr-2 flex-1"
		/>
	</div>
	<Table.Root>
		<Table.Caption>A list of all courses created.</Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head>Name</Table.Head>
				<Table.Head>Address</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each paginatedCourses as { id, address, name }}
				<Table.Row
					class="cursor-pointer"
					on:click={() => {
						goto(`/courses/${id}`);
					}}
				>
					<Table.Cell class="font-medium">{name}</Table.Cell>
					<Table.Cell>{address}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>

	<Pagination.Root {count} {perPage} {siblingCount} bind:currentPage let:pages>
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.PrevButton>
					<ChevronLeft class="h-4 w-4" />
					<span class="hidden sm:block">Previous</span>
				</Pagination.PrevButton>
			</Pagination.Item>
			{#each pages as page (page.key)}
				{#if page.type === 'ellipsis'}
					<Pagination.Item>
						<Pagination.Ellipsis />
					</Pagination.Item>
				{:else}
					<Pagination.Item>
						<Pagination.Link {page} isActive={currentPage === page.value}>
							{page.value}
						</Pagination.Link>
					</Pagination.Item>
				{/if}
			{/each}
			<Pagination.Item>
				<Pagination.NextButton>
					<span class="hidden sm:block">Next</span>
					<ChevronRight class="h-4 w-4" />
				</Pagination.NextButton>
			</Pagination.Item>
		</Pagination.Content>
	</Pagination.Root>
</div>
