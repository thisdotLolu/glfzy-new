import {
    PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL,
} from '$env/static/public';
import {
    createServerClient,
} from '@supabase/ssr';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';


export const PUT: RequestHandler = async ({ params, request,cookies }) => {
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
        const { groupId } = params;
        const { name, description, player_limit, no_of_players } = await request.json();

        const { data, error } = await supabase
            .from('groups')
            .update({
                name,
                description,
                player_limit,
                no_of_players
            })
            .eq('id', groupId)
            .select()
            .single();

        if (error) {
            console.error('Error updating group:', error);
            return json({ error: error.message }, { status: 400 });
        }

        return json({ group: data }, { status: 200 });
    } catch (error) {
        console.error('Server error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};


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

    try {

        const { data: groupData, error: groupError } = await supabase
            .from('groups')
            .select('id, name, description, player_limit, no_of_players, owner_id')
            .eq('id', groupId)
            .single();

        if (groupError) {
            console.error('Error fetching group details:', groupError);
            return json({ error: groupError.message }, { status: 400 });
        }


        const { data: membersData, error: membersError } = await supabase
            .from('group_members')
            .select('member_id, role, members(name, email)')
            .eq('group_id', groupId)

        if (membersError) {
            console.error('Error fetching group members:', membersError);
            return json({ error: membersError.message }, { status: 400 });
        }

        return json({ group: groupData, members: membersData }, { status: 200 });
    } catch (error) {
        console.error('Server error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};


