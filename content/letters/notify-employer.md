---
title: Tell their employer
summary: >-
  Let their workplace know about the death and ask, in writing, about final pay, life insurance,
  retirement plans and health coverage for the family.
order: 60
regions: [us]
recipient: The human resources (HR) team at their workplace
subject: 'Death of an employee: {{deceased_name}}'
fields:
  - sender_name
  - sender_address
  - sender_email
  - sender_phone
  - relationship
  - id: recipient_name
    label: Employer's name
    required: true
  - recipient_address
  - deceased_name
  - date_of_death
  - id: employee_id
    label: Employee or payroll number
    help: Often on a pay stub. Leave blank if you don't know it.
enclosures: []
---

Dear Human Resources Team,

I am writing to let you know that {{deceased_name}}, who worked for {{recipient_name}}, died on {{date_of_death}}. I am their {{relationship}}.

{{#if employee_id}}Their employee number was {{employee_id}}.{{/if}}

I would be grateful if you could send me information about:

1. any final pay owed, including unused vacation pay, commissions or bonuses
2. any life insurance or accidental death benefits through work, and who is named as beneficiary
3. any retirement plan, such as a 401(k), 403(b) or pension, and how beneficiaries can make a claim
4. health insurance for family members who were covered by their plan, including COBRA
5. any other benefits the family may be entitled to

Please also let me know how we can collect any of their belongings from the workplace.

Thank you for your help at this time.

Sincerely,

{{sender_name}}
