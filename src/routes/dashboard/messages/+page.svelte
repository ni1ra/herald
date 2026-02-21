<script lang="ts">
	let { data } = $props();

	const messages = $derived(data.messages);
	const currentPage = $derived(data.page);
	const totalPages = $derived(data.pages);
	const total = $derived(data.total);

	function formatTime(iso: string): string {
		return new Date(iso).toLocaleString('en-GB', {
			month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
		});
	}

	function statusBadge(status: string): string {
		switch (status) {
			case 'delivered': return 'badge-green';
			case 'opened': return 'badge-yellow';
			case 'bounced': return 'badge-red';
			case 'queued': return 'badge-gray';
			default: return 'badge-blue';
		}
	}
</script>

<div class="page-header">
	<h1 class="page-title">Messages</h1>
	<span class="text-dim" style="font-size:0.75rem;">{total} total</span>
</div>

{#if messages.length === 0}
	<div class="card">
		<div class="empty-state">
			<div class="empty-icon">></div>
			<p>No messages found. Send your first email via the API.</p>
		</div>
	</div>
{:else}
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>To</th>
					<th>Subject</th>
					<th>Status</th>
					<th>Tag</th>
					<th>Sent</th>
				</tr>
			</thead>
			<tbody>
				{#each messages as msg}
					<tr class="clickable" onclick={() => window.location.href = `/dashboard/messages/${msg.id}`}>
						<td class="truncate" style="max-width:200px;">{msg.to_email}</td>
						<td class="truncate" style="max-width:280px;">{msg.subject}</td>
						<td><span class="badge {statusBadge(msg.status)}">{msg.status}</span></td>
						<td class="text-dim">{msg.tag || '-'}</td>
						<td class="text-dim">{formatTime(msg.created_at)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if totalPages > 1}
		<div class="pagination">
			{#if currentPage > 1}
				<a href="/dashboard/messages?page={currentPage - 1}" class="btn btn-sm btn-secondary">Prev</a>
			{/if}
			<span class="page-info">{currentPage} / {totalPages}</span>
			{#if currentPage < totalPages}
				<a href="/dashboard/messages?page={currentPage + 1}" class="btn btn-sm btn-secondary">Next</a>
			{/if}
		</div>
	{/if}
{/if}

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.page-info {
		font-size: 0.75rem;
		color: var(--text-dim);
	}
</style>
