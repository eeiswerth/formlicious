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
			fields: [
				type: 'textarea',
				maxlength: 500
			]
		}
	}
});
```
