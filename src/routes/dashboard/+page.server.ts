import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const session = cookies.get('herald_session');
	const headers = { Cookie: `herald_session=${session}` };

	const [messagesRes, eventsRes] = await Promise.all([
		fetch('/api/v1/messages?limit=5', { headers }),
		fetch('/api/v1/events?limit=100', { headers })
	]);

	const messagesData = messagesRes.ok ? await messagesRes.json() : { data: [], total: 0 };
	const eventsData = eventsRes.ok ? await eventsRes.json() : { events: [], total: 0 };

	// Compute analytics from events
	const events = eventsData.events || [];
	const now = new Date();
	const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

	let sent = 0;
	let delivered = 0;
	let opened = 0;
	let bounced = 0;
	const dailyVolume: Record<string, number> = {};

	for (const event of events) {
		const eventDate = new Date(event.created_at);
		if (eventDate < sevenDaysAgo) continue;

		const dayKey = eventDate.toISOString().split('T')[0];
		dailyVolume[dayKey] = (dailyVolume[dayKey] || 0) + 1;

		switch (event.type) {
			case 'queued':
			case 'sent':
				sent++;
				break;
			case 'delivered':
				delivered++;
				break;
			case 'opened':
				opened++;
				break;
			case 'bounced':
				bounced++;
				break;
		}
	}

	const total = sent + delivered + opened + bounced || 1;
	const delivery_rate = ((delivered + opened) / total * 100).toFixed(1);
	const open_rate = (opened / total * 100).toFixed(1);
	const bounce_rate = (bounced / total * 100).toFixed(1);
	const click_rate = '0.0'; // No click events tracked yet

	// Build daily chart data for last 7 days
	const dailyChart: { date: string; count: number }[] = [];
	for (let i = 6; i >= 0; i--) {
		const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
		const key = d.toISOString().split('T')[0];
		dailyChart.push({ date: key, count: dailyVolume[key] || 0 });
	}

	return {
		stats: { sent, delivered, opened, bounced },
		rates: { delivery_rate, open_rate, click_rate, bounce_rate },
		dailyChart,
		recentMessages: messagesData.data || []
	};
};
