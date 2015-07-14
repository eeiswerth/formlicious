var _formId;
var _vertical = true;

var updateTextareaCounter = function(textareaElem) {
    var counterElement = textareaElem.siblings('.textarea-counter');

    var max = parseInt(textareaElem.attr('maxlength'), 10);
    var curLen = textareaElem.val().length;
    var allowedChars = max - curLen;
    if (allowedChars < 0) {
        counterElement.addClass('error');
    } else {
        counterElement.removeClass('error');
    }
    counterElement.html(allowedChars);
};

var getTitleClasses = function() {
    var classes = this.titleClasses;
    if (!_vertical) {
        if (!classes) {
            classes = 'col-sm-2';
        }
    }
    return classes;
};

var getControlClasses = function() {
    var classes = this.controlClasses;
    if (!_vertical) {
        if (!classes) {
            classes = 'col-sm-10';
        }
    }
    return classes;
};

var getFieldValue = function(controlElement, field) {
  if (field.type === 'input' || field.type === 'textarea' || field.type === 'credit-card') {
      return controlElement.val();
  } else if (field.type === 'date') {
      return controlElement.datepicker('getDate');
  } else {
      throw new Error('Field type not supported: ' + field.type);
  }
};

var validateControl = function(controlElement, field) {
    var value = getFieldValue(controlElement, field);
    if (field.validator != null && !$.isFunction(field.validator)) {
        throw new Error('Field validator must be a function.');
    }
    var validator = field.validator;
    if (field.required) {
        if (field.validator == null) {
            // If field is required, but no validator is specified, then we default to non-empty validator.
            validator = Formlicious.validators.nonEmptyValidator;
        }
    }

    var valid = true;
    if (validator != null) {
        // run the validator;
        var controlElementParent = controlElement.closest('.form-group');

        // Clear error state.
        controlElementParent.removeClass('has-error');

        valid = validator(field, value);
        if (!valid) {
            controlElementParent.addClass('has-error');
        }
    }
    return valid;
};

Template.formlicious.onCreated(function() {
    if (!this.data.options) {
        return;
    }
    var options = this.data.options;
    var isVertical = !options.orientation || options.orientation === 'vertical';
    var isHorizontal = options.orientation === 'horizontal';
    if (!isVertical && !isHorizontal) {
        throw new Error('Invalid orientation: "' + options.orientation + '"');
    }
    _vertical = isVertical;

    _formId = FormliciousUtils.getCount();
});

Template.formlicious.onDestroyed(function() {
});

Template.formlicious.helpers({
    vertical: function() {
        return _vertical;
    },
    formId: function() {
        return 'formliciousForm_' + _formId;
    }
});

Template.formliciousFields.helpers({
    inputType: function() {
        return !this.type || this.type === 'input';
    },
    textareaType: function() {
        return this.type === 'textarea';
    },
    dateType: function() {
        return this.type === 'date';
    },
    ccType: function() {
        return this.type === 'credit-card';
    },
    ccExpirationType: function() {
        return this.type === 'credit-card-expiration';
    }
});

Template.formliciousInputField.helpers({
    titleClasses: function() {
        return getTitleClasses.call(this);
    },
    controlClasses: function() {
        return getControlClasses.call(this);
    }
});

Template.formliciousInputField.events({
    'input input': function(e, tmpl) {
        validateControl($(e.currentTarget), this);
    }
});

Template.formliciousTextareaField.helpers({
    titleClasses: function() {
        return getTitleClasses.call(this);
    },
    controlClasses: function() {
        return getControlClasses.call(this);
    }
});

Template.formliciousTextareaField.events({
    'input textarea': function(e, tmpl) {
        updateTextareaCounter($(e.currentTarget));
        validateControl($(e.currentTarget), this);
    }
});

Template.formliciousDateInputField.onRendered(function() {
    var dateInput = $(this.find('.formlicious-date-input'));
    dateInput.datepicker({
        startView: 2
    });
});

Template.formliciousDateInputField.events({
    'change input': function(e, tmpl) {
        validateControl($(e.currentTarget), this);
    }
});

Template.formliciousCCInputField.events({
    'input input': function(e, tmpl) {
        validateControl($(e.currentTarget), this);
    }
});

Template.formliciousCCExpirationField.helpers({
   months: function() {
       var months = [];
       months.push('');
       for (var i = 1; i <= 12; ++i) {
           if (i < 10) {
               months.push('0' + i);
           } else {
               months.push('' + i);
           }
       }
       return months;
   },
   years: function() {
       var years = [];
       years.push('');
       var currentYear = new Date().getFullYear();
       for (var i = currentYear + 20; i >= currentYear; --i) {
           years.push(i);
       }
       return years;
   }
});

Template.formliciousButton.helpers({
   type: function() {
       var type = 'button';
       if (this.type) {
           type = this.type;
       }
       return type;
   }
});