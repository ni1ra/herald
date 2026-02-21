<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	const templates = $derived(data.templates);

	let showForm = $state(false);
	let formName = $state('');
	let formSubject = $state('');
	let formHtml = $state('');
	let formText = $state('');
	let formError = $state('');
	let formLoading = $state(false);

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-GB', {
			year: 'numeric', month: 'short', day: 'numeric'
		});
	}

	async function handleCreate() {
		formError = '';
		formLoading = true;

		try {
			const res = await fetch('/api/v1/templates', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formName,
					subject: formSubject,
					html_body: formHtml || undefined,
					text_body: formText || undefined
				})
			});

			const result = await res.json();
			if (!res.ok) {
				formError = result.error || 'Failed to create template';
				return;
			}

			// Reset form
			formName = '';
			formSubject = '';
			formHtml = '';
			formText = '';
			showForm = false;
			invalidateAll();
		} catch {
			formError = 'Connection failed';
		} finally {
			formLoading = false;
		}
	}
</script>

<div class="page-header">
	<h1 class="page-title">Templates</h1>
	<button class="btn btn-primary btn-sm" onclick={() => showForm = !showForm}>
		{showForm ? 'Cancel' : 'Create Template'}
	</button>
</div>

{#if showForm}
	<div class="inline-form">
		<div class="form-title">New Template</div>

		{#if formError}
			<div class="error-msg">{formError}</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleCreate(); }}>
			<div class="grid-2 mb-2">
				<div class="form-group">
					<label for="tmpl-name">Name</label>
					<input id="tmpl-name" type="text" bind:value={formName} placeholder="welcome-email" required />
				</div>
				<div class="form-group">
					<label for="tmpl-subject">Subject</label>
					<input id="tmpl-subject" type="text" bind:value={formSubject} placeholder="Welcome, {{name}}!" required />
				</div>
			</div>

			<div class="form-group mb-2">
				<label for="tmpl-html">HTML Body</label>
				<textarea id="tmpl-html" bind:value={formHtml} placeholder="<h1>Welcome, {{name}}!</h1>" rows="6"></textarea>
			</div>

			<div class="form-group mb-2">
				<label for="tmpl-text">Text Body</label>
				<textarea id="tmpl-text" bind:value={formText} placeholder="Welcome, {{name}}!" rows="3"></textarea>
			</div>

			<div class="form-actions">
				<button type="submit" class="btn btn-primary btn-sm" disabled={formLoading}>
					{formLoading ? 'Creating...' : 'Create'}
				</button>
				<button type="button" class="btn btn-secondary btn-sm" onclick={() => showForm = false}>Cancel</button>
			</div>
		</form>
	</div>
{/if}

{#if templates.length === 0}
	<div class="card">
		<div class="empty-state">
			<div class="empty-icon">#</div>
			<p>No templates yet. Create one to start using template-based emails.</p>
		</div>
	</div>
{:else}
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Subject</th>
					<th>Variables</th>
					<th>Version</th>
					<th>Created</th>
				</tr>
			</thead>
			<tbody>
				{#each templates as tmpl}
					<tr>
						<td class="text-accent" style="font-weight:600;">{tmpl.name}</td>
						<td class="truncate" style="max-width:280px;">{tmpl.subject}</td>
						<td>
							{#if tmpl.variables && tmpl.variables.length > 0}
								{#each tmpl.variables as v}
									<span class="badge badge-blue" style="margin-right:0.25rem;">{v}</span>
								{/each}
							{:else}
								<span class="text-dim">none</span>
							{/if}
						</td>
						<td class="text-dim">{tmpl.version || 1}</td>
						<td class="text-dim">{formatDate(tmpl.created_at)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
