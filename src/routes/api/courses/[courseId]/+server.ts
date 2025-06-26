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


    const { courseId } = params;

    try {

        const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('id,name,created_at,lng,lat,description,address')
            .eq('id', courseId) 
            .single();

        if (courseError) {
            console.error('Error fetching details:', courseError);
            return json({ error: courseError.message }, { status: 400 });
        }
        
        return json({ courseData }, { status: 200 });
    } catch (error) {
        console.error('Server error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};


