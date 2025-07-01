import {
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_SUPABASE_URL,
} from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { json } from '@sveltejs/kit';

export async function GET({ cookies }) {
	const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get(key) {
				return cookies.get(key) || '';
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			set(key, value, options: any) {
				cookies.set(key, value, options);
			}
		},
	});

	try {
		const { data: courses, error: courseError } = await supabase
			.from('courses')
			.select('name, address, holes, lat, lng')
			.order('created_at', { ascending: false });

		if (courseError) throw new Error(courseError.message);

		const { data: teeTimes, error: teeError } = await supabase
			.from('tee-times')
			.select('id, group_name, date, time, players, group_id, creator_id, created_at,creator_name')
			.order('created_at', { ascending: false })
			.limit(3);

		if (teeError) throw new Error(teeError.message);

		return json({ courses, teeTimes });
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err:any) {
		return json({ error: err.message }, { status: 500 });
	}
}
