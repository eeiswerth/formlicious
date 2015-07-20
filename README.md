# formlicious

#### Simple Bootstrap forms for Meteor

Currently formlicious is no more than a prototype. I haven't written tests yet.  But a demo application that uses the
package can be found here: [meteor-formlicious-demo] (https://github.com/eeiswerth/meteor-formlicious-demo)

#### Configuration Options

`fields`: Array - **required** The array of form element objects the controls what form elements are rendered. See below.
`buttons`: Array - (recommended) The array of button objects that allow you to handle use interaction with the form.
`data`: Object - (optional) If provided, must contain property names that bind to the name property in the field objects
        that are provided via the fields property. See field definitions below for more detail.
`orientation`: String - (optional) [vertical | horizontal] Controls how the form lays out.  Will the labels appear
               above the input element or inline. Default is "vertical".

##### field
Controls the form input elements that get rendered.

`name`: String - **required** The name of the field. This will NOT be visible in the UI. This property is used for
        binding a data object with a form element. See the example below for more details.
`type`: String - **required** [input, textarea, date, credit-card, credit-card-expiration, checkbox, checkbox-group,
        radio, radio-group]

Type                   | Description
---------------------- | -----------------------------------------------------------------------------------
input                  | A text input element.
textarea               | An enhanced textarea input element that provides a char counter showing the number  of characters remaining. This is only shown if maxlength is set on the field.
date                   | A date selector.
credit-card            | A convenience type that provides simple styling on type of the input element.
credit-card-expiration | Two horizontal select elements that provide month and year selection.
checkbox               | A single checkbox with a label to the right of the checkbox.
checkbox-group         | A stack of vertical checkboxes.
radio                  | A single radio button with a label to the right of the radio button.
radio-group            | A stack of vertical radio buttons.

        For more detail on the types and what options affect their presentation and data binding. See below.
`title`: String - (recommended) The text that is displayed along with the form element. See the demo.
`required`: Boolean - (optional) Set this to true to force validation on the field. If not validator is provided, the
            default is to validate that the input is not empty.
`maxlength`: Integer - (optional) If provided, limits the number of characters that can be typed into the input. For the
             textarea type, this also provides a visual indicator beneath the textarea that shows how many characters
             remain.
`validator`: Function - (optional) A function that validates the input. The function will be called with the following
             arguments.
             ```
             function(field /* The field config object */, input /* The raw user input */) {
                // do some validation...
             }
             ```

             Formlicious provides some validators for your convenience. See below for more details.

##### button

#### Types
Under construction

#### Validators
Under construction

#### Example

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
					validator: Formlicious.validators.stringValidator
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
