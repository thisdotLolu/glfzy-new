import { userStore } from '../stores/userStore';
import type { SupabaseClient } from '@supabase/supabase-js';


export async function fetchUserData(supabase: SupabaseClient) {
    try {
        userStore.setLoading(true);
        userStore.setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
            console.warn('fetchUserData: No active session found');
            userStore.setUser(null);
            return;
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;



        userStore.setUser(user);

        if (user) {
            const { data: userData, error: dbError } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (dbError) throw dbError;

            userStore.setUserData(userData);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        userStore.setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
        userStore.setLoading(false);
    }
}

export async function logout(supabase: SupabaseClient) {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        userStore.reset();
    } catch (error) {
        console.error('Error during logout:', error);
        userStore.setError(error instanceof Error ? error.message : 'Logout failed');
    }
}