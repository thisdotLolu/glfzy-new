export const ssr = false;

import { fail, redirect, type Actions } from '@sveltejs/kit';

import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types.js';
import { formSchema } from './schema';

export const load: PageServerLoad = async ({ url }) => {
	const next = url.searchParams.get('next');
	const isCheckout = Boolean(
		typeof next === 'string' &&
			decodeURIComponent(next).match(/^\/checkout\/.+$/),
	);

	return {
		isCheckout,
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	default: async (event) => {
		const supabase = event.locals.supabase;
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		const { email, password } = form.data;

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			console.error(error);
			return setError(form, '', 'Could not sign up. Please try again.');
		}

		if(data){
			const { error: dbError } = await supabase
			.from('users')
			.insert({
			  name:data.user?.email?.split('@')[0],
			  email: data.user?.email,
			  created_at: new Date(),
			  subscription_tier: 'free',
			  user_id:data.user?.id,
			  subscription_expiry_date:null
			});
	  
		  if (dbError) {
			console.log('dberror,',dbError)
			console.error(dbError);
			return setError(
			  form,
			  '',
			  'Sign-up successful, but an error occurred while saving user details to the database.'
			);
		  }
		}

		const search = new URLSearchParams(event.url.search);
		search.set('next', event.url.searchParams.get('next') || '/dashboard');

		redirect(303, '/auth/callback?' + search.toString());
	},
};
