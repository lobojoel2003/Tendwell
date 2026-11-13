import type { LetterField } from './schema';

/**
 * Fields many letters share. A letter's front matter can list these by id
 * (for example `- deceased_name`) instead of describing them again.
 */
export const sharedLetterFields: Record<string, LetterField> = {
	sender_name: {
		id: 'sender_name',
		label: 'Your full name',
		type: 'text',
		required: true
	},
	sender_address: {
		id: 'sender_address',
		label: 'Your address',
		type: 'textarea',
		required: true,
		help: 'Where they should send replies.'
	},
	sender_email: {
		id: 'sender_email',
		label: 'Your email',
		type: 'email',
		required: false
	},
	sender_phone: {
		id: 'sender_phone',
		label: 'Your phone number',
		type: 'tel',
		required: false
	},
	relationship: {
		id: 'relationship',
		label: 'Your relationship to them',
		type: 'text',
		required: true,
		placeholder: 'daughter, husband, executor…'
	},
	deceased_name: {
		id: 'deceased_name',
		label: 'Their full name',
		type: 'text',
		required: true,
		help: 'As it appears on the account, if you know it.'
	},
	deceased_address: {
		id: 'deceased_address',
		label: 'Their last address',
		type: 'textarea',
		required: false
	},
	deceased_dob: {
		id: 'deceased_dob',
		label: 'Their date of birth',
		type: 'date',
		required: false
	},
	date_of_death: {
		id: 'date_of_death',
		label: 'Date they died',
		type: 'date',
		required: true
	},
	recipient_name: {
		id: 'recipient_name',
		label: 'Organization name',
		type: 'text',
		required: true
	},
	recipient_address: {
		id: 'recipient_address',
		label: 'Organization address',
		type: 'textarea',
		required: false,
		help: 'Often on a recent statement or the “contact us” page.'
	},
	account_number: {
		id: 'account_number',
		label: 'Account or reference number',
		type: 'text',
		required: false,
		help: 'Leave blank if you don’t know it. They can usually find it with a name and address.'
	}
};

export const senderFieldIds = ['sender_name', 'sender_address', 'sender_email', 'sender_phone'];
