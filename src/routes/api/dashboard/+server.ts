import {
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_SUPABASE_URL,
} from '$env/static/public';
import {
	createServerClient,
} from '@supabase/ssr';
import { json } from '@sveltejs/kit';


export async function GET({cookies}) {

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
})

  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('name, address, holes, lat, lng')
      .order('created_at', { ascending: false });

      console.log(error)

    if (error) {
      throw new Error(error.message);
    }

    return json({ courses });
  } catch (err) {
    return json({ error: err }, { status: 500 });
  }
}
