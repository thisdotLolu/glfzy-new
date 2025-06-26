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
			const { name, email, role } = await request.json();
            console.log(name,email,role)

			// Check if user already exists
			// eslint-disable-next-line prefer-const
			let { data: existingMember, error: memberCheckError } = await supabase
				.from('members')
				.select('*')
				.eq('email', email)
				.maybeSingle();

            
            console.log('memberCheckError',memberCheckError)

			const memberData = {
				name,
				email,
				role
			};

            if (!existingMember) {
                const { data, error } = await supabase
				.from('members')
				.upsert([memberData])
				.select('*');

                if (error) {
                    console.error('Error adding member to group:', error);
                    return json({ error: error.message }, { status: 400 });
                }
    
                console.log("after adding data",data);

                existingMember = data
            }

            console.log("existingMember after adding", existingMember)

            return json(
                { message: 'Member added to group successfully', data:existingMember },
                { status: 201 },
            );

		} catch (error) {
        console.error('Server error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};



export const DELETE: RequestHandler = async ({ request, cookies }) => {
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

        const { data: member, error: fetchError } = await supabase
            .from('members')
            .select('id')
            .eq('email', email)
            .single();

        if (fetchError || !member) {
            return json({ error: 'Member not found' }, { status: 404 });
        }

        const { error: groupDeleteError } = await supabase
            .from('group_members')
            .delete()
            .eq('member_id', member.id);

        if (groupDeleteError) {
            console.log(groupDeleteError)
            return json({ error: 'Failed to remove member from group' }, { status: 500 });
        }

        const { error: memberDeleteError } = await supabase
            .from('members')
            .delete()
            .eq('id', member.id);

        if (memberDeleteError) {
            console.log(groupDeleteError)
            return json({ error: 'Failed to delete member' }, { status: 500 });
        }

        return json({ message: 'Member successfully removed' }, { status: 200 });
    } catch (error) {
        console.error('Server error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};


