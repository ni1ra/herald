<script lang="ts">
	let { data } = $props();
	const admin = $derived(data.admin);
</script>

<div class="page-header">
	<h1>Admin Panel</h1>
	<p class="page-subtitle">System-wide overview (superuser only)</p>
</div>

{#if !admin}
	<div class="card"><p class="text-dim text-center">Superuser access required.</p></div>
{:else}
	<div class="stat-grid">
		<div class="stat-card"><div class="stat-value">{admin.stats?.total_tenants ?? 0}</div><div class="stat-label">Tenants</div></div>
		<div class="stat-card"><div class="stat-value">{admin.stats?.total_users ?? 0}</div><div class="stat-label">Users</div></div>
		<div class="stat-card"><div class="stat-value">{admin.stats?.total_messages ?? 0}</div><div class="stat-label">Messages</div></div>
		<div class="stat-card"><div class="stat-value">{admin.stats?.total_domains ?? 0}</div><div class="stat-label">Domains</div></div>
	</div>

	<div class="card" style="margin-bottom: 1.5rem;">
		<h3 class="card-title">Tenants</h3>
		<table class="data-table">
			<thead><tr><th>Name</th><th>Slug</th><th>Plan</th><th>Created</th></tr></thead>
			<tbody>
				{#each admin.tenants ?? [] as tenant}
					<tr>
						<td>{tenant.name}</td>
						<td class="mono">{tenant.slug}</td>
						<td><span class="badge">{tenant.plan}</span></td>
						<td class="text-dim">{new Date(tenant.created_at).toLocaleDateString()}</td>
					</tr>
				{:else}
					<tr><td colspan="4" class="text-center text-dim">No tenants</td></tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="card">
		<h3 class="card-title">Users</h3>
		<table class="data-table">
			<thead><tr><th>Email</th><th>Role</th><th>Created</th></tr></thead>
			<tbody>
				{#each admin.users ?? [] as user}
					<tr>
						<td class="mono">{user.email}</td>
						<td><span class="badge">{user.role}</span></td>
						<td class="text-dim">{new Date(user.created_at).toLocaleDateString()}</td>
					</tr>
				{:else}
					<tr><td colspan="3" class="text-center text-dim">No users</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
