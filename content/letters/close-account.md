---
title: Close any other account
summary: >-
  A general letter for any company or organization: tell them about the death, close the account and
  ask for a final statement.
order: 80
regions: [all]
recipient: The customer service team at any company or organization
subject: 'Closing the account of {{deceased_name}}, who has died'
fields:
  - sender_name
  - sender_address
  - sender_email
  - sender_phone
  - relationship
  - recipient_name
  - recipient_address
  - deceased_name
  - deceased_dob
  - date_of_death
  - account_number
  - id: account_type
    label: What kind of account it is
    placeholder: 'phone contract, store card, membership, pension…'
enclosures: []
---

Dear Customer Service Team,

I am writing to let you know that {{deceased_name}} died on {{date_of_death}}. I am their {{relationship}}.

{{#if account_type}}They held a {{account_type}} with {{recipient_name}}.{{/if}}{{#unless account_type}}They held an account with {{recipient_name}}.{{/unless}}

Name: {{deceased_name}}
{{#if deceased_dob}}Date of birth: {{deceased_dob}}
{{/if}}Date of death: {{date_of_death}}
{{#if account_number}}Account or reference number: {{account_number}}{{/if}}

Please close the account and stop any further payments. If money is owed to them, or payments were made after their death, please let me know how it can be repaid to their estate. If anything is owing, please send a final statement to me at the address above. It will be dealt with by their estate.

Please confirm in writing when the account has been closed, and let me know if you need anything else from me, such as a copy of the death certificate.

Thank you for your help.

Sincerely,

{{sender_name}}
