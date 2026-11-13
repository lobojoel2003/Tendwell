---
title: Ask a credit bureau to add a deceased alert
summary: >-
  Ask Equifax, Experian or TransUnion to mark the credit file so no new credit can be opened in their
  name, and request a copy of their credit report.
order: 30
regions: [us]
recipient: Equifax, Experian or TransUnion (send one letter to each)
subject: 'Request for a deceased alert: {{deceased_name}}'
fields:
  - sender_name
  - sender_address
  - sender_email
  - sender_phone
  - relationship
  - id: recipient_name
    label: Credit bureau
    required: true
    placeholder: Equifax, Experian or TransUnion
  - id: recipient_address
    label: Credit bureau's mailing address
    type: textarea
    help: >-
      Each bureau lists an address for deceased notifications on its website. Search for "report
      a death" on their site.
  - deceased_name
  - id: deceased_former_names
    label: Other names they used
    help: For example a maiden name. Leave blank if none.
  - id: deceased_dob
    label: Their date of birth
    type: date
    required: true
  - date_of_death
  - id: deceased_ssn
    label: Their Social Security number
    required: true
    help: The bureau needs this to find the right credit file.
  - deceased_address
enclosures:
  - A copy of the death certificate
  - A copy of the court document naming me executor or administrator, or proof of my relationship to them
---

Dear Sir or Madam,

I am writing to tell you that {{deceased_name}} died on {{date_of_death}}. I am their {{relationship}}.

Name: {{deceased_name}}
{{#if deceased_former_names}}Other names used: {{deceased_former_names}}
{{/if}}Date of birth: {{deceased_dob}}
Date of death: {{date_of_death}}
Social Security number: {{deceased_ssn}}
{{#if deceased_address}}Last address:
{{deceased_address}}{{/if}}

Please add a deceased alert to their credit file, noting "Deceased – do not issue credit", so that no new credit can be opened in their name.

I would also like to request a copy of their credit report, so that I can make sure all of their accounts are known and closed. Please send it to me at the address above.

I have enclosed a copy of the death certificate and a document showing my authority to act for their estate, or my relationship to them.

Thank you for your help.

Sincerely,

{{sender_name}}
