<script lang="ts">
	let scrollY = $state(0);
</script>

<svelte:window bind:scrollY={scrollY} />

<div class="landing">
	<!-- ═══ HERO ═══ -->
	<section class="hero">
		<div class="hero-grid"></div>
		<div class="hero-content">
			<div class="brand-mark">
				<span class="brand-glyph">&#9653;</span>
				<span class="brand-text">HERALD</span>
			</div>
			<h1 class="hero-title">Email Without Borders</h1>
			<p class="hero-tagline">Transactional email. EU sovereign. Developer-first.</p>
			<div class="hero-actions">
				<a href="/auth/register" class="btn btn-primary">Initialize Relay</a>
				<a href="#protocol" class="btn btn-secondary">Read Protocol</a>
			</div>
		</div>

		<div class="hero-terminal">
			<div class="terminal-bar">
				<span class="terminal-dot"></span>
				<span class="terminal-dot"></span>
				<span class="terminal-dot"></span>
				<span class="terminal-title">terminal</span>
			</div>
			<div class="code-block">
				<code>
					<span class="code-comment"># Send your first email</span>{'\n'}
					<span class="code-keyword">curl</span> -X POST https://herald.eurostack.eu/api/v1/send \{'\n'}
					{'  '}-H <span class="code-string">"X-API-Key: hk_your_key"</span> \{'\n'}
					{'  '}-d <span class="code-string">'{'"from":"noreply@yourapp.eu","to":"user@example.com","subject":"Welcome","html_body":"<h1>Welcome!</h1>"'}'</span>
				</code>
			</div>
		</div>
	</section>

	<!-- ═══ FEATURES ═══ -->
	<section class="features" id="features">
		<h2 class="section-heading">Capabilities</h2>
		<div class="features-grid">
			<div class="feature-card card">
				<div class="feature-icon">&#9889;</div>
				<h3>Instant Delivery</h3>
				<p>Sub-second email dispatch through EU-native SMTP infrastructure. No transatlantic hops.</p>
			</div>
			<div class="feature-card card">
				<div class="feature-icon">&#9638;</div>
				<h3>Template Engine</h3>
				<p>Handlebars-compatible templates with version control. Variables auto-detected from markup.</p>
			</div>
			<div class="feature-card card">
				<div class="feature-icon">&#9670;</div>
				<h3>Domain Auth</h3>
				<p>DKIM, SPF, and domain verification. Automated DNS record generation. One-click setup.</p>
			</div>
			<div class="feature-card card">
				<div class="feature-icon">&#9651;</div>
				<h3>Bounce Handling</h3>
				<p>Automatic suppression lists. Hard bounces quarantined. Reputation protected by default.</p>
			</div>
			<div class="feature-card card">
				<div class="feature-icon">&#9678;</div>
				<h3>Delivery Analytics</h3>
				<p>Real-time delivery, open, and click tracking. Per-message event timeline. Webhook feeds.</p>
			</div>
			<div class="feature-card card">
				<div class="feature-icon">&#9733;</div>
				<h3>EU Sovereign</h3>
				<p>Zero US Cloud Act exposure. GDPR native. All data stored and processed within EU borders.</p>
			</div>
		</div>
	</section>

	<!-- ═══ PROTOCOL ═══ -->
	<section class="protocol" id="protocol">
		<h2 class="section-heading">Protocol</h2>
		<div class="protocol-steps">
			<div class="protocol-step">
				<div class="step-number">01</div>
				<div class="step-content">
					<h3>Verify Domain</h3>
					<p>Add your sending domain. We generate DKIM and SPF records. Add them to your DNS. Verification is automatic.</p>
				</div>
			</div>
			<div class="protocol-step">
				<div class="step-number">02</div>
				<div class="step-content">
					<h3>Generate Key</h3>
					<p>Create an API key from your dashboard. Keys are SHA-256 hashed at rest. Prefix-only display after creation.</p>
				</div>
			</div>
			<div class="protocol-step">
				<div class="step-number">03</div>
				<div class="step-content">
					<h3>Send Email</h3>
					<p>POST to /api/v1/send with your key. Raw HTML or template-based. Batch endpoint available for bulk.</p>
				</div>
			</div>
			<div class="protocol-step">
				<div class="step-number">04</div>
				<div class="step-content">
					<h3>Track Delivery</h3>
					<p>Monitor delivery status in real-time. Webhook notifications for bounces, opens, and clicks. Full event timeline per message.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══ PRICING ═══ -->
	<section class="pricing" id="pricing">
		<h2 class="section-heading">Pricing</h2>
		<div class="pricing-grid">
			<div class="pricing-card card">
				<div class="pricing-tier">Observer</div>
				<div class="pricing-price">&euro;0<span class="pricing-period">/mo</span></div>
				<ul class="pricing-features">
					<li>1,000 emails/month</li>
					<li>1 verified domain</li>
					<li>Basic analytics</li>
					<li>API access</li>
					<li>EU data residency</li>
				</ul>
				<a href="/auth/register" class="btn btn-secondary" style="width:100%;justify-content:center;">Start Free</a>
			</div>
			<div class="pricing-card card pricing-featured">
				<div class="pricing-tier">Operator</div>
				<div class="pricing-price">&euro;19<span class="pricing-period">/mo</span></div>
				<ul class="pricing-features">
					<li>50,000 emails/month</li>
					<li>5 verified domains</li>
					<li>Template engine</li>
					<li>Webhook integrations</li>
					<li>Priority delivery</li>
					<li>Full analytics</li>
				</ul>
				<a href="/auth/register" class="btn btn-primary" style="width:100%;justify-content:center;">Deploy</a>
			</div>
			<div class="pricing-card card">
				<div class="pricing-tier">Enterprise</div>
				<div class="pricing-price">&euro;79<span class="pricing-period">/mo</span></div>
				<ul class="pricing-features">
					<li>500,000 emails/month</li>
					<li>Unlimited domains</li>
					<li>Admin dashboard</li>
					<li>Dedicated IP pool</li>
					<li>SSO / SAML</li>
					<li>SLA guarantee</li>
				</ul>
				<a href="/auth/register" class="btn btn-secondary" style="width:100%;justify-content:center;">Contact</a>
			</div>
		</div>
	</section>

	<!-- ═══ FOOTER ═══ -->
	<footer class="landing-footer">
		<div class="footer-content">
			<div class="footer-brand">
				<span class="brand-glyph">&#9653;</span> HERALD <span class="text-dim">by</span> EUROSTACK
			</div>
			<div class="footer-sovereignty">
				<span class="badge badge-green">EU Sovereign</span>
				<span class="footer-compliance">GDPR &middot; Schrems II &middot; NIS2 &middot; ePrivacy</span>
			</div>
			<div class="footer-links">
				<a href="/api/v1/sovereignty">Sovereignty Manifest</a>
				<a href="/auth/login">Login</a>
				<a href="/auth/register">Register</a>
			</div>
		</div>
		<div class="footer-line">
			<span class="text-dim">&copy; 2026 EUROSTACK. All data processed within EU jurisdiction.</span>
		</div>
	</footer>
</div>

<style>
	.landing {
		min-height: 100vh;
	}

	/* ─── Hero ─────────────────────────────────────────────── */
	.hero {
		position: relative;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		overflow: hidden;
	}

	.hero-grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(0, 230, 118, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 230, 118, 0.03) 1px, transparent 1px);
		background-size: 60px 60px;
		mask-image: radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent);
	}

	.hero-content {
		text-align: center;
		z-index: 1;
		margin-bottom: 3rem;
	}

	.brand-mark {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.brand-glyph {
		font-size: 2rem;
		color: var(--accent);
		text-shadow: 0 0 20px var(--accent-dim);
	}

	.brand-text {
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: 0.3em;
		color: var(--accent);
		text-shadow: 0 0 20px var(--accent-dim);
	}

	.hero-title {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 800;
		color: var(--text-primary);
		margin-bottom: 0.75rem;
		letter-spacing: -0.02em;
	}

	.hero-tagline {
		font-size: 1rem;
		color: var(--text-secondary);
		max-width: 500px;
		margin: 0 auto 2rem;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.hero-terminal {
		z-index: 1;
		width: 100%;
		max-width: 700px;
	}

	.terminal-bar {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.75rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-bottom: none;
		border-radius: var(--radius) var(--radius) 0 0;
	}

	.terminal-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--text-dim);
	}

	.terminal-title {
		font-size: 0.7rem;
		color: var(--text-dim);
		margin-left: 0.5rem;
	}

	.hero-terminal .code-block {
		border-top: none;
		border-radius: 0 0 var(--radius) var(--radius);
		white-space: pre;
	}

	/* ─── Section Heading ──────────────────────────────────── */
	.section-heading {
		text-align: center;
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.15em;
		margin-bottom: 2.5rem;
		text-shadow: 0 0 12px var(--accent-dim);
	}

	.section-heading::before {
		content: '[ ';
		color: var(--text-dim);
	}

	.section-heading::after {
		content: ' ]';
		color: var(--text-dim);
	}

	/* ─── Features ─────────────────────────────────────────── */
	.features {
		padding: 5rem 2rem;
		max-width: 1100px;
		margin: 0 auto;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.25rem;
	}

	.feature-card {
		text-align: center;
		padding: 2rem 1.5rem;
	}

	.feature-icon {
		font-size: 1.75rem;
		color: var(--accent);
		margin-bottom: 0.75rem;
		text-shadow: 0 0 16px var(--accent-dim);
	}

	.feature-card h3 {
		font-size: 0.9rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}

	.feature-card p {
		font-size: 0.8rem;
		color: var(--text-secondary);
		line-height: 1.7;
	}

	/* ─── Protocol ─────────────────────────────────────────── */
	.protocol {
		padding: 5rem 2rem;
		max-width: 700px;
		margin: 0 auto;
	}

	.protocol-steps {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.protocol-step {
		display: flex;
		gap: 1.5rem;
		padding: 1.5rem 0;
		border-bottom: 1px solid var(--border);
	}

	.protocol-step:last-child {
		border-bottom: none;
	}

	.step-number {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--accent);
		text-shadow: 0 0 16px var(--accent-dim);
		min-width: 3rem;
		line-height: 1;
		padding-top: 0.2rem;
	}

	.step-content h3 {
		font-size: 0.9rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 0.35rem;
	}

	.step-content p {
		font-size: 0.8rem;
		color: var(--text-secondary);
		line-height: 1.7;
	}

	/* ─── Pricing ──────────────────────────────────────────── */
	.pricing {
		padding: 5rem 2rem;
		max-width: 1000px;
		margin: 0 auto;
	}

	.pricing-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1.25rem;
		align-items: start;
	}

	.pricing-card {
		padding: 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.pricing-featured {
		border-color: var(--accent);
		box-shadow: 0 0 24px var(--accent-dim);
	}

	.pricing-tier {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-secondary);
	}

	.pricing-price {
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--accent);
		text-shadow: 0 0 16px var(--accent-dim);
	}

	.pricing-period {
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--text-dim);
	}

	.pricing-features {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.pricing-features li {
		font-size: 0.8rem;
		color: var(--text-secondary);
		padding-left: 1.25rem;
		position: relative;
	}

	.pricing-features li::before {
		content: '+';
		position: absolute;
		left: 0;
		color: var(--accent);
		font-weight: 700;
	}

	/* ─── Footer ───────────────────────────────────────────── */
	.landing-footer {
		border-top: 1px solid var(--border);
		padding: 2.5rem 2rem 1.5rem;
		max-width: 1100px;
		margin: 0 auto;
	}

	.footer-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.footer-brand {
		font-weight: 700;
		font-size: 0.9rem;
		letter-spacing: 0.1em;
	}

	.footer-sovereignty {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.footer-compliance {
		font-size: 0.7rem;
		color: var(--text-dim);
	}

	.footer-links {
		display: flex;
		gap: 1.25rem;
		font-size: 0.8rem;
	}

	.footer-line {
		text-align: center;
		font-size: 0.7rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
</style>
