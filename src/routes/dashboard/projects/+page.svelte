<script lang="ts">
	let { data } = $props();
	let label = $state('');
	let loading = $state(false);
	let newKey = $state('');

	async function createKey() {
		if (!label) return;
		loading = true;
		const res = await fetch('/api/v1/keys', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ label })
		});
		if (res.ok) {
			const result = await res.json();
			newKey = result.key ?? '';
			label = '';
		}
		loading = false;
	}
</script>

<div class="page-header">
	<h1>API Keys</h1>
	<p class="page-subtitle">Manage keys for the Herald sending API</p>
</div>

{#if newKey}
<div class="card" style="margin-bottom: 1.5rem; border-color: var(--accent);">
	<h3 class="card-title" style="color: var(--accent);">API Key Created</h3>
	<p>Copy this key now — it will not be shown again:</p>
	<code style="display:block;padding:0.75rem;background:var(--bg-base);border:1px solid var(--accent);border-radius:4px;word-break:break-all;color:var(--accent);font-size:0.85rem;">{newKey}</code>
	<button class="btn btn-sm btn-primary" style="margin-top:0.75rem;" onclick={() => { newKey = ''; location.reload(); }}>Done</button>
</div>
{/if}

<div class="card" style="margin-bottom: 1.5rem;">
	<h3 class="card-title">Create API Key</h3>
	<form class="inline-form" onsubmit={(e) => { e.preventDefault(); createKey(); }}>
		<input type="text" bind:value={label} placeholder="Key label (e.g. Production)" class="input" required />
		<button type="submit" class="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Key'}</button>
	</form>
</div>

<div class="card">
	<table class="data-table">
		<thead><tr><th>Prefix</th><th>Label</th><th>Created</th></tr></thead>
		<tbody>
			{#each data.keys ?? [] as key}
				<tr>
					<td class="mono">{key.key_prefix}</td>
					<td>{key.label}</td>
					<td class="text-dim">{new Date(key.created_at).toLocaleDateString()}</td>
				</tr>
			{:else}
				<tr><td colspan="3" class="text-center text-dim">No API keys yet</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="card" style="margin-top: 1.5rem;">
	<h3 class="card-title">Quick Start</h3>
	<pre class="code-block"><code>curl -X POST https://herald.eurostack.eu/api/v1/send \
  -H "X-API-Key: hk_your_key_here" \
  -H "Content-Type: application/json" \
  -d '&#123;
    "from": "noreply@yourdomain.eu",
    "to": "user@example.com",
    "subject": "Hello from Herald",
    "html_body": "&lt;h1&gt;Welcome&lt;/h1&gt;"
  &#125;'</code></pre>
</div>

<style>
	.inline-form { display: flex; gap: 0.75rem; flex-wrap: wrap; }
	.inline-form .input { flex: 1; min-width: 200px; }
</style>
