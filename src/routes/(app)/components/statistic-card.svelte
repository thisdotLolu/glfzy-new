<script lang="ts">
    import * as Card from '$lib/components/ui/card';
	import { cn } from '$lib/utils';
    export let title: string = '';
    export let content: string | number = 0; 
    export let contentClass: string = '';
    export let className: string = '';
    export let iconClassName:string='';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export let icon:any = ''
  </script>


  <Card.Root class={cn('w-[100%] relative',className)}>
    <Card.Header>
      <Card.Title>{title}</Card.Title>
    </Card.Header>
    <Card.Content>
      <p class={cn('text-[2rem] font-semibold dark:text-[#289541] text-[#0f4d1d]',contentClass)}>{content}</p>
    </Card.Content>
    <div 
    
    class={cn('absolute right-2  bottom-2',iconClassName)}>
        <svelte:component 
        this={icon} />
    </div>
  </Card.Root>
  