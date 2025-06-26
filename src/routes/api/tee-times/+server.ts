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
        const {group_id,date,time, description, players,group_name,creator_id} = await request.json();

        const memberData = {
            group_id,
            date,
            time,
            description,
            players,
            group_name,
            creator_id,
        }; 


        const { data, error } = await supabase
            .from('tee-times')
            .upsert([memberData])
            .select('*');

        if (error) {
            console.error('Error creating tee time:', error);
            return json({ error: error.message }, { status: 400 });
        }

        console.log(data)


        return json({ message: 'Tee Time created!', data }, { status: 201 });
    } catch (error) {
        console.error('Server error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};


export const GET: RequestHandler = async ({ cookies, url }) => {
    const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get(key) {
                return cookies.get(key) || '';
            },
            set(key, value, options: any) {
                cookies.set(key, value, options);
            }
        },
    });

    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session) {
            return json({ error: 'User not authenticated' }, { status: 401 });
        }

        const userId = session.user.id;
        const userEmail = session.user.email;
        
        // Get tee times created by the user
        const { data: createdTeeTimes, error: createdError } = await supabase
            .from('tee-times')
            .select('*')
            .eq('creator_id', userId)
            .order('created_at', { ascending: false });

        if (createdError) throw createdError;
        
        // Get tee times where the user is a player (using email)
        const { data: playerTeeTimes, error: playerError } = await supabase
            .from('tee_time_players')
            .select(`
                id,
                tee_time_id,
                player_id,
                player_name,
                score,
                player_email,
                "tee-times"(*)
            `)
            .eq('player_email', userEmail)
            .order('created_at', { ascending: false });

        if (playerError) throw playerError;
        
        // Extract and deduplicate tee times
        const playerTeeTimesData = playerTeeTimes
            .filter(item => item["tee-times"])
            .map(item => ({
                ...item["tee-times"],
                as_player: true,
                player_score: item.score
            }));
            
        // Add flag to indicate these are tee times the user created
        const createdTeeTimesWithFlag = createdTeeTimes.map(item => ({
            ...item,
            as_creator: true
        }));
        
        // Combine both sets of tee times
        const allTeeTimes = [...createdTeeTimesWithFlag];
        
        // Add player tee times that weren't already included (avoid duplicates)
        playerTeeTimesData.forEach(playerTeeTime => {
            const existingIndex = allTeeTimes.findIndex(tt => tt.id === playerTeeTime.id);
            if (existingIndex >= 0) {
                // If it exists, just add the player flag
                allTeeTimes[existingIndex].as_player = true;
                allTeeTimes[existingIndex].player_score = playerTeeTime.player_score;
            } else {
                // If it doesn't exist, add it to the array
                allTeeTimes.push(playerTeeTime);
            }
        });
        
        // Sort by date (most recent first)
        allTeeTimes.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB.getTime() - dateA.getTime();
        });

        return json({ teeTimes: allTeeTimes });
    } catch (err) {
        console.error('Error fetching tee times:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

