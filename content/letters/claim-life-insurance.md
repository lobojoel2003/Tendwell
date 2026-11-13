---
title: Start a life insurance claim
summary: >-
  Tell an insurer about the death, start a claim on a life insurance policy and ask for the claim
  form.
order: 70
regions: [us]
recipient: The claims department at the insurance company
subject: 'Life insurance claim: {{deceased_name}}'
fields:
  - sender_name
  - sender_address
  - sender_email
  - sender_phone
  - relationship
  - id: recipient_name
    label: Insurance company
    required: true
  - recipient_address
  - deceased_name
  - deceased_dob
  - date_of_death
  - id: policy_number
    label: Policy number
    help: On the policy papers or a premium notice. Leave blank if you don't know it.
  - id: beneficiary_name
    label: Who is named as beneficiary, if you know
    help: Often this is you. Leave blank if you're not sure.
enclosures:
  - A copy of the death certificate
---

Dear Claims Department,

I am writing to tell you that {{deceased_name}} died on {{date_of_death}}, and to start a claim on their life insurance policy with {{recipient_name}}. I am their {{relationship}}.

Name of insured: {{deceased_name}}
{{#if deceased_dob}}Date of birth: {{deceased_dob}}
{{/if}}Date of death: {{date_of_death}}
{{#if policy_number}}Policy number: {{policy_number}}{{/if}}

{{#unless policy_number}}I don't have the policy number. I hope the details above are enough for you to find the policy.{{/unless}}

{{#if beneficiary_name}}I understand that the named beneficiary is {{beneficiary_name}}.{{/if}}

Could you please send me a claim form, and let me know what documents you need? Please also tell me whether any premiums paid after {{date_of_death}} will be refunded.

I have enclosed a copy of the death certificate.

Thank you for your help.

Sincerely,

{{sender_name}}
