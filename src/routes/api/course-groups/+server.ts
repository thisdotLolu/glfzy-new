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
			set(key, value, options: any) {
				cookies.set(key, value, options);
			}
		},
	});

	try {
		const { courseId, groupId, courseName } = await request.json();

		const { data: existingLink, error: fetchError } = await supabase
			.from('course_groups')
			.select('id')
			.eq('group_id', groupId)
			.single();

		if (fetchError && fetchError.code !== 'PGRST116') {
			console.error('Error checking existing link:', fetchError);
			return json({ error: fetchError.message }, { status: 400 });
		}

		if (existingLink) {
			const { error: updateError } = await supabase
				.from('course_groups')
				.update({ course_id: courseId, course_name: courseName })
				.eq('group_id', groupId);

			if (updateError) {
				console.error('Error updating course link:', updateError);
				return json({ error: updateError.message }, { status: 400 });
			}

			return json({ message: 'Course updated for the group' }, { status: 200 });
		} else {
			const { error: insertError } = await supabase
				.from('course_groups')
				.insert([{ course_id: courseId, group_id: groupId, course_name: courseName }]);

			if (insertError) {
				console.error('Error inserting new course link:', insertError);
				return json({ error: insertError.message }, { status: 400 });
			}

			return json({ message: 'Course linked to group successfully' }, { status: 201 });
		}
	} catch (error) {
		console.error('Server error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
