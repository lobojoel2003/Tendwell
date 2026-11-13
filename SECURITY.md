# Security policy

Tendwell holds sensitive information about families at a difficult time, so we take security
seriously.

## Reporting a problem

Please **don't open a public issue**. Instead, report it privately through
[GitHub security advisories](https://github.com/lobojoel2003/Tendwell/security/advisories/new).

Include what you found, how to reproduce it, and what an attacker could do with it. We'll
acknowledge your report within a few days and keep you updated until it's fixed. We're happy to
credit you in the release notes.

## Supported versions

Security fixes go into the latest release. If you run your own Tendwell server, please keep it up
to date (`docker compose pull && docker compose up -d`).

## How Tendwell protects data

- Passwords are hashed with scrypt; session and invite tokens are stored only as SHA-256 hashes.
- Sign-in and sign-up are rate limited.
- Cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` over HTTPS.
- A strict Content Security Policy allows only Tendwell's own scripts; there are no third-party
  scripts, trackers or analytics.
- Forms are protected against cross-site request forgery.
- Letter details are used to make the PDF and are never stored or logged.
- People can delete their account, and plans only they belong to, at any time.

If you host Tendwell, serve it over HTTPS, set `ORIGIN` to its public address, and back up the
`/data` volume.
