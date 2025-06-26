import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { RequestHandler } from './$types';
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
        const { memberId, groupId, role } = await request.json();


        const groupMemberData = {
            group_id: groupId,
            member_id: memberId,
            role: role
        }; 


        const { data, error } = await supabase
            .from('group_members')
            .upsert([groupMemberData])
            .select('*');

        if (error) {
            console.error('Error adding member to group:', error);
            return json({ error: error.message }, { status: 400 });
        }

        console.log(data)

        return json({ message: 'Member added to group successfully', data }, { status: 201 });
    } catch (error) {
        console.error('Server error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
