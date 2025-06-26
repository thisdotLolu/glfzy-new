import {
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_SUPABASE_URL,
} from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { RequestHandler } from '../$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get(key) {
                return cookies.get(key) || '';
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            set(key, value, options: any) {
                cookies.set(key, value, options);
            },
        },
	});

    const { groupId } = params;

	if (!groupId) {
		return json({ error: 'Group ID is required' }, { status: 400 });
	}

	const { data, error } = await supabase
		.from('course_groups')
		.select('course_id, course_name')
		.eq('group_id', groupId)
		.single();

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ course: data }, { status: 200 });
};

export const DELETE: RequestHandler = async ({ request, cookies }) => {
	const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get(key) {
				return cookies.get(key) || '';
			}
		}
	});

	try {
		const { groupId } = await request.json();

		if (!groupId) {
			return json({ error: 'Group ID is required' }, { status: 400 });
		}

		const { error } = await supabase
			.from('course_groups')
			.delete()
			.eq('group_id', groupId);

		if (error) {
			return json({ error: error.message }, { status: 500 });
		}

		return json({ message: 'Course unlinked successfully' }, { status: 200 });
	} catch (error) {
		console.error('Server error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};