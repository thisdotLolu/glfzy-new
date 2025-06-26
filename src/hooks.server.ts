// src/hooks.server.ts
import {
	PRIVATE_STRIPE_SECRET_KEY,
	PRIVATE_SUPABASE_SERVICE_ROLE,
} from '$env/static/private';
import {
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_SUPABASE_URL,
} from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Handle } from '@sveltejs/kit';
import Stripe from 'stripe';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get: (key) => event.cookies.get(key),
				/**
				 * Note: You have to add the `path` variable to the
				 * set and remove method due to sveltekit's cookie API
				 * requiring this to be set, setting the path to an empty string
				 * will replicate previous/standard behaviour (https://kit.svelte.dev/docs/types#public-types-cookies)
				 */
				set: (key, value, options) => {
					event.cookies.set(key, value, { ...options, path: '/' });
				},
				remove: (key, options) => {
					event.cookies.delete(key, { ...options, path: '/' });
				},
			},
		},
	);

	event.locals.supabaseServiceRole = createClient(
		PUBLIC_SUPABASE_URL,
		PRIVATE_SUPABASE_SERVICE_ROLE,
		{ auth: { persistSession: false } },
	);

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session: originalSession },
		} = await event.locals.supabase.auth.getSession();
		if (!originalSession) {
			return { session: null, user: null, amr: null };
		}

		const {
			data: { user },
			error: userError,
		} = await event.locals.supabase.auth.getUser();
		if (userError) {
			// JWT validation has failed
			return { session: null, user: null, amr: null };
		}

		// TODO: Remove this once the issue is fixed
		// Hack to overcome annoying Supabase auth warnings
		// https://github.com/supabase/auth-js/issues/873#issuecomment-2081467385
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		delete originalSession.user;
		const session = Object.assign({}, originalSession, { user });
		const { data: aal, error: amrError } =
			await await event.locals.supabase.auth.mfa.getAuthenticatorAssuranceLevel();
		if (amrError) {
			return { session, user, amr: null };
		}

		return { session, user, amr: aal.currentAuthenticationMethods };
	};

	event.locals.stripe = new Stripe(PRIVATE_STRIPE_SECRET_KEY, {
		apiVersion: '2024-04-10',
	});

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		},
	});
};
