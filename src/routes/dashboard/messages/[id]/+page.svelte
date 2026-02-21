<script lang="ts">
	let { data } = $props();

	const message = $derived(data.message);

	function formatTime(iso: string): string {
		return new Date(iso).toLocaleString('en-GB', {
			year: 'numeric', month: 'short', day: 'numeric',
			hour: '2-digit', minute: '2-digit', second: '2-digit'
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

	function eventIcon(type: string): string {
		switch (type) {
			case 'queued': return '...';
			case 'sent': return '>>';
			case 'delivered': return '++';
			case 'opened': return '**';
			case 'bounced': return '!!';
			case 'clicked': return '~~';
			default: return '--';
		}
	}
</script>

<div class="page-header">
	<a href="/dashboard/messages" class="btn btn-sm btn-secondary">&lt; Messages</a>
	<span class="badge {statusBadge(message.status)}">{message.status}</span>
</div>

<div class="message-detail">
	<!-- Metadata -->
	<div class="card mb-2">
		<h2 class="section-title">Message Metadata</h2>
		<div class="meta-grid">
			<div class="meta-item">
				<span class="meta-label">From</span>
				<span class="meta-value">{message.from_email}</span>
			</div>
			<div class="meta-item">
				<span class="meta-label">To</span>
				<span class="meta-value">{message.to_email}</span>
			</div>
			<div class="meta-item">
				<span class="meta-label">Subject</span>
				<span class="meta-value">{message.subject}</span>
			</div>
			<div class="meta-item">
				<span class="meta-label">Status</span>
				<span class="meta-value"><span class="badge {statusBadge(message.status)}">{message.status}</span></span>
			</div>
			<div class="meta-item">
				<span class="meta-label">Sent</span>
				<span class="meta-value">{formatTime(message.created_at)}</span>
			</div>
			{#if message.delivered_at}
				<div class="meta-item">
					<span class="meta-label">Delivered</span>
					<span class="meta-value">{formatTime(message.delivered_at)}</span>
				</div>
			{/if}
			{#if message.tag}
				<div class="meta-item">
					<span class="meta-label">Tag</span>
					<span class="meta-value">{message.tag}</span>
				</div>
			{/if}
			{#if message.template_id}
				<div class="meta-item">
					<span class="meta-label">Template</span>
					<span class="meta-value">{message.template_id}</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Body Preview -->
	{#if message.html_body}
		<div class="card mb-2">
			<h2 class="section-title">HTML Body</h2>
			<div class="body-preview">
				<div class="code-block">
					<code>{message.html_body}</code>
				</div>
			</div>
		</div>
	{/if}

	{#if message.text_body}
		<div class="card mb-2">
			<h2 class="section-title">Text Body</h2>
			<div class="code-block">
				<code>{message.text_body}</code>
			</div>
		</div>
	{/if}

	<!-- Delivery Events Timeline -->
	{#if message.events && message.events.length > 0}
		<div class="card">
			<h2 class="section-title">Delivery Events</h2>
			<div class="timeline">
				{#each message.events as event}
					<div class="timeline-item">
						<div class="timeline-event">
							<span class="event-icon">{eventIcon(event.type)}</span>
							<span class="badge {statusBadge(event.type)}">{event.type}</span>
							{#if event.metadata}
								<span class="text-dim" style="font-size:0.7rem;margin-left:0.5rem;">
									{typeof event.metadata === 'string' ? event.metadata : JSON.stringify(event.metadata)}
								</span>
							{/if}
						</div>
						<div class="timeline-time">{formatTime(event.created_at)}</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="card">
			<h2 class="section-title">Delivery Events</h2>
			<div class="empty-state">
				<p>No delivery events recorded yet.</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.meta-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 0.75rem;
	}

	.meta-item {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.meta-label {
		font-size: 0.65rem;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.meta-value {
		font-size: 0.85rem;
		color: var(--text-primary);
		word-break: break-all;
	}

	.body-preview {
		max-height: 400px;
		overflow-y: auto;
	}

	.event-icon {
		font-weight: 700;
		color: var(--accent);
		margin-right: 0.35rem;
	}
</style>
