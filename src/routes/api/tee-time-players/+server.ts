import {
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_SUPABASE_URL,
} from '$env/static/public';
import {
	createServerClient,
} from '@supabase/ssr';
import type { RequestHandler } from '../$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies, url }) => {
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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) return json({ error: 'User not authenticated' }, { status: 401 });

        // Get optional query parameters for filtering
        const teeTimeId = url.searchParams.get('tee_time_id');
        const groupId = url.searchParams.get('group_id');

        let query = supabase
            .from('tee_time_players')
            .select('id, tee_time_id, player_id, player_name, score, tee-times!inner(group_id)')
            .order('score', { ascending: false });

        if (teeTimeId) query = query.eq('tee_time_id', teeTimeId);
        if (groupId) query = query.eq('tee-times.group_id', groupId);

        const { data: playerScores, error } = await query;

        if (error) throw error;

        return json({ playerScores });
    } catch (err) {
        console.error('Error fetching player scores:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
