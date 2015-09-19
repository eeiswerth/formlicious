# formlicious

### Simple Bootstrap forms for Meteor

Currently formlicious is no more than a prototype. I haven't written tests yet.  But a demo application that uses the
package can be found here: [meteor-formlicious-demo] (https://github.com/eeiswerth/meteor-formlicious-demo)

**Note** Only use one formlicious instance per page. It is designed such that your entire form should be able to fit within one formlicious instance.

### Table of Contents
* [Configuration Options](#configuration-options)
  * [Field](#field)
  * [Button](#button)
  * [Dropzone Configuration](#dropzone-configuration)
* [Validators](#validators)
* [FormliciousAPI](#formliciousapi)
  * [Properties](#properties)
  * [Methods](#methods)
* [Example](#example)

### Configuration Options

`fields`: Array - (**required**) The array of form element objects that controls what form elements are rendered. See below.

`buttons`: Array - (recommended) The array of button objects that allow you to handle use interaction with the form.

`data`: Object - (optional) If provided, must contain property names that bind to the name property in the field objects
that are provided via the fields property. See field definitions below for more detail.

`orientation`: String - (optional) [vertical | horizontal] Controls how the form lays out.  Will the labels appear above
the input element or inline. Default is "vertical".

`showSpinnerOnSubmit`: Boolean - (optional) When the form is validated and this option is set to true, a spinner will be displayed
to the left of the buttons. To hide the spinner use the `FormliciousAPI.hideSpinner()` method that is passed to your button callback.
**Note** that you must have a button of type `submit` for this to work. Only the submit button type triggers the event.

`spinnerUrl`: String - (optional) Allows you to override the default spinner image. You can override the styles applied to the image
using the .formlicious-spinner CSS selector. For example, "/img/my-spinner.gif".

#### Field
Controls the form input elements that get rendered.

`name`: String - (**required**) The name of the field. This will NOT be visible in the UI. This property is used for
 binding a data object with a form element. See the example below for more details.

`type`: String - (**required**) [input | textarea | date | credit-card | credit-card-expiration | checkbox | checkbox-group | radio | radio-group | dropzone | file-upload | select]

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
dropzone               | A Dropzone for file uploads. See [Dropzone](http://www.dropzonejs.com/). Jump to the [Dropzone Configuration](#dropzone-configuration) to learn more.
file-upload            | A file chooser that supports file previews prior to being uploaded. Jump to the [File Upload Configuration](#file-upload-configuration) to learn more.
select				   | A select dropdown list. See the demo app for usage examples.

For more detail on the types and what options affect their presentation and data binding. See below.

`title`: String - (recommended) The text that is displayed along with the form element. See the demo.

`id`: String - (optional) The id for the form element that corresponds to the field.

`placeholder`: String - (optional) Placeholder text for the element. Only works for input, date, and credit-card types.

`required`: Boolean - (optional) Set this to true to force validation on the field. If not validator is provided, the
default is to validate that the input is not empty.

`maxlength`: Integer - (optional) If provided, limits the number of characters that can be typed into the input. For the
 textarea type, this also provides a visual indicator beneath the textarea that shows how many characters remain.

`validator`: Function - (optional) A function that validates the input and returns true or false. The function will be
called with the following arguments.

```
/**
 * @param field The field config object.
 * @param input The raw user input.
 * @return boolean True if the input is valid, false otherwise.
 */
function(field, input) {
  // do some validation...
  return true;
}
```

Formlicious provides some validators for your convenience. See below for more details.

#### Button

Allows you to handle user interaction with the form.

`text`: String - (**required**) The text that gets displayed on the button.

`callback`: Function - (recommended) The callback that gets called when this button is clicked. The callback has the following form:

```
/**
 * @param api The FormliciousAPI instance (see below).
 * @param valid The result of the form validation. True if the form is valid, false otherwise.
 * @param data The data object that was constructed by extracting the form data.
 */
function (api, valid, data) {
  // Do something...
}
```

`type`: String - (optional) [button | submit | reset] The button type. By default, "button". It is recommended that the main action button of the form be of type "submit". This will submit the form when either the enter key is pressed or the button is clicked.

`classes`: String - (optional) CSS classes that will be applied to the button.  The default is "btn-default", but any style will work.  Typically the Bootstrap styles are used (i.e., btn-danger, btn-primary, btn-info, etc...).

`disableOnClick`: Boolean - (optional) If true, the form will be disabled after the user clicks the button. To re-enable the state you should call the api that is passes to the callback (see the FormliciousAPI).

#### Dropzone Configuration

`options`: You can provide any of the supported dropzone options as per dropzone documentation: [Dropzone](http://www.dropzonejs.com/#configuration-options)

**Note:** The default behavior is to NOT post the uploads to the server.  Instead it is recommended that you use something like [Slingshot](https://atmospherejs.com/edgee/slingshot) to upload the files to S3 or some other cloud provider.

By default, the button callback will receive the files array in the data object for the dropzone fields.  You can use those file objects to handle the upload with Slinshot. An example will be provided via a wiki page shortly.

#### File Upload Configuration

`buttonText`: String - (**required**) The button text that will open the file chooser. For example, "Upload".
 
`width`: Number - (**required**) This is the width of the preview image. The height of the image will be determined automatically. If you are allowing file types other that images, the preview image will be a generic file icon.

`removeText`: String - (optional) Text to display when hovering over the remove button that gets overlayed on the file upload preview. This text will get put in the title attribute of the remove button.

`accept`: String - (optional) What file types to accept on the server. Note, you must validate the types on the server as well.

### Validators

All validators expect to be passed the field object and the input data. For example,

```
function myValidator(field, input) {
   // Validate the input against the field.
   return true;
}
```

`Formlicious.validators.nonEmptyValidator`: Ensures the input is not empty.

`Formlicious.validators.stringValidator`: Ensures the input is valid as per the field config object. Specifically, if maxlength was provided, this will validate it.

`Formlicious.validators.creditCardValidator`: Validates the credit card number using the Luhn algorithm.

`Formlicious.validators.creditCardExpirationValidator`: Validates the the year and month are valid.

### FormliciousAPI
The API instance that allows you to programmatically control the form.

#### Properties
`options`: Essentially this is the configuration option that was passed to the formlicious template.  This instance has been augmented such that methods exist on each field instance that expose an API for each field. This provides individual API control for enabling, disabling, resetting, getting data, and setting data programmatically for individual fields.

##### Option fields
Each field in the options object has been augmented to expose an API on the individual fields:

###### Properties
`controlElement`: This is the jQuery instance of the form element.

###### Methods
`setData`: Sets the form element's data.

`getData`: Gets the form element's data.

`reset`: Resets/clears the form element. Same as calling setData(null).

`validate`: Validates the form element.

`disable`: Disables the form element.

`enabled`: Enables the form element.

#### Methods
`reset`: Reset/clear the form.  The form will be empty after calling this.

`validate`: Validates the form.

`enable`: Enables the form. If the form is already enabled, this has no effect.

`disable`: Disabled the form. If the form is already disabled, this has no effect.

`clearErrors`: Clears the error styles from the form.

`showSpinner`: Shows the spinner next to the buttons.

`hideSpinner`: Hides the spinner next to the buttons.

### Example

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
			showSpinnerOnSubmit: true, // Optional - false by default.
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
