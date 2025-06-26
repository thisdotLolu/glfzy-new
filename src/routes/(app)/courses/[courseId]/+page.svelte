 <script lang='ts'>
	import { page } from "$app/stores";
	import { onMount } from "svelte";

    let courseId:string

    let courseData:{
        id:number,
        created_at:string,
        name:string,
        address:string,
        lng:string,
        lat:string,
        description:string
    }| null = null


    onMount(async()=>{
        courseId = $page.params.courseId

        try {   
        const courseResponse = await fetch(`/api/courses/${courseId}`)

        if(!courseResponse.ok){
            console.log('An error occured')
        }
        const courseDataJson = await courseResponse.json()
        console.log(courseDataJson)

        courseData = courseDataJson.courseData

        } catch (error) {
            console.log(error)    
        }
    })

    $:console.log(courseData)
 </script>

 <div class='flex flex-col'>
    <p class='text-[4rem] font-semibold'>{courseData?.name}</p>

    <div class='flex flex-col mt-[20px]'>
    <p>Coordinates:</p>  
    <span class='text-[2rem] text-muted-foreground'>{courseData?.lng}</span>
    <span class='text-[2rem] text-muted-foreground'>{courseData?.lat}</span>
    </div>

    <div class='mt-[20px]'>
        <p>Created on : <span class='text-muted-foreground'>{courseData?.created_at && new Date(courseData?.created_at)}</span></p>
        <p>Address : <span class='text-muted-foreground'>{courseData?.address}</span></p>
    </div>

    <div class='mt-[40px]'>
        <p class='text-[1.2rem]'>Description:</p>
        <p class='text-muted-foreground'>{courseData?.description? courseData?.description : 'Nothing To See Here Yet...'}</p>
    </div>
 </div>