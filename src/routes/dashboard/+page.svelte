<script lang="ts">
	let { data } = $props();

	const stats = $derived(data.stats);
	const rates = $derived(data.rates);
	const dailyChart = $derived(data.dailyChart);
	const recentMessages = $derived(data.recentMessages);

	const maxVolume = $derived(Math.max(...dailyChart.map((d: any) => d.count), 1));

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
	}

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
			default: return 'badge-gray';
		}
	}
</script>

<div class="page-header">
	<h1 class="page-title">Overview</h1>
</div>

<!-- Stats -->
<div class="stats-grid">
	<div class="stat-card">
		<span class="stat-label">Sent (7d)</span>
		<span class="stat-value">{stats.sent}</span>
	</div>
	<div class="stat-card">
		<span class="stat-label">Delivered</span>
		<span class="stat-value">{stats.delivered}</span>
	</div>
	<div class="stat-card">
		<span class="stat-label">Opened</span>
		<span class="stat-value">{stats.opened}</span>
	</div>
	<div class="stat-card">
		<span class="stat-label">Bounced</span>
		<span class="stat-value">{stats.bounced}</span>
	</div>
</div>

<!-- Rates -->
<div class="rates-grid">
	<div class="rate-item">
		<span class="rate-label">Delivery</span>
		<span class="rate-value">{rates.delivery_rate}%</span>
	</div>
	<div class="rate-item">
		<span class="rate-label">Open</span>
		<span class="rate-value">{rates.open_rate}%</span>
	</div>
	<div class="rate-item">
		<span class="rate-label">Click</span>
		<span class="rate-value">{rates.click_rate}%</span>
	</div>
	<div class="rate-item">
		<span class="rate-label">Bounce</span>
		<span class="rate-value text-error">{rates.bounce_rate}%</span>
	</div>
</div>

<!-- Daily Volume Chart -->
<div class="card mb-3">
	<h2 class="section-title">Daily Volume (7d)</h2>
	<div class="chart">
		{#each dailyChart as day}
			<div class="chart-col">
				<div class="chart-bar-wrap">
					<div class="chart-bar" style="height: {(day.count / maxVolume) * 100}%"></div>
				</div>
				<span class="chart-label">{formatDate(day.date)}</span>
				<span class="chart-value">{day.count}</span>
			</div>
		{/each}
	</div>
</div>

<!-- Recent Messages -->
<div class="card">
	<h2 class="section-title">Recent Messages</h2>
	{#if recentMessages.length === 0}
		<div class="empty-state">
			<p>No messages dispatched yet. Send your first email via the API.</p>
		</div>
	{:else}
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>To</th>
						<th>Subject</th>
						<th>Status</th>
						<th>Sent</th>
					</tr>
				</thead>
				<tbody>
					{#each recentMessages as msg}
						<tr class="clickable" onclick={() => window.location.href = `/dashboard/messages/${msg.id}`}>
							<td class="truncate" style="max-width:180px;">{msg.to_email}</td>
							<td class="truncate" style="max-width:250px;">{msg.subject}</td>
							<td><span class="badge {statusBadge(msg.status)}">{msg.status}</span></td>
							<td class="text-dim">{formatTime(msg.created_at)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.rates-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.rate-item {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.75rem 1rem;
		text-align: center;
	}

	.rate-label {
		display: block;
		font-size: 0.65rem;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 0.15rem;
	}

	.rate-value {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--accent);
	}

	/* Chart */
	.chart {
		display: flex;
		gap: 0.5rem;
		align-items: flex-end;
		height: 150px;
		padding-top: 1rem;
	}

	.chart-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.chart-bar-wrap {
		width: 100%;
		height: 100px;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.chart-bar {
		width: 60%;
		min-height: 2px;
		background: var(--accent);
		border-radius: 2px 2px 0 0;
		box-shadow: 0 0 8px var(--accent-dim);
		transition: height 0.3s;
	}

	.chart-label {
		font-size: 0.6rem;
		color: var(--text-dim);
	}

	.chart-value {
		font-size: 0.65rem;
		color: var(--text-secondary);
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.rates-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
