import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
    const {
        url,
        locals: { supabase },
    } = event;
    const code = url.searchParams.get('code') as string;
    const next = url.searchParams.get('next') ?? '/';

    if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
            console.error(exchangeError);
            throw redirect(303, '/auth/auth-code-error');
        }

    
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('Auth error:', authError);
            throw redirect(303, '/auth/auth-code-error');
        }

        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (userError && userError.code !== 'PGRST116') { 
            console.error('Database error:', userError);
            throw redirect(303, '/auth/auth-code-error');
        }

   
        if (!existingUser) {
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    name: user.email?.split('@')[0],
                    email: user.email,
                    created_at: new Date(),
                    subscription_tier: 'free',
                    user_id: user.id
                });

            if (insertError) {
                console.error('Insert error:', insertError);
                throw redirect(303, '/auth/auth-code-error');
            }
        }
    }

    const search = new URLSearchParams(url.search);
    search.delete('code');
    search.delete('next');

    throw redirect(303, `/${next.slice(1)}?${search.toString()}`);
};