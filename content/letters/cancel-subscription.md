---
title: Cancel a subscription or membership
summary: >-
  Ask a company to cancel a subscription, stop the payments and refund any time paid for after the
  death.
order: 20
regions: [all]
recipient: The customer service team at the company
subject: 'Please cancel the subscription of {{deceased_name}}, who has died'
fields:
  - sender_name
  - sender_address
  - sender_email
  - sender_phone
  - relationship
  - id: recipient_name
    label: Company name
    required: true
  - recipient_address
  - deceased_name
  - date_of_death
  - account_number
  - id: account_email
    label: Email address on their account
    type: email
    help: Many online services find accounts by email address. Leave blank if you don't know it.
  - id: service_name
    label: What the subscription is
    placeholder: 'monthly magazine, gym membership, streaming plan…'
enclosures: []
---

Dear Customer Service Team,

I am writing to let you know that {{deceased_name}} died on {{date_of_death}}. I am their {{relationship}}, and I would like to cancel their {{#if service_name}}{{service_name}}{{/if}}{{#unless service_name}}subscription{{/unless}} with {{recipient_name}}.

{{#if account_number}}Account or membership number: {{account_number}}
{{/if}}{{#if account_email}}Email address on the account: {{account_email}}{{/if}}

Could you please:

1. cancel the subscription and stop all further payments
2. refund any payments for time after {{date_of_death}}, if possible
3. confirm in writing that the account has been closed

If you need a copy of the death certificate or anything else from me, please let me know{{#if sender_email}} at {{sender_email}}{{/if}}.

Thank you for your help.

Sincerely,

{{sender_name}}
