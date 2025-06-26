<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Check } from 'lucide-svelte';
	import {loadStripe} from '@stripe/stripe-js'
	import { PUBLIC_STRIPE_KEY } from '$env/static/public';
	import { PUBLIC_ENTERPRISE_ID,PUBLIC_PREMIUM_ID,PUBLIC_PRO_ID } from '$env/static/public';


	const plans = [
		{
			name:'Free',
			price:0,
			description:'Starter',
			features:[
				'Create 1 group',
			     'Up to 8 players per group',
				 'Create and join tee times',
				 'Simple group invite link'
			]
		},
		{
			name:'Premium',
			price:15,
			description:'Most Popular',
			features:[
				'Create 1 group',
			     'Up to 24 players per group',
				 'Scheduling',
				 'Email notifications',
				 'Custom avatar profile pictures',
				 'Upload scorecard images',
				 'Custom access code for group joining'
			],
			priceId: PUBLIC_PREMIUM_ID
		},
		{
			name:'Pro',
			price:30,
			description:'Power users',
			features:[
				'Create up to 5 groups',
			     'Unlimited players per group',
				 'All Premium features',
				 'Custom Sub-domain'
			],
			priceId: PUBLIC_PRO_ID
		},
		{
			name:'Enterprise',
			price:50,
			description:'For Large Organizations',
			features:[
				'Create unlimited groups',
			     'Unlimited layers per group',
				 'Scheduling',
				 'Email notifications',
				 'Custom avatar profile pictures',
				 'Upload ScoreCard images after round',
				 'Custom domain'
			],
			priceId: PUBLIC_ENTERPRISE_ID
		},
	]

	async function subscribe (priceId:string | undefined,subTier:string|undefined){
		const stripe = await loadStripe(PUBLIC_STRIPE_KEY);

		console.log(stripe)

		const response = await fetch('/api/checkout',{
			method:'POST',
			headers:{
				'Content-Type':'application/json'
			},
			body: JSON.stringify({
				priceId,
				subTier
			})
		})

		const {sessionId} = await response.json()
		
		await stripe?.redirectToCheckout({sessionId})
		console.log(sessionId)

	}
	
</script>

<svelte:head>
	<title>Billing | Settings</title>
</svelte:head>

<h2 class="text-xl font-semibold">Billing</h2>


<section class="flex flex-col gap-3">
	<h3 class="text-lg font-semibold">Default Prices</h3>
	<ol class="grid gap-4 lg:grid-cols-3">
	{#each plans as product}
				<li
					class="[&:nth-child(2)>.bg-card]:border-2 [&:nth-child(2)>.bg-card]:border-primary [&:nth-child(2)]:scale-105"
				>
					<Card.Root class="relative">
						<!-- <div class="absolute right-1.5 top-1.5">
							<Price.Badges {price} />
						</div> -->
						<Card.Header>
							<Card.Title tag="h4">{product.name}</Card.Title>
							<Card.Description>
								{product.description}
							</Card.Description>
						</Card.Header>
							<Card.Content
							class='flex items-center'
							>
								<p class="text-[2rem]">${product.price}</p> <span class='text-muted-foreground mt-[10px]'>/ month</span> 
							</Card.Content>
							<Card.Content class='flex flex-col gap-2'>
								{#each product.features as feature}
									<div class='flex items-center'><Check color='#289541'/> {feature}</div>
								{/each}
							</Card.Content>
							<Card.Footer>
								
								<Button
								on:click={()=>{
									console.log('clicked')
									subscribe(product.priceId,product.name)
								}}
								>
									Select Plan
								</Button>
							</Card.Footer>
					</Card.Root>
				</li>
	{/each}
	</ol>
</section>

