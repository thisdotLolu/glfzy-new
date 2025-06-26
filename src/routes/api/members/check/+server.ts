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
        const { email } = await request.json();

        if (!email) {
            return json({ error: 'Missing email' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('email', email)
            .single()

            console.log("check error", error)
        if (error && error.code !== 'PGRST116') { 
            console.error('Error checking member by email:', error);
            return json({ error: error.message }, { status: 400 });
        }

        console.log("check data",data)

        return json({ data }, { status: 200 });
    } catch (error) {
        console.error('Server error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

