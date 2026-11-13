---
title: Tell a bank or credit union
summary: >-
  Let a bank know about the death, ask them to protect the accounts, and ask what they need from
  you next.
order: 10
regions: [all]
recipient: The bereavement or estates team at the bank
subject: 'Notification of death: {{deceased_name}}'
fields:
  - sender_name
  - sender_address
  - sender_email
  - sender_phone
  - relationship
  - id: recipient_name
    label: Bank or credit union name
    required: true
  - recipient_address
  - deceased_name
  - deceased_dob
  - deceased_address
  - date_of_death
  - account_number
  - id: executor_details
    label: Executor's name and contact details
    type: textarea
    help: >-
      If an executor or administrator has been appointed and it isn't you. Leave this blank if you
      don't know yet.
enclosures:
  - A copy of the death certificate
---

Dear Bereavement Team,

I am writing to let you know that {{deceased_name}}, a customer of {{recipient_name}}, died on {{date_of_death}}. I am their {{relationship}}.

Name: {{deceased_name}}
{{#if deceased_dob}}Date of birth: {{deceased_dob}}
{{/if}}Date of death: {{date_of_death}}
{{#if account_number}}Account number: {{account_number}}
{{/if}}{{#if deceased_address}}Address:
{{deceased_address}}{{/if}}

Could you please:

1. protect any accounts held only in their name
2. stop any regular payments that are no longer needed, and tell me about any that may need to continue
3. tell me the balance of each account on the date of death
4. let me know what you need from me, or from the executor, to deal with the accounts

{{#if executor_details}}The executor of the estate is:
{{executor_details}}{{/if}}

I have enclosed a copy of the death certificate. Please send any letters to me at the address above{{#if sender_email}}, or email me at {{sender_email}}{{/if}}.

Thank you for your help at this difficult time.

Sincerely,

{{sender_name}}
