import {
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_SUPABASE_URL,
} from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const supabase = createServerClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get(key) {
					return cookies.get(key) || '';
				},
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				set(key, value, options: any) {
					cookies.set(key, value, options);
				},
			},
		},
	);

	try {
		const body = await request.json();
		const { name, description, player_limit, owner_id, no_of_players } = body;

		if (!name || !player_limit || !owner_id) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const { data, error } = await supabase
			.from('groups')
			.insert([
				{
					name,
					description,
					player_limit,
					owner_id,
					no_of_players,
				},
			])
			.select()
			.single();

		if (error) throw error;
		console.log('groups:', data);
		return json({ message: 'Group saved successfully', data });
	} catch (error) {
		console.error('Error saving group:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ cookies }) => {
	const supabase = createServerClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get(key) {
					return cookies.get(key) || '';
				},
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				set(key, value, options: any) {
					cookies.set(key, value, options);
				},
			},
		},
	);

	try {
		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession();
		if (sessionError) throw sessionError;
		if (!session)
			return json({ error: 'User not authenticated' }, { status: 401 });

		const userId = session.user.id;

		const { data: ownedGroups, error: ownerError } = await supabase
			.from('groups')
			.select('id, name, description, owner_id, no_of_players, player_limit')
			.eq('owner_id', userId);

		if (ownerError) throw ownerError;

		// Fetch the member's ID from the 'members' table using email
		const { data: member, error: memberError } = await supabase
			.from('members')
			.select('id')
			.eq('email', session.user.email)
			.limit(1)
			.maybeSingle();

		if (memberError) throw memberError;
		if (!member) {
			console.warn('No member record found for user:', session.user.email);
			return json({ groups: ownedGroups }); // Return only owned groups
		}

		// Fetch groups where the user is a MEMBER
		const { data: memberGroups, error: memberGroupError } = await supabase
			.from('group_members')
			.select('group_id')
			.eq('member_id', member.id);

		if (memberGroupError) throw memberGroupError;
		console.log('memberGroups', memberGroups);

		const groupIds = memberGroups.map((g) => g.group_id);

		const { data: joinedGroups, error: joinedGroupsError } = await supabase
			.from('groups')
			.select('id, name, description, owner_id, no_of_players, player_limit')
			.in('id', groupIds);

		if (joinedGroupsError) throw joinedGroupsError;

		const uniqueGroups = new Map();
		[...ownedGroups, ...joinedGroups].forEach((group) =>
			uniqueGroups.set(group.id, group),
		);

		const groups = Array.from(uniqueGroups.values());

		return json({ groups });
	} catch (err) {
		console.error('Error fetching user groups:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
