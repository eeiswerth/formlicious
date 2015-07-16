var _options;
var _formId;
var _vertical = true;
var _api;

var FormliciousAPI = function(options) {
    this.options = options;
};

FormliciousAPI.prototype._execFunc = function(func) {
    $.each(this.options.fields, function(i, field) {
        field[func]();
    });
};

/**
 * Resets the form.
 */
FormliciousAPI.prototype.reset = function() {
    this._execFunc('reset');
    this.clearErrors();
};

/**
 * Validates all fields in the form.
 * @returns {{valid: boolean, fields: Array}}
 */
FormliciousAPI.prototype.validate = function() {
    var result = {
        valid: true,
        fields: []
    };
    $.each(this.options.fields, function(i, field) {
        var fieldValid = true;
        if (!field.validate()) {
            result.valid = false;
            fieldValid = false;
            // Don't break out of loop. We want to continue validating all controls.
        }
        result.fields.push({
            name: field.name,
            valid: fieldValid
        });
    });
    return result;
};

/**
 * Clears the error states on the form elements.
 */
FormliciousAPI.prototype.clearErrors = function() {
    $.each(this.options.fields, function(i, field) {
        var controlElement = field.controlElement;
        if (field.type === 'credit-card-expiration') {
            controlElement = controlElement.parent();
        }
        var controlElementParent = controlElement.closest('.form-group');

        // Clear error state.
        controlElementParent.removeClass('has-error');
    });
};

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

var validateControl = function(controlElement, field) {
    var value = field.getData();
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

var getFormData = function() {
    var data = {};
    $.each(_options.fields, function(i, field) {
        if ($.isFunction(field.getData)) {
            data[field.name] = field.getData();
        }
    });
    return data;
};

var getSubmitButton = function() {
    var button = null;
    $.each(this.options.buttons, function(i, b) {
        if (b.type === 'submit') {
            button = b;
            return false; // break out of the loop.
        }
    });
    return button;
};

var handleButtonClick = function(button) {
    if (!button.callback) {
        // Nothing to do.
        return;
    }

    var result = _api.validate();
    var data = getFormData();
    button.callback(_api, result, data);
};

var getFieldData = function(field) {
    if (!_options.data) {
        return null;
    }
    return _options.data[field.name];
};

Template.formlicious.onCreated(function() {
    if (!this.data.options) {
        return;
    }
    _options = this.data.options;

    if (!_options.fields) {
        return;
    }

    var isVertical = !_options.orientation || _options.orientation === 'vertical';
    var isHorizontal = _options.orientation === 'horizontal';
    if (!isVertical && !isHorizontal) {
        throw new Error('Invalid orientation: "' + _options.orientation + '"');
    }

    if (!$.isArray(_options.fields)) {
        throw new Error('Fields property must be an array.');
    }
    $.each(_options.fields, function(i, field) {
       if (!field.name || !field.type) {
           throw new Error("Fields need a name and a type.");
       }
    });

    if (_options.buttons) {
        if (!$.isArray(_options.buttons)) {
            throw new Error('Buttons property must be an array.');
        }
        var submitCount = 0;
        $.each(_options.buttons, function(i, button) {
            if (button.callback && !$.isFunction(button.callback)) {
                throw new Error('Button callbacks must be functions.');
            }
            if (button.type === 'submit') {
                ++submitCount;
            }
        });
        if (submitCount > 1) {
            throw new Error('Only one button should be of type submit.');
        }
    }

    _vertical = isVertical;
    _formId = FormliciousUtils.getCount();
    _api = new FormliciousAPI(_options);
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

Template.formlicious.events({
    'submit form': function(e, tmpl) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        var button = getSubmitButton.call(this);
        handleButtonClick(button);
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

Template.formliciousInputField.onRendered(function() {
    var self = this;
    this.data.controlElement = $(this.find('input'));
    this.data.getData = function() {
        return $.trim(this.controlElement.val());
    };
    this.data.setData = function(value) {
        this.controlElement.val(value);
    };
    this.data.reset = function() {
        this.controlElement.val('');
    };
    this.data.validate = function() {
        return validateControl(self.data.controlElement, self.data);
    };

    var data = getFieldData(this.data);
    this.data.setData(data);
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

Template.formliciousTextareaField.onRendered(function() {
    var self = this;
    this.data.controlElement = $(this.find('textarea'));
    this.data.getData = function() {
        return $.trim(this.controlElement.val());
    };
    this.data.setData = function(value) {
        this.controlElement.val(value);
    };
    this.data.reset = function() {
        this.controlElement.val('');
    };
    this.data.validate = function() {
        return validateControl(self.data.controlElement, self.data);
    };

    var data = getFieldData(this.data);
    this.data.setData(data);
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
    var self = this;
    this.data.controlElement = $(this.find('.formlicious-date-input'));
    this.data.getData = function() {
        return this.controlElement.datepicker('getDate');
    };
    this.data.setData = function(value) {
        this.controlElement.datepicker('setDate', value);
    };
    this.data.reset = function() {
        this.controlElement.datepicker('setDate', null);
    };
    this.data.validate = function() {
        return validateControl(self.data.controlElement, self.data);
    };

    var dateInput = this.data.controlElement;
    dateInput.datepicker({
        startView: 2
    });

    var data = getFieldData(this.data);
    this.data.setData(data);
});

Template.formliciousDateInputField.events({
    'change input': function(e, tmpl) {
        validateControl($(e.currentTarget), this);
    }
});

Template.formliciousCCInputField.onRendered(function() {
    var self = this;
    this.data.controlElement = $(this.find('input'));
    this.data.getData = function() {
        return $.trim(this.controlElement.val());
    };
    this.data.setData = function(value) {
        this.controlElement.val(value);
    };
    this.data.reset = function() {
        this.controlElement.val('');
    };
    this.data.validate = function() {
        return validateControl(self.data.controlElement, self.data);
    };

    var data = getFieldData(this.data);
    this.data.setData(data);
});

Template.formliciousCCInputField.events({
    'input input': function(e, tmpl) {
        validateControl($(e.currentTarget), this);
    }
});

Template.formliciousCCExpirationField.onRendered(function() {
    var self = this;
    this.data.controlElement = $(this.find('.formlicious-cc-expiration'));
    this.data.getData = function() {
        var monthsSelectElement = this.controlElement.find('.formlicious-cc-months');
        var yearsSelectElement = this.controlElement.find('.formlicious-cc-years');

        return {
            month: parseInt(monthsSelectElement.val(), 10),
            year: parseInt(yearsSelectElement.val(), 10)
        };
    };
    this.data.setData = function(value) {
        if (!value) {
            return;
        }
        var monthsSelectElement = this.controlElement.find('.formlicious-cc-months');
        var yearsSelectElement = this.controlElement.find('.formlicious-cc-years');
        if (value.month) {
            monthsSelectElement.val(value.month);
        }
        if (value.year) {
            yearsSelectElement.val(value.year);
        }
    };

    this.data.reset = function() {
        var monthsSelectElement = this.controlElement.find('.formlicious-cc-months');
        var yearsSelectElement = this.controlElement.find('.formlicious-cc-years');
        monthsSelectElement.val('');
        yearsSelectElement.val('');
    };
    this.data.validate = function() {
        return validateControl(self.data.controlElement.parent(), self.data);
    };

    var data = getFieldData(this.data);
    this.data.setData(data);
});

Template.formliciousCCExpirationField.helpers({
   months: function() {
       var months = [];
       months.push({value : '', display: ''});
       for (var i = 1; i <= 12; ++i) {
           if (i < 10) {
               months.push({value: i, display: '0' + i});
           } else {
               months.push({value: i, display: '' + i});
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

Template.formliciousCCExpirationField.events({
    'change select.formlicious-cc-months': function(e, tmpl) {
        validateControl($(e.currentTarget).parent(), this);
    },
    'change select.formlicious-cc-years': function(e, tmpl) {
        validateControl($(e.currentTarget).parent(), this);
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

Template.formliciousButton.events({
   'click button': function(e, tmpl) {
       if (this.type === 'submit') {
           // Nothing to do.
           return;
       }
       handleButtonClick(this);
   }
});