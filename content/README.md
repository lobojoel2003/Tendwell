# Tendwell content

Everything a family reads in Tendwell lives in this folder: the checklist steps, the guides and
the letter templates. It's all plain Markdown and YAML, so you can fix a typo, update a fact or
add a whole new step with a pull request. You don't need to know how to program.

Thank you for helping. Every correction makes a hard time a little easier for someone.

## Folder layout

```
content/
  regions.yaml      places Tendwell has guidance for
  phases.yaml       the stages of the plan (first days, first weeks…)
  questions.yaml    optional questions that tailor a family's plan
  tasks/            one checklist step per file
  guides/           longer articles, one per file
  letters/          letter templates people can fill in and download as a PDF
  LICENSE           CC BY-SA 4.0
```

A file's name becomes its id and its web address. `tasks/order-death-certificates.md` becomes
the step `order-death-certificates`, and `guides/start-here.md` is shown at `/guides/start-here`.
Use lowercase words joined by hyphens.

> **Please don't rename existing files.** Families' plans remember which steps they've finished by
> these ids. Renaming a task file makes the step look unfinished again.

## How each file is built

Every Markdown file starts with _front matter_: a few settings between two `---` lines, written
in YAML. The text below the second `---` is ordinary Markdown.

### Checklist steps (`tasks/*.md`)

```markdown
---
title: Order copies of the death certificate
phase: first-days
order: 30
summary: >-
  Almost every bank, insurer and agency will ask for a certified copy. Ordering several now saves
  waiting later.
time_sensitive: >-
  Only for real deadlines. A calm sentence with the actual time limit.
effort: minutes
often_done_by: Usually arranged through the funeral home
applies_if:
  married: 'yes'
regions: [us]
guides: [death-certificates]
letters: [notify-bank]
links:
  - title: Where to write for vital records (CDC)
    url: https://www.cdc.gov/nchs/w2w/index.htm
---

A short, gentle introduction, then concrete numbered steps.
```

| Field            | Required | What it does                                                                                                                                                                                                        |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`          | yes      | A short, kind instruction, 5–80 characters. Start with a verb: "Tell their bank", "Look after yourself, too".                                                                                                       |
| `phase`          | yes      | One of the ids in `phases.yaml`: `first-days`, `first-weeks`, `first-months` or `later`.                                                                                                                            |
| `order`          | yes      | Position within the phase. Lower comes first. Use steps of 10 (10, 20, 30…) so new steps can slot in between. Two steps in the same phase can't share a number.                                                     |
| `summary`        | yes      | One or two sentences (20–320 characters) shown on the step's card.                                                                                                                                                  |
| `time_sensitive` | no       | **Only for a real deadline**, such as the 60-day COBRA window. Write it as a calm, factual sentence that names the time limit. The check allows it on no more than about a third of steps, so it keeps its meaning. |
| `effort`         | no       | Roughly how long it takes: `minutes`, `hour`, `hours` or `weeks`.                                                                                                                                                   |
| `often_done_by`  | no       | Who usually does this, such as "The executor" or "Usually the funeral home".                                                                                                                                        |
| `applies_if`     | no       | Hides the step when a family answers a question the other way. See [Tailoring the plan](#tailoring-the-plan).                                                                                                       |
| `regions`        | no       | Where the step applies: `[all]` (the default) or region ids like `[us]`.                                                                                                                                            |
| `guides`         | no       | Guides to suggest alongside this step, by file name without `.md`.                                                                                                                                                  |
| `letters`        | no       | Letter templates that help with this step, by file name without `.md`.                                                                                                                                              |
| `links`          | no       | Helpful official pages, each with a `title` and an `https://` `url`.                                                                                                                                                |

### Guides (`guides/*.md`)

```markdown
---
title: Death certificates, in plain words
summary: What a death certificate is, how many copies you might need, and who will ask for one.
order: 20
regions: [us]
reviewed: 2026-11-01
links:
  - title: Where to write for vital records (CDC)
    url: https://www.cdc.gov/nchs/w2w/index.htm
---

The guide itself, using `##` for section headings.
```

| Field      | Required | What it does                                                                                  |
| ---------- | -------- | --------------------------------------------------------------------------------------------- |
| `title`    | yes      | 5–90 characters. The page heading, so don't repeat it as a `#` heading in the text.           |
| `summary`  | yes      | One or two sentences shown in the list of guides.                                             |
| `order`    | yes      | Position in the list of guides. Lower comes first.                                            |
| `regions`  | no       | `[all]` (the default) or region ids like `[us]`.                                              |
| `reviewed` | yes      | The date someone last checked the facts, like `2026-11-01`. Please update it when you review. |
| `links`    | no       | Official pages for further reading, each with a `title` and an `https://` `url`.              |

Guides are usually 500–1,000 words. Use `##` headings, short paragraphs and lists, so people can
find their place again after a break.

### Letters (`letters/*.md`)

```markdown
---
title: Tell a bank or credit union
summary: Let a bank know about the death and ask what they need from you next.
order: 10
regions: [all]
recipient: The bereavement or estates team at the bank
subject: 'Notification of death: {{deceased_name}}'
fields:
  - sender_name
  - relationship
  - deceased_name
  - date_of_death
  - account_number
  - id: executor_details
    label: Executor's name and contact details
    type: textarea
    required: false
    help: Leave this blank if you don't know yet.
    placeholder: Jane Doe, 12 Elm Street…
enclosures:
  - A copy of the death certificate
---

Dear Bereavement Team,

I am writing to let you know that {{deceased_name}} died on {{date_of_death}}. I am their {{relationship}}.

{{#if account_number}}Account number: {{account_number}}{{/if}}

Sincerely,

{{sender_name}}
```

| Field        | Required | What it does                                                                                   |
| ------------ | -------- | ---------------------------------------------------------------------------------------------- |
| `title`      | yes      | What the letter is for, 5–90 characters.                                                       |
| `summary`    | yes      | One or two sentences shown in the list of letters.                                             |
| `order`      | yes      | Position in the list of letters.                                                               |
| `regions`    | no       | `[all]` (the default) or region ids like `[us]`.                                               |
| `recipient`  | yes      | Who the letter goes to, in plain words.                                                        |
| `subject`    | yes      | The subject line. It can use `{{placeholders}}`. Put it in quotes.                             |
| `fields`     | yes      | The boxes people fill in. Either the id of a shared field, or a field of your own (see below). |
| `enclosures` | no       | Things to send with the letter, listed under "Enclosures" at the bottom.                       |

**Shared fields** have a ready-made label and help text. List them by id:

`sender_name`, `sender_address`, `sender_email`, `sender_phone`, `relationship`,
`deceased_name`, `deceased_address`, `deceased_dob`, `date_of_death`, `recipient_name`,
`recipient_address`, `account_number`.

You can also use a shared id with your own label, for example `id: recipient_name` with
`label: Insurance company`.

**Your own fields** need an `id` (lowercase letters, numbers and underscores) and a `label`.
They can also have a `type` (`text`, `textarea`, `date`, `email` or `tel`; the default is `text`),
`required: true`, `help` and `placeholder`.

Tendwell adds the parts every letter shares, so **don't** include them in the template: your name
and address at the top, the date, the recipient's name and address, the subject line and the list
of enclosures. Do include the greeting ("Dear Bereavement Team,") and the sign-off
("Sincerely," then `{{sender_name}}`).

#### Template syntax

| Write                                    | And you get                                        |
| ---------------------------------------- | -------------------------------------------------- |
| `{{deceased_name}}`                      | The value someone typed in that box.               |
| `{{#if account_number}}…{{/if}}`         | The text inside, only if that box was filled in.   |
| `{{#unless account_number}}…{{/unless}}` | The text inside, only if that box was left blank.  |
| `{{today}}`                              | Today's date. You don't need to list it in fields. |

- A blank line starts a new paragraph. A single line break is kept as a line break, which is
  handy for addresses and short lists.
- Every placeholder must appear in `fields`. The content check will tell you if one is missing.
- Write the letter so it still reads well when optional boxes are left blank.
- Don't put an `{{#if}}` inside another `{{#if}}`. An `{{#if}}` inside an `{{#unless}}` is fine,
  but keeping blocks side by side is simplest.

### Tailoring the plan

`questions.yaml` holds a few optional questions a family can answer when they start a plan, such as
"Did they own a home?". Each answer is `yes`, `no` or `unsure`.

A step with:

```yaml
applies_if:
  homeowner: 'yes'
```

is hidden only when the family answers **no**. If they answer "unsure", or skip the question, the
step stays in the plan. That way, no one misses something because they weren't sure.

Put `'yes'` and `'no'` in quotes. Some YAML tools read a bare `yes` as true/false.

### Phases and regions

`phases.yaml` lists the stages of the plan in order. Please talk to the maintainers in an issue
before adding or changing a phase, because it changes every family's plan.

`regions.yaml` lists the places Tendwell has guidance for. A step or guide with `regions: [all]` is
shown everywhere. One with `regions: [us]` is shown only to families in the United States.

## How we write

Tendwell is read by people on some of the hardest days of their lives. They may be exhausted,
foggy, or reading on a phone in a hospital corridor. Every sentence should make things a little
lighter.

**Plain words.** Write the way a kind, knowledgeable friend would talk. Say "the court" before
"probate court jurisdiction". If you need a technical term, explain it the first time: _probate_,
the court process that confirms who can handle the estate.

**Short sentences, short paragraphs.** One idea per sentence. Lists and numbered steps are easier
to follow than long paragraphs.

**Talk to the reader.** Use "you" and "your". Refer to the person who died as "they" or "your loved
one". Don't assume their relationship, gender or religion.

**Give permission.** Grieving people often feel they are doing it wrong. Where it's true, say so:
"It's okay to leave this until later." "It's okay to ask someone else to make this call." Many
steps end with an "It's okay…" line.

**No urgency unless it's real.** Don't use "immediately", "urgent", "must", "as soon as possible"
or "don't delay" unless there really is a deadline. If there is one, put it in `time_sensitive`,
state the actual time limit calmly, and say how it's counted. Most things after a death can wait.

**Be careful with facts.** Wrong information can cost a family money or peace of mind.

- Only state specifics, such as amounts, deadlines and phone numbers, that you have checked
  against an official source. Note the source in your pull request.
- Use "usually", "often" and "in many states" where rules differ. They often do: say "rules vary
  by state" rather than guessing.
- Prefer describing a service ("search the company's help pages for _bereavement_") over linking
  to a page that may move. Only link to official, stable `https://` pages.

**Not legal or financial advice.** Tendwell explains what usually happens and what to ask. Where
the stakes are high, such as disputes, debts, taxes and large or complicated estates, suggest
talking to a lawyer, accountant or other professional, and mention that many offer a free first
conversation.

**US English** for the US region: "color", "check", "zip code", "attorney" or "lawyer". Other
regions should use their own spelling and terms.

## Adding a region

Tendwell currently has guidance for the United States. We'd love to add more places, and the
structure is ready for it.

1. **Open an issue first** so others know you're working on it, and so we can help.
2. **Add the region** to `regions.yaml` with a short id (an ISO country code like `ca`, `gb` or
   `au` works well), a name and a one-line description.
3. **Check the `[all]` steps and guides.** They are shown everywhere. If one doesn't fit your
   region, narrow it to the regions it does fit, like `regions: [us]`.
4. **Write steps for your region** in `tasks/`, with `regions: [your-id]`. Give them names that
   say where they apply when the same idea differs between places, such as
   `notify-social-security` for the US and `tell-us-once` for the UK.
5. **Translate the ideas, not the words.** Use the official names, agencies and terms people in
   your region will recognize.
6. **Ask someone who lives there to review it,** ideally someone who has been through it.

## Checking your changes

Before you open a pull request, you can check every file in this folder with:

```bash
npm run content:check
```

If something is wrong, the message names the file and the field to fix, for example:

```
content/tasks/tell-banks.md: please fix:
  - summary: Too small: expected string to have >=20 characters
```

The same check runs automatically on every pull request, so it's fine if you can't run it
yourself. To see your changes in the app, run `npm run dev` and open the address it prints.

## License

The content in this folder (guides, checklists and letter templates) is licensed under the
[Creative Commons Attribution-ShareAlike 4.0 International License](./LICENSE) (CC BY-SA 4.0).
You're welcome to share and adapt it, including for other projects, as long as you credit Tendwell
and share your changes under the same license.

By contributing to this folder, you agree that your contribution is licensed under CC BY-SA 4.0.
The application code elsewhere in this repository is licensed separately, under the AGPL-3.0.
