import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({
		provider: 'HERALD',
		jurisdiction: 'EU',
		data_residency: 'EU',
		compliance: ['GDPR', 'Schrems II', 'NIS2', 'ePrivacy'],
		us_cloud_act_exposure: false,
		data_transfers_outside_eu: false,
		email_infrastructure: 'All email processing in EU data centers',
		verified_at: new Date().toISOString()
	});
};
