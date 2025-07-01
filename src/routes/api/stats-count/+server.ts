import { json } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

function parseCustomDate(dateStr: string, timeStr?: string): Date {
	const [day, month, year] = dateStr.split('-').map(Number);

	let hours = 0;
	let minutes = 0;

	if (timeStr) {
		const cleaned = timeStr.trim().toLowerCase();
		const ampmMatch = cleaned.match(/^(\d{1,2}):(\d{2})\s?(am|pm)$/i);
		if (ampmMatch) {
			hours = parseInt(ampmMatch[1], 10);
			minutes = parseInt(ampmMatch[2], 10);
			const period = ampmMatch[3];

			if (period === 'pm' && hours < 12) hours += 12;
			if (period === 'am' && hours === 12) hours = 0;
		} else {
			const [h, m] = cleaned.split(':').map(Number);
			if (!isNaN(h) && !isNaN(m)) {
				hours = h;
				minutes = m;
			}
		}
	}

	return new Date(year, month - 1, day, hours, minutes);
}


export const GET: RequestHandler = async ({ cookies }) => {
	const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => cookies.get(key) || '',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			set: (key, value, options:any) => cookies.set(key, value, options),
		},
	});

	const { data: { session }, error: sessionError } = await supabase.auth.getSession();
	if (sessionError || !session) return json({ error: 'Unauthenticated' }, { status: 401 });

	const userId = session.user.id;

	try {
		const { count: totalTeeTimes } = await supabase
			.from('tee-times')
			.select('*', { count: 'exact', head: true })
			.eq('creator_id', userId);

		const { data: upcomingTeeTimesData } = await supabase
			.from('tee-times')
			.select('date')
			.eq('creator_id', userId);

		console.log(upcomingTeeTimesData)

		const upcomingTeeTimes = upcomingTeeTimesData?.filter(tt => {
			const date = parseCustomDate(tt.date);
			console.log(date)
			return date.getTime() > Date.now();
		}).length || 0;

		const pastTeeTimes = upcomingTeeTimesData?.filter(tt => {
			const date = parseCustomDate(tt.date);
			console.log(Date.now())
			return date.getTime() < Date.now();
		}).length || 0;
		

		const { data: userGroups, error: groupError } = await supabase
			.from('groups')
			.select('id')
			.eq('owner_id', userId);

        if (groupError) throw groupError;

        const groupIds = userGroups?.map((g) => g.id) || [];

        let averageGroupSize = '0';

        if (groupIds.length > 0) {
            const { data: membersData, error: membersError } = await supabase
                .from('group_members')
                .select('group_id');

            if (membersError) throw membersError;

            const totalMembers =
                membersData?.filter((m) => groupIds.includes(m.group_id)).length || 0;
            averageGroupSize = (totalMembers / groupIds.length).toFixed(1);
        }

		const { count: activeGroups } = await supabase
			.from('groups')
			.select('id', { count: 'exact', head: true })
			.eq('owner_id', userId);


		console.log('pst',pastTeeTimes)

		return json({
			totalTeeTimes,
			activeGroups,
			upcomingTeeTimes,
			averageGroupSize,
			pastTeeTimes
		});
	} catch (err) {
		console.error('Error getting dashboard stats:', err);
		return json({ error: 'Server error' }, { status: 500 });
	}
};
