<script lang="ts">
	import { buildInfo } from '#lib/build-info.js';
</script>

<svelte:head>
	<title>About · Tendwell</title>
	<meta
		name="description"
		content="Why Tendwell exists, how it handles your information, and how to help improve it."
	/>
</svelte:head>

<article class="narrow prose">
	<p class="eyebrow">About</p>
	<h1>Why Tendwell exists</h1>
	<p class="lede">
		When someone dies, the people who loved them are handed a job nobody trains for: dozens of
		calls, forms and letters, often while grieving and exhausted.
	</p>
	<p>
		Families can spend hundreds of hours over many months on this paperwork. The best-known tools
		are paid, or only available through an employer or insurer. Tendwell is free, open source, and
		made to be gentle: it shows only what matters this week, uses no false urgency, and lets family
		share the load.
	</p>

	<h2 id="principles">What we promise</h2>
	<ul>
		<li>
			<strong>A gentle pace.</strong> Three things at a time. “Not this week” is always an option.
		</li>
		<li><strong>Honest urgency.</strong> Only real deadlines are marked, and calmly.</li>
		<li><strong>Plain words.</strong> No jargon without an explanation.</li>
		<li><strong>No account to read.</strong> Every guide, step and letter is open to everyone.</li>
		<li><strong>Free, always.</strong> No ads, no upsells, no selling of data.</li>
	</ul>

	<h2 id="privacy">Your information</h2>
	<p>
		Reading guides and writing letters needs no account, and the details you type into a letter are
		used to make the PDF and then forgotten. They are not stored.
	</p>
	<p>
		If you start a plan, we store your name, email, a securely hashed password, and what you add to
		the plan: the person’s name, steps you tick off, notes and the accounts list. Only people in the
		plan can see it. We don’t use tracking, analytics or third-party scripts. You can delete your
		account at any time from <a href="/account">your account page</a>.
	</p>
	<p>
		Please don’t store full account or card numbers. The last four digits are enough to tell
		accounts apart.
	</p>

	<h2 id="advice">Not legal or financial advice</h2>
	<p>
		Tendwell gives general information that is true for many people in the United States. Rules vary
		by state and by situation. For an estate with property, debts, disagreements or a business, it’s
		worth speaking with a probate lawyer or an accountant.
	</p>

	<h2 id="contribute">Help improve the guides</h2>
	<p>
		Every guide, step and letter is a plain text file in the
		<a href="https://github.com/lobojoel2003/Tendwell/tree/main/content" rel="noopener noreferrer"
			>content folder</a
		>
		of the project. If something is wrong, out of date or unkind, anyone can suggest a fix. You don’t
		need to be a programmer, and you can also
		<a href="https://github.com/lobojoel2003/Tendwell/issues/new/choose" rel="noopener noreferrer"
			>open an issue</a
		>
		in plain words.
	</p>

	<h2 id="license">Licenses</h2>
	<p>
		The software is licensed under the
		<a href="https://www.gnu.org/licenses/agpl-3.0.html" rel="noopener noreferrer"
			>GNU Affero General Public License v3.0</a
		>. The guides, checklist and letter templates are licensed under
		<a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="noopener noreferrer"
			>Creative Commons Attribution-ShareAlike 4.0</a
		>, so you are free to share and adapt them, as long as you credit Tendwell and share alike.
	</p>

	<p class="small muted">
		Version {buildInfo.version} · build {buildInfo.number} · commit
		<a
			href="https://github.com/lobojoel2003/Tendwell/commit/{buildInfo.commit}"
			rel="noopener noreferrer"><code>{buildInfo.commit}</code></a
		>
	</p>
</article>
