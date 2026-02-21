<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let name = $state('');
	let org_name = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleRegister() {
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/v1/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, name, org_name })
			});

			const data = await res.json();

			if (!res.ok) {
				error = data.error || 'Registration failed';
				return;
			}

			goto('/dashboard');
		} catch {
			error = 'Connection failed. Check network.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="auth-page">
	<div class="auth-container">
		<a href="/" class="auth-brand">
			<span class="brand-glyph">&#9653;</span>
			<span>HERALD</span>
		</a>

		<h1 class="auth-title">Initialize Relay</h1>
		<p class="auth-subtitle">Establish your transmission node</p>

		{#if error}
			<div class="error-msg">{error}</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleRegister(); }}>
			<div class="form-group mb-2">
				<label for="name">Operator Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					placeholder="Operator callsign"
					required
				/>
			</div>

			<div class="form-group mb-2">
				<label for="org_name">Organisation</label>
				<input
					id="org_name"
					type="text"
					bind:value={org_name}
					placeholder="Relay node name"
					required
				/>
			</div>

			<div class="form-group mb-2">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="operator@relay.eu"
					required
					autocomplete="email"
				/>
			</div>

			<div class="form-group mb-2">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Min 8 characters"
					required
					minlength="8"
					autocomplete="new-password"
				/>
			</div>

			<button type="submit" class="btn btn-primary auth-submit" disabled={loading}>
				{loading ? 'Initializing...' : 'Initialize Relay'}
			</button>
		</form>

		<p class="auth-switch">
			Already established? <a href="/auth/login">Access Terminal</a>
		</p>
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		position: relative;
	}

	.auth-page::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(0, 230, 118, 0.02) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 230, 118, 0.02) 1px, transparent 1px);
		background-size: 40px 40px;
		mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, black, transparent);
	}

	.auth-container {
		width: 100%;
		max-width: 380px;
		z-index: 1;
	}

	.auth-brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 700;
		font-size: 0.9rem;
		letter-spacing: 0.2em;
		color: var(--accent);
		text-decoration: none;
		margin-bottom: 2rem;
	}

	.brand-glyph {
		font-size: 1.4rem;
		text-shadow: 0 0 16px var(--accent-dim);
	}

	.auth-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.auth-subtitle {
		font-size: 0.8rem;
		color: var(--text-dim);
		margin-bottom: 1.5rem;
	}

	.auth-submit {
		width: 100%;
		justify-content: center;
		margin-top: 0.5rem;
	}

	.auth-switch {
		margin-top: 1.5rem;
		font-size: 0.8rem;
		color: var(--text-dim);
		text-align: center;
	}
</style>
