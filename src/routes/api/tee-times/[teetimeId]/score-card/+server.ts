import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { json } from '@sveltejs/kit';


export async function PATCH({request,cookies,params}) {
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
	const body = await request.json();

    const image_url = body.image_url

    if (!image_url) {
        return json({ error: 'No image Found' }, { status: 400 });
    }

    const { error } = await supabase
        .from('tee-times')
        .update({ scorecard_image_url:image_url })
        .eq('id', teeTimeId);

        console.log(error)

    if (error) {
        console.log("error:", error)
        return json({ error: error.message }, { status: 500 });
    }

    return json({ message: 'Tee Time created!', image_url }, { status: 201 });
}
