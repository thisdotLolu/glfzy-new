import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, cookies }) => {
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

	const teeTimeId = params.teetimeId;
	const { player_id, score,player_name } = await request.json();

	if (!teeTimeId || !player_id || !score) {
		return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
	}
    console.log(typeof(player_id))

	const { data, error } = await supabase
	.from('tee_time_players')
	.upsert(
		{
			tee_time_id: parseInt(teeTimeId),
			player_id:player_id,
			player_name,
			score: parseInt(score)
		},
		{ onConflict: 'tee_time_id,player_id' }
	);

	if (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Failed to submit score' }), { status: 500 });
	}

	return new Response(JSON.stringify({ message: 'Score submitted successfully', data }));
};
