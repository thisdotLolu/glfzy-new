import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies,params }) => {
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

    const { teetimeId } = params;

	const { data, error } = await supabase.from('tee-times').select('*').eq('id', teetimeId).single();

	if (error) {
		return json({ error: error.message }, { status: 400 });
	}

	return json({ teeTime: data });

}

export async function PATCH({ cookies,request, params }) {
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
	const { teetimeId } = params;
	const body = await request.json();

	const { data, error } = await supabase
		.from('tee-times')
		.update(body)
		.eq('id', teetimeId)
		.select('*')
		.single();

	if (error) {
		return json({ error: error.message }, { status: 400 });
	}

	return json({ teeTime: data });
}

export async function DELETE({ cookies,params }) {
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
    const { teetimeId } = params;

	const { error } = await supabase.from('tee-times').delete().eq('id', teetimeId);

	if (error) {
		return json({ error: error.message }, { status: 400 });
	}

	return json({ message: 'Tee Time Deleted Successfully' });
}