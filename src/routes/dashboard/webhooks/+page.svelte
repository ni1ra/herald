<script lang="ts">
	let { data } = $props();
	let url = $state('');
	let events = $state('delivered,bounced,complained');
	let loading = $state(false);
	let newSecret = $state('');

	async function addWebhook() {
		if (!url) return;
		loading = true;
		const res = await fetch('/api/v1/webhooks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ url, events: events.split(',').map((e: string) => e.trim()) })
		});
		if (res.ok) {
			const result = await res.json();
			newSecret = result.webhook?.secret ?? '';
			if (!newSecret) location.reload();
		}
		loading = false;
	}

	async function removeWebhook(id: string) {
		await fetch(`/api/v1/webhooks/${id}`, { method: 'DELETE' });
		location.reload();
	}
</script>

<div class="page-header">
	<h1>Webhooks</h1>
	<p class="page-subtitle">Receive real-time delivery notifications</p>
</div>

{#if newSecret}
<div class="card" style="margin-bottom: 1.5rem; border-color: var(--accent);">
	<h3 class="card-title" style="color: var(--accent);">Webhook Created</h3>
	<p>Signing secret (save now — shown once):</p>
	<code style="display:block;padding:0.75rem;background:var(--bg-base);border:1px solid var(--accent);border-radius:4px;word-break:break-all;color:var(--accent);font-size:0.85rem;">{newSecret}</code>
	<button class="btn btn-sm btn-primary" style="margin-top:0.75rem;" onclick={() => { newSecret = ''; location.reload(); }}>Done</button>
</div>
{/if}

<div class="card" style="margin-bottom: 1.5rem;">
	<h3 class="card-title">Register Webhook</h3>
	<form class="inline-form" onsubmit={(e) => { e.preventDefault(); addWebhook(); }}>
		<input type="url" bind:value={url} placeholder="https://your-api.eu/webhooks" class="input" required />
		<input type="text" bind:value={events} placeholder="delivered,bounced,complained" class="input" />
		<button type="submit" class="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
	</form>
</div>

<div class="card">
	<table class="data-table">
		<thead><tr><th>URL</th><th>Events</th><th>Created</th><th>Actions</th></tr></thead>
		<tbody>
			{#each data.webhooks ?? [] as wh}
				<tr>
					<td class="mono truncate" style="max-width:300px;">{wh.url}</td>
					<td>{(wh.events ?? []).join(', ')}</td>
					<td class="text-dim">{new Date(wh.created_at).toLocaleDateString()}</td>
					<td><button class="btn btn-sm btn-danger" onclick={() => removeWebhook(wh.id)}>Delete</button></td>
				</tr>
			{:else}
				<tr><td colspan="4" class="text-center text-dim">No webhooks configured</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.inline-form { display: flex; gap: 0.75rem; flex-wrap: wrap; }
	.inline-form .input { flex: 1; min-width: 200px; }
</style>
