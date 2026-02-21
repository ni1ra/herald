<script lang="ts">
	let { data } = $props();
	let gdprEmail = $state('');
	let gdprLoading = $state(false);
	let gdprResult = $state('');
	let exportLoading = $state(false);

	async function handleGdprExport() {
		exportLoading = true;
		const res = await fetch('/api/v1/compliance/gdpr/export');
		if (res.ok) {
			const result = await res.json();
			const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `herald-gdpr-export-${Date.now()}.json`;
			a.click();
			URL.revokeObjectURL(url);
		}
		exportLoading = false;
	}

	async function handleGdprDelete() {
		if (!gdprEmail) return;
		gdprLoading = true;
		const res = await fetch('/api/v1/compliance/gdpr/delete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email: gdprEmail })
		});
		if (res.ok) {
			gdprResult = `All data for ${gdprEmail} has been erased.`;
			gdprEmail = '';
		} else {
			gdprResult = 'Erasure failed. Please try again.';
		}
		gdprLoading = false;
	}
</script>

<div class="page-header">
	<h1>Settings</h1>
	<p class="page-subtitle">Organization settings and GDPR compliance</p>
</div>

<div class="card" style="margin-bottom: 1.5rem;">
	<h3 class="card-title">Organization</h3>
	{#if data.tenant}
		<div class="settings-grid">
			<div class="setting-row"><span class="setting-label">Name</span><span class="setting-value">{data.tenant.name}</span></div>
			<div class="setting-row"><span class="setting-label">Slug</span><span class="setting-value mono">{data.tenant.slug}</span></div>
			<div class="setting-row"><span class="setting-label">Plan</span><span class="badge">{data.tenant.plan}</span></div>
			<div class="setting-row"><span class="setting-label">Created</span><span class="setting-value text-dim">{new Date(data.tenant.created_at).toLocaleDateString()}</span></div>
		</div>
	{:else}
		<p class="text-dim">Unable to load organization settings.</p>
	{/if}
</div>

<div class="card" style="margin-bottom: 1.5rem;">
	<h3 class="card-title">GDPR Compliance</h3>
	<div class="gdpr-section">
		<div class="gdpr-action">
			<h4>Data Export</h4>
			<p class="text-dim">Download all email data associated with your organization.</p>
			<button class="btn btn-primary" onclick={handleGdprExport} disabled={exportLoading}>
				{exportLoading ? 'Exporting...' : 'Export All Data'}
			</button>
		</div>
		<div class="gdpr-action">
			<h4>Data Erasure</h4>
			<p class="text-dim">Permanently delete all messages and events for a recipient email.</p>
			<form class="inline-form" onsubmit={(e) => { e.preventDefault(); handleGdprDelete(); }}>
				<input type="email" bind:value={gdprEmail} placeholder="recipient@example.com" class="input" required />
				<button type="submit" class="btn btn-danger" disabled={gdprLoading}>
					{gdprLoading ? 'Erasing...' : 'Erase Data'}
				</button>
			</form>
			{#if gdprResult}
				<p class="gdpr-result" style="margin-top: 0.75rem; color: var(--accent);">{gdprResult}</p>
			{/if}
		</div>
	</div>
</div>

<div class="card">
	<h3 class="card-title">EU Data Sovereignty</h3>
	<div class="settings-grid">
		<div class="setting-row"><span class="setting-label">Jurisdiction</span><span class="setting-value">European Union</span></div>
		<div class="setting-row"><span class="setting-label">Data Residency</span><span class="setting-value">EU (eu-west-1)</span></div>
		<div class="setting-row"><span class="setting-label">US CLOUD Act</span><span class="setting-value" style="color: var(--accent);">No Exposure</span></div>
		<div class="setting-row"><span class="setting-label">Compliance</span><span class="setting-value">GDPR, Schrems II, NIS2, ePrivacy</span></div>
	</div>
</div>

<style>
	.settings-grid { display: flex; flex-direction: column; gap: 0.5rem; }
	.setting-row { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
	.setting-label { width: 140px; font-size: 0.8rem; color: var(--text-dim); flex-shrink: 0; }
	.setting-value { font-size: 0.85rem; }
	.gdpr-section { display: flex; flex-direction: column; gap: 1.5rem; }
	.gdpr-action h4 { margin-bottom: 0.25rem; font-size: 0.9rem; }
	.inline-form { display: flex; gap: 0.75rem; flex-wrap: wrap; }
	.inline-form .input { flex: 1; min-width: 200px; }
</style>
