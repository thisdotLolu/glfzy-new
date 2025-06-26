export const ssr = false;

import { fail, redirect, type Actions } from '@sveltejs/kit';

import type { Provider } from '@supabase/supabase-js';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types.js';
import { formSchema } from './schema';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	default: async (event) => {
		const provider = event.url.searchParams.get('provider') as Provider;
		const searchParams = event.url.searchParams;
		const redirectTo = searchParams.get('redirectTo');
		searchParams.set('next', searchParams.get('next') || '/dashboard');

		if (provider) {
			if (!redirectTo) return fail(400, {});

			const { data, error } = await event.locals.supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo,
					queryParams: {
						access_type: 'offline',
						prompt: 'consent',
					},
				},
			});

			if (error) {
				console.error(error);
				return fail(400, {});
			}

			// const {data:{user}, error:authError} = await event.locals.supabase.auth.getUser();

			// if(authError){
			// 	console.error(error);
			// 	return fail(400, {});	
			// }

			// const {data:matchedUser, error:userDbError} = await event.locals.supabase
			// .from('users')
			// .select('*')
			// .eq('user_id', user!.id)
			// .single();

			// if(userDbError){
			// 	console.error(error);
			// 	return fail(400, {});
			// }

			// console.log('matched users', matchedUser)

			// if(!matchedUser){
			// 	const { error: dbError } = await event.locals.supabase
			// 	.from('users')
			// 	.insert({
			// 	  name:user?.email?.split('@')[0],
			// 	  email: user?.email,
			// 	  created_at: new Date(),
			// 	  subscription_tier: 'free',
			// 	  user_id:user?.id
			// 	});
		  
			//   if (dbError) {
			// 	console.log('dberror,',dbError)
			// 	console.error(dbError);
			// 	return setError(
			// 	  form,
			// 	  '',
			// 	  'Sign-up successful, but an error occurred while saving user details to the database.'
			// 	);
			//   }
			// }

			
		    

			redirect(303, data.url);
		}


		const supabase = event.locals.supabase;
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		const { email, password } = form.data;

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error(error);
			return setError(form, '', 'Invalid credentials');
		}

		redirect(303, '/auth/callback?next=/dashboard');
	},
};
