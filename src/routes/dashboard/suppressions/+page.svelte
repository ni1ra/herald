<script lang="ts">
	let { data } = $props();
	let email = $state('');
	let reason = $state('');
	let loading = $state(false);

	async function addSuppression() {
		if (!email) return;
		loading = true;
		const res = await fetch('/api/v1/suppressions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, reason: reason || 'manual' })
		});
		if (res.ok) location.reload();
		loading = false;
	}

	async function removeSuppression(id: string) {
		await fetch(`/api/v1/suppressions/${id}`, { method: 'DELETE' });
		location.reload();
	}
</script>

<div class="page-header">
	<h1>Suppression List</h1>
	<p class="page-subtitle">Blocked recipients that will not receive emails</p>
</div>

<div class="card" style="margin-bottom: 1.5rem;">
	<h3 class="card-title">Add Suppression</h3>
	<form class="inline-form" onsubmit={(e) => { e.preventDefault(); addSuppression(); }}>
		<input type="email" bind:value={email} placeholder="email@example.com" class="input" required />
		<input type="text" bind:value={reason} placeholder="Reason (optional)" class="input" />
		<button type="submit" class="btn btn-primary" disabled={loading}>
			{loading ? 'Adding...' : 'Suppress'}
		</button>
	</form>
</div>

<div class="card">
	<table class="data-table">
		<thead>
			<tr><th>Email</th><th>Reason</th><th>Date</th><th>Actions</th></tr>
		</thead>
		<tbody>
			{#each data.suppressions ?? [] as sup}
				<tr>
					<td class="mono">{sup.email}</td>
					<td>{sup.reason}</td>
					<td class="text-dim">{new Date(sup.created_at).toLocaleDateString()}</td>
					<td><button class="btn btn-sm btn-danger" onclick={() => removeSuppression(sup.id)}>Remove</button></td>
				</tr>
			{:else}
				<tr><td colspan="4" class="text-center text-dim">No suppressed addresses</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.inline-form { display: flex; gap: 0.75rem; flex-wrap: wrap; }
	.inline-form .input { flex: 1; min-width: 200px; }
</style>
