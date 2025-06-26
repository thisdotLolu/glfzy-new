import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

interface UserData {
    name: string;
    email: string;
    subscription_tier: string;
    created_at: string;
    user_id:string;
    subscription_expiry_date:string
}


interface UserState {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    userData: null,
    loading: false,
    error: null,
};


function createUserStore() {
    const { subscribe, set, update } = writable<UserState>(initialState);

    return {
        subscribe,
        setUser: (user: User | null) => 
            update(state => ({ ...state, user })),
        setUserData: (userData: UserData | null) => 
            update(state => ({ ...state, userData })),
        setLoading: (loading: boolean) => 
            update(state => ({ ...state, loading })),
        setError: (error: string | null) => 
            update(state => ({ ...state, error })),
        reset: () => set(initialState),
    };
}

export const userStore = createUserStore();