---
title: Tell a utility, internet or phone company
summary: >-
  Ask an electricity, gas, water, internet or phone company to transfer the account to someone
  else, or to close it and send a final bill.
order: 40
regions: [all]
recipient: The customer service team at the utility or phone company
subject: 'Death of account holder: {{deceased_name}}'
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
  - id: service_address
    label: Address where the service is supplied
    type: textarea
    help: Only if it's different from your address, or you're writing about their home.
  - id: new_account_holder
    label: Who will take over the account, if anyone
    help: >-
      If someone is staying in the home, write their full name and the account will be transferred to
      them. Leave blank to close the account.
  - id: meter_reading
    label: Latest meter reading
    help: 'Include the date you read it, for example "04512 on November 3".'
enclosures: []
---

Dear Customer Service Team,

I am writing to let you know that {{deceased_name}}, the holder of an account with {{recipient_name}}, died on {{date_of_death}}. I am their {{relationship}}.

{{#if account_number}}Account number: {{account_number}}
{{/if}}{{#if service_address}}Service address:
{{service_address}}{{/if}}

{{#if new_account_holder}}{{new_account_holder}} will continue to live at the property. Please transfer the account into their name without interrupting the service, and let me know if you need anything from them.{{/if}}{{#unless new_account_holder}}Please close the account and send a final bill to me at the address above. Any amount owing will be dealt with by their estate. If the property needs to keep a basic supply until it is sold or handed back, please let me know how to arrange this.{{/unless}}

{{#if meter_reading}}The latest meter reading is {{meter_reading}}.{{/if}}

If you need a copy of the death certificate, please let me know.

Thank you for your help.

Sincerely,

{{sender_name}}
