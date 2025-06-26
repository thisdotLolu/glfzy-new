import {
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_SUPABASE_URL,
} from '$env/static/public';
import {
	createServerClient,
} from '@supabase/ssr';
import type { RequestHandler } from '../$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get(key) {
				return cookies.get(key) || '';
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			set(key, value, options:any) {
				cookies.set(key, value, options);
			}
		},
	});

	try {
		const body = await request.json();
        console.log(body)
		const { name, address, lng, lat, holes, description } = body;
		if (!name || !address || lng == null || lat == null) {
			return new Response(
				JSON.stringify({ error: 'Missing required fields: name, address, lng, lat, or holes.' }),
				{ status: 400 }
			);
		}

		const { data, error } = await supabase.from('courses').insert({
			name,
			address,
			lng,
			lat,
			holes,
			description
		});

		if (error) {
			console.error('Supabase insert error:', error);
			return new Response(JSON.stringify({ error: 'Failed to save course data.' }), { status: 500 });
		}

		return new Response(JSON.stringify({ data }), { status: 200 });
	} catch (error) {
		console.error('Error handling request:', error);
		return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
	}
};

export async function GET({cookies}) {

const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	cookies: {
		get(key) {
			return cookies.get(key) || '';
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		set(key, value, options:any) {
			cookies.set(key, value, options);
		}
	},
})

  try {
	const { data: courses, error } = await supabase
	  .from('courses')
	  .select('name, address, holes, lat, lng , id, description')
	  .order('created_at', { ascending: false });

	  console.log(error)

	if (error) {
	  throw new Error(error.message);
	}

	console.log(courses)

	return json({ courses });
  } catch (err) {
	return json({ error: err }, { status: 500 });
  }
}