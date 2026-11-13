---
title: Tell their landlord
summary: >-
  Let a landlord or property manager know about the death, and open a conversation about ending the
  lease, the rent and the security deposit.
order: 50
regions: [us]
recipient: Their landlord or property manager
subject: 'Death of your tenant, {{deceased_name}}'
fields:
  - sender_name
  - sender_address
  - sender_email
  - sender_phone
  - relationship
  - id: recipient_name
    label: Landlord or property manager's name
    required: true
  - id: recipient_address
    label: Landlord's address
    type: textarea
  - deceased_name
  - date_of_death
  - id: rental_address
    label: Address of the rented home
    type: textarea
    required: true
  - id: move_out_date
    label: When you expect to return the keys
    type: date
    help: Leave blank if you don't know yet.
enclosures: []
---

Dear {{recipient_name}},

I am writing to let you know that your tenant, {{deceased_name}}, died on {{date_of_death}}. I am their {{relationship}}.

Rental address:
{{rental_address}}

I would be grateful if we could talk about ending the tenancy. I would like to understand what the lease says about ending it after a tenant's death, and what rent will be owed in the meantime. Any amount owed will be dealt with by their estate.

{{#if move_out_date}}We expect to have cleared their belongings and returned the keys by {{move_out_date}}.{{/if}}{{#unless move_out_date}}We will need a little time to clear their belongings. I will let you know as soon as I can when the keys will be returned.{{/unless}}

Please let me know how the security deposit will be returned to their estate, and whether you need anything else from me, such as a copy of the death certificate.

Thank you for your patience and understanding.

Sincerely,

{{sender_name}}
