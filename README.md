# formlicious

#### Simple Bootstrap forms for Meteor

HTML:
```
<template name="myForm">
	{{> formlicious options=myOptions}}
</template>
```

JavaScript:
```
Template.myForm.helpers({
	myOptions: function() {
		return {
			orientation: 'vertical', // Optional - vertical by default. Can be horizontal as well.
			fields: [
				{
					name: 'field1',
					title: 'My textarea',
					type: 'textarea',
					maxlength: 500,
					validators: Formlicious.validators.stringValidator
				},
				{
				   	name: 'field2',
				   	title: 'My input field',
				   	type: 'input',
				   	required: true,
				   	maxlength: 5
			   	},
			   	{
				   	name: 'field3',
				   	title: 'My date',
				   	type: 'date'
			   	},
			   	{
				   	name: 'field3',
				   	title: 'Credit Card',
				   	type: 'credit-card',
				   	validator: Formlicious.validators.creditCardValidator
			   	},
			   	{
				   	name: 'field4',
				   	title: "Credit Card Expiration",
				   	type: 'credit-card-expiration',
				   	validator: Formlicious.validators.creditCardExpirationValidator
			   	}
			],
			buttons: [
			   	{
				   	text: 'Cancel',
				   	classes: 'btn-danger',
				   	callback: function(valid, data) {
					   	// Do something...
				   	}
			   	},
			   	{
				   	text: 'Save',
				   	classes: 'btn-primary',
				   	type: 'submit',
				   	callback: function(valid, data) {
					   	// Do something...
				   	}
			   	}
		   ]
		}
	}
});
```
