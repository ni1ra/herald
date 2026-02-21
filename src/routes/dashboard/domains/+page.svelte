<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const domains = $derived(data.domains);

	let showForm = $state(false);
	let formDomain = $state('');
	let formError = $state('');
	let formLoading = $state(false);
	let newDomainResult: any = $state(null);

	let expandedDomain = $state('');

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-GB', {
			year: 'numeric', month: 'short', day: 'numeric'
		});
	}

	async function handleAdd() {
		formError = '';
		formLoading = true;
		newDomainResult = null;

		try {
			const res = await fetch('/api/v1/domains', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ domain: formDomain })
			});

			const result = await res.json();
			if (!res.ok) {
				formError = result.error || 'Failed to add domain';
				return;
			}

			newDomainResult = result.domain;
			formDomain = '';
			invalidateAll();
		} catch {
			formError = 'Connection failed';
		} finally {
			formLoading = false;
		}
	}
</script>

<div class="page-header">
	<h1 class="page-title">Domains</h1>
	<button class="btn btn-primary btn-sm" onclick={() => { showForm = !showForm; newDomainResult = null; }}>
		{showForm ? 'Cancel' : 'Add Domain'}
	</button>
</div>

{#if showForm}
	<div class="inline-form">
		<div class="form-title">Register Domain</div>

		{#if formError}
			<div class="error-msg">{formError}</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleAdd(); }}>
			<div class="form-group mb-2">
				<label for="domain-name">Domain</label>
				<input id="domain-name" type="text" bind:value={formDomain} placeholder="mail.yourapp.eu" required />
			</div>

			<div class="form-actions">
				<button type="submit" class="btn btn-primary btn-sm" disabled={formLoading}>
					{formLoading ? 'Adding...' : 'Register'}
				</button>
			</div>
		</form>

		{#if newDomainResult?.dns_records}
			<div class="dns-result mt-2">
				<h3 class="section-title">DNS Records to Add</h3>
				<div class="dns-records">
					<div class="dns-record">
						<span class="dns-type badge badge-blue">TXT</span>
						<div>
							<div class="dns-name">{newDomainResult.dns_records.verification.name}</div>
							<div class="dns-value code-block" style="padding:0.5rem;margin-top:0.25rem;font-size:0.7rem;">{newDomainResult.dns_records.verification.value}</div>
						</div>
					</div>
					<div class="dns-record">
						<span class="dns-type badge badge-blue">TXT</span>
						<div>
							<div class="dns-name">{newDomainResult.dns_records.dkim.name}</div>
							<div class="dns-value code-block" style="padding:0.5rem;margin-top:0.25rem;font-size:0.7rem;">{newDomainResult.dns_records.dkim.value}</div>
						</div>
					</div>
					<div class="dns-record">
						<span class="dns-type badge badge-blue">TXT</span>
						<div>
							<div class="dns-name">{newDomainResult.dns_records.spf.name}</div>
							<div class="dns-value code-block" style="padding:0.5rem;margin-top:0.25rem;font-size:0.7rem;">{newDomainResult.dns_records.spf.value}</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}

{#if domains.length === 0}
	<div class="card">
		<div class="empty-state">
			<div class="empty-icon">/</div>
			<p>No domains registered. Add your first sending domain.</p>
		</div>
	</div>
{:else}
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Domain</th>
					<th>Status</th>
					<th>DKIM</th>
					<th>SPF</th>
					<th>Added</th>
				</tr>
			</thead>
			<tbody>
				{#each domains as domain}
					<tr class="clickable" onclick={() => expandedDomain = expandedDomain === domain.id ? '' : domain.id}>
						<td style="font-weight:600;">{domain.domain}</td>
						<td>
							<span class="badge {domain.verified ? 'badge-green' : 'badge-yellow'}">
								{domain.verified ? 'verified' : 'unverified'}
							</span>
						</td>
						<td class="text-dim">{domain.dkim_selector || '-'}</td>
						<td class="truncate text-dim" style="max-width:200px;">{domain.spf_record || '-'}</td>
						<td class="text-dim">{formatDate(domain.created_at)}</td>
					</tr>
					{#if expandedDomain === domain.id}
						<tr>
							<td colspan="5" style="padding:0;">
								<div class="dns-expanded">
									<div class="dns-record-inline">
										<span class="text-dim" style="font-size:0.7rem;">DKIM Selector:</span>
										<code>{domain.dkim_selector || 'herald'}</code>
									</div>
									<div class="dns-record-inline">
										<span class="text-dim" style="font-size:0.7rem;">SPF Record:</span>
										<code>{domain.spf_record || 'N/A'}</code>
									</div>
								</div>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.dns-records {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.dns-record {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
	}

	.dns-type {
		flex-shrink: 0;
		margin-top: 0.15rem;
	}

	.dns-name {
		font-size: 0.75rem;
		color: var(--accent);
		font-weight: 600;
	}

	.dns-expanded {
		padding: 0.75rem 1rem;
		background: var(--bg-surface);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.dns-record-inline {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.dns-record-inline code {
		font-size: 0.7rem;
		color: var(--text-secondary);
	}
</style>
