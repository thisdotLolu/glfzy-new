<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import { X } from "lucide-svelte";

</script>


<div class='flex items-center justify-between fixed top-0 w-full left-0 bg-[#29ae5c] p-2 z-[100000]'>
    <div>

    </div>

    <div class='items-center justify-center flex'>
        <p>
            Your current subscription seems to have expired
            </p>
            <Button
            variant='secondary'
            class='ml-4'
            >Update Subscription Status</Button>
        
    </div>
    
    <X
    class='cursor-pointer justify-self-end'
    />
</div>

