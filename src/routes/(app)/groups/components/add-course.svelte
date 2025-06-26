<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Link } from 'lucide-svelte';
	import * as Select from '$lib/components/ui/select';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';

	export let courseList: {
		id: number;
		name: string;
		address: string;
		holes: number;
		lng: string;
		lat: string;
	}[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export let selected:any

	const groupId = $page.params.groupId;

	onMount(async () => {
		try {
			const res = await fetch('/api/courses');
			if (res.ok) {
				const { courses } = await res.json();
				courseList = courses || [];

				if (courseList.length > 0) {
					selected = courseList[0].id;
				}
			} else {
				console.error('Failed to fetch courses', res);
			}

           
		} catch (err) {
			console.error('Error fetching courses:', err);
		}
	});

	const handleLinkCourse = async () => {
		const groupCourseResponse = await fetch('/api/course-groups', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				courseId: selected?.value,
				groupId,
				courseName: selected?.label,
			}),
		})

        if(!groupCourseResponse.ok){
            toast.error('An error occured')
            let error = await groupCourseResponse.json()
            console.log(error)
            return
        }

        const result = await groupCourseResponse.json()
        console.log(result)
        toast.success('Course Linked Successfully')
    };



	console.log(courseList);
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<Button class="bg-[#289541] text-white hover:!bg-[#17792e] transition-all">
			<Link size={20} /> &nbsp; {`  `} Link Course
		</Button></Dialog.Trigger
	>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add a course</Dialog.Title>
			<Dialog.Description>
				Select a course to associate with this group
			</Dialog.Description>
			<div>
				<Select.Root bind:selected>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Select a course" />
					</Select.Trigger>
					<Select.Content>
						{#each courseList as course}
							<Select.Item value={course.id}>{course.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</Dialog.Header>
		<Dialog.Footer>
			<Button 
            on:click={handleLinkCourse}
            type="submit">Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
