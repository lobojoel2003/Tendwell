# Changelog

All notable changes to Tendwell are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and Tendwell uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-11-13

The first release: a gentle, free, open-source guide for families after a death.

### Added

- **This week**: a plan shows “for now, just these three things”, chosen from the earliest open
  steps, with real deadlines (and only those) brought forward calmly.
- **A gentle pace**: set any step aside with “not this week”; it rests for seven days and comes back.
- **Shared plans**: invite siblings, a partner or friends with a private 14-day link. Anyone can say
  “I’ll take this”, leave notes for each other, and see what others are handling.
- **The checklist**: 40 steps for the United States across four stages, from the first days to
  “when you’re ready”, tailored by ten optional questions. Readable without an account.
- **Guides**: nine plain-word guides, from “If someone has just died” to probate, benefits, debts,
  digital accounts, sharing the work and looking after yourself.
- **Letters**: eight letter templates (banks, credit bureaus, utilities, subscriptions, landlords,
  employers, life insurance and a general one) with a live preview, PDF download, print and
  “copy as text”. Nothing typed into a letter is stored.
- **Accounts list**: track bank accounts, bills and subscriptions from “still to contact” to
  “closed”, with a matching letter for each.
- Content as Markdown and YAML in `content/`, validated on every build, so volunteers can improve it
  with a pull request.
- Accounts with scrypt-hashed passwords, hashed session and invite tokens, rate-limited sign-in,
  a strict Content Security Policy, and self-service account deletion.
- Works without JavaScript, follows light and dark mode, prints cleanly, and is usable on phones.
- `/healthz` endpoint reporting version, build number, commit and database status.
- Docker image for `linux/amd64` and `linux/arm64`, published to GitHub Container Registry, and a
  `docker-compose.yml` for self-hosting.
- CI with linting, type checks, content validation, unit and end-to-end tests, a Docker smoke test
  and CodeQL; tagged releases build the bundle, the image and the release notes automatically.

[Unreleased]: https://github.com/lobojoel2003/Tendwell/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/lobojoel2003/Tendwell/releases/tag/v1.0.0
