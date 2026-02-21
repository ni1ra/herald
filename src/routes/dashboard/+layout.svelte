<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data, children } = $props();
	let collapsed = $state(false);

	const user = $derived(data.user);

	const navGroups = [
		{
			label: 'Dispatch',
			items: [
				{ href: '/dashboard', icon: '~', label: 'Overview' },
				{ href: '/dashboard/messages', icon: '>', label: 'Messages' },
				{ href: '/dashboard/templates', icon: '#', label: 'Templates' }
			]
		},
		{
			label: 'Configure',
			items: [
				{ href: '/dashboard/domains', icon: '/', label: 'Domains' },
				{ href: '/dashboard/suppressions', icon: '*', label: 'Suppressions' },
				{ href: '/dashboard/webhooks', icon: '^', label: 'Webhooks' }
			]
		},
		{
			label: 'System',
			items: [
				{ href: '/dashboard/projects', icon: '&', label: 'API Keys' },
				{ href: '/dashboard/settings', icon: '%', label: 'Settings' },
				{ href: '/dashboard/admin', icon: '!', label: 'Admin' }
			]
		}
	];

	function isActive(href: string, currentPath: string): boolean {
		if (href === '/dashboard') return currentPath === '/dashboard';
		return currentPath.startsWith(href);
	}

	async function handleLogout() {
		document.cookie = 'herald_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
		goto('/auth/login');
	}
</script>

<div class="dashboard-shell" class:collapsed>
	<aside class="sidebar">
		<div class="sidebar-top">
			<a href="/dashboard" class="sidebar-brand">
				<span class="brand-glyph">&#9653;</span>
				{#if !collapsed}
					<span class="brand-label">HERALD</span>
				{/if}
			</a>
			<button class="collapse-btn" onclick={() => collapsed = !collapsed} aria-label="Toggle sidebar">
				{collapsed ? '>' : '<'}
			</button>
		</div>

		<nav class="sidebar-nav">
			{#each navGroups as group}
				<div class="nav-group">
					{#if !collapsed}
						<div class="nav-group-label">{group.label}</div>
					{/if}
					{#each group.items as item}
						<a
							href={item.href}
							class="nav-item"
							class:active={isActive(item.href, $page.url.pathname)}
						>
							<span class="nav-icon">{item.icon}</span>
							{#if !collapsed}
								<span class="nav-label">{item.label}</span>
							{/if}
						</a>
					{/each}
				</div>
			{/each}
		</nav>

		<div class="sidebar-footer">
			{#if !collapsed}
				<div class="user-info">
					<div class="user-name">{user?.user?.name ?? 'Operator'}</div>
					<div class="user-org">{user?.tenant?.name ?? 'Unknown'}</div>
					<div class="user-email truncate">{user?.user?.email ?? ''}</div>
				</div>
			{/if}
			<button class="btn btn-sm btn-secondary logout-btn" onclick={handleLogout}>
				{collapsed ? 'X' : 'Disconnect'}
			</button>
		</div>
	</aside>

	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.dashboard-shell {
		display: flex;
		min-height: 100vh;
	}

	/* ─── Sidebar ──────────────────────────────────────── */
	.sidebar {
		width: 240px;
		background: var(--bg-surface);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		transition: width 0.2s;
		flex-shrink: 0;
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
	}

	.collapsed .sidebar {
		width: 56px;
	}

	.sidebar-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid var(--border);
	}

	.sidebar-brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--accent);
		font-weight: 700;
		letter-spacing: 0.15em;
		font-size: 0.85rem;
	}

	.brand-glyph {
		font-size: 1.2rem;
		text-shadow: 0 0 12px var(--accent-dim);
	}

	.collapse-btn {
		background: none;
		border: 1px solid var(--border);
		color: var(--text-dim);
		width: 24px;
		height: 24px;
		border-radius: 2px;
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s, border-color 0.2s;
	}

	.collapse-btn:hover {
		color: var(--accent);
		border-color: var(--accent);
	}

	/* ─── Navigation ───────────────────────────────────── */
	.sidebar-nav {
		flex: 1;
		padding: 0.75rem 0;
	}

	.nav-group {
		margin-bottom: 0.5rem;
	}

	.nav-group-label {
		padding: 0.35rem 1rem;
		font-size: 0.65rem;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem 1rem;
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.8rem;
		transition: color 0.15s, background 0.15s;
		border-left: 2px solid transparent;
	}

	.nav-item:hover {
		color: var(--text-primary);
		background: var(--bg-card);
	}

	.nav-item.active {
		color: var(--accent);
		border-left-color: var(--accent);
		background: var(--accent-dim);
	}

	.nav-icon {
		font-weight: 700;
		width: 1rem;
		text-align: center;
		flex-shrink: 0;
	}

	/* ─── Footer ───────────────────────────────────────── */
	.sidebar-footer {
		padding: 1rem;
		border-top: 1px solid var(--border);
	}

	.user-info {
		margin-bottom: 0.75rem;
	}

	.user-name {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.user-org {
		font-size: 0.7rem;
		color: var(--accent);
	}

	.user-email {
		font-size: 0.65rem;
		color: var(--text-dim);
		max-width: 180px;
	}

	.logout-btn {
		width: 100%;
		justify-content: center;
	}

	/* ─── Main Content ─────────────────────────────────── */
	.main-content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
		max-width: 1200px;
	}

	@media (max-width: 768px) {
		.sidebar {
			width: 56px;
		}

		.collapsed .sidebar {
			width: 56px;
		}

		.main-content {
			padding: 1rem;
		}
	}
</style>
