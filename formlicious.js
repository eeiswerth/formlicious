var _options;
var _formId;
var _vertical = true;
var _api;
var _fieldUtils = {};
var _buttonUtils = {};

var FormliciousAPI = function(options, fields, buttons) {
    this.options = options;
    this.fields = fields;
    this.buttons = buttons;
};

FormliciousAPI.prototype._execFunc = function(func, buttonFunc) {
    $.each(this.fields, function(i, field) {
        field[func]();
    });

    if (buttonFunc) {
        $.each(this.buttons, function(i, button) {
            button[func]();
        });
    }
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
    $.each(this.fields, function(i, field) {
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
 * Disables all the form elements and buttons.
 */
FormliciousAPI.prototype.disable = function() {
    this._execFunc('disable', true);
};

/**
 * Enables all the form elements and buttons.
 */
FormliciousAPI.prototype.enable = function() {
    this._execFunc('enable', true);
};

/**
 * Clears the error states on the form elements.
 */
FormliciousAPI.prototype.clearErrors = function() {
    $.each(this.fields, function(i, field) {
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
    field = getFieldObject(field);
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
    $.each(_fieldUtils, function(i, field) {
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
    button = getButtonObject(button);
    if (!button.callback) {
        // Nothing to do.
        return;
    }

    var result = _api.validate();
    if (result && button.disableOnClick) {
        _api.disable();
    }
    var data = getFormData();
    button.callback(_api, result, data);
};

var getFieldData = function(field) {
    if (!_options.data) {
        return null;
    }
    return _options.data[field.name];
};

var getFieldObject = function(field) {
    var fieldObj = _fieldUtils[field.name];
    if (!fieldObj) {
        fieldObj = _.clone(field);
        _fieldUtils[field.name] = fieldObj;
    }
    return fieldObj;
};

var getButtonObject = function(button) {
    var buttonObj = _buttonUtils[button.text];
    if (!buttonObj) {
        buttonObj = _.clone(button);
        _buttonUtils[button.text] = buttonObj;
    }
    return buttonObj;
};

var initCheckboxAndRadioInput = function() {
    var field = getFieldObject(this.data);
    field.controlElement = $(this.find('input'));
    field.getData = function() {
        return this.controlElement.prop("checked");
    };
    field.setData = function(value) {
        return this.controlElement.prop("checked", value);
    };
    field.reset = function() {
        this.setData(false);
    };
    field.validate = function() {
        return validateControl(this.controlElement, this);
    };
    field.disable = function() {
        this.controlElement.prop("disabled", true);
    };
    field.enable = function() {
        this.controlElement.prop("disabled", false);
    };

    var data = getFieldData(this.data);
    field.setData(data);
};

var initCheckboxAndRadioGroupInputs = function(selector, parentSelector) {
    var field = getFieldObject(this.data);
    field.controlElement = $(this.find(parentSelector));
    field.getData = function() {
        var values = [];
        $.each(this.controlElement.find(selector + ' input'), function(i, checkboxElement) {
            values.push($(checkboxElement).prop("checked"));
        });
        return values;
    };
    field.setData = function(values) {
        $.each(this.controlElement.find(selector + ' input'), function(i, checkboxElement) {
            var value = false;
            if (values && values[i] !== undefined) {
                value = values[i];
            }
            $(checkboxElement).prop("checked", value);
        });
    };
    field.reset = function() {
        this.setData(null);
    };
    field.validate = function() {
        return validateControl(this.controlElement, this);
    };
    field._toggleDisabled = function(disabled) {
        $.each(this.controlElement.find(selector + ' input'), function(i, checkboxElement) {
            $(checkboxElement).prop("disabled", disabled);
        });
    };
    field.disable = function() {
        this._toggleDisabled(true);
    };
    field.enable = function() {
        this._toggleDisabled(false);
    };

    var data = getFieldData(this.data);
    field.setData(data);
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
    _api = new FormliciousAPI(_options, _fieldUtils, _buttonUtils);
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
    },
    checkboxType: function() {
        return this.type === 'checkbox';
    },
    checkboxGroupType: function() {
        return this.type === 'checkbox-group';
    },
    radioType: function() {
        return this.type === 'radio';
    },
    radioGroupType: function() {
        return this.type === 'radio-group';
    }
});

Template.formliciousInputField.onRendered(function() {
    var field = getFieldObject(this.data);
    field.controlElement = $(this.find('input'));
    field.getData = function() {
        return $.trim(this.controlElement.val());
    };
    field.setData = function(value) {
        this.controlElement.val(value);
    };
    field.reset = function() {
        this.setData('');
    };
    field.validate = function() {
        return validateControl(this.controlElement, this);
    };
    field.disable = function() {
        this.controlElement.prop("disabled", true);
    };
    field.enable = function() {
        this.controlElement.prop("disabled", false);
    };

    var data = getFieldData(this.data);
    field.setData(data);
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
    var field = getFieldObject(this.data);
    field.controlElement = $(this.find('textarea'));
    field.getData = function() {
        return $.trim(this.controlElement.val());
    };
    field.setData = function(value) {
        this.controlElement.val(value);
        updateTextareaCounter(this.controlElement);
    };
    field.reset = function() {
        this.setData('');
    };
    field.validate = function() {
        return validateControl(this.controlElement, this);
    };
    field.disable = function() {
        this.controlElement.prop("disabled", true);
    };
    field.enable = function() {
        this.controlElement.prop("disabled", false);
    };

    var data = getFieldData(this.data);
    field.setData(data);
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
    var field = getFieldObject(this.data);
    field.controlElement = $(this.find('.formlicious-date-input'));
    field.getData = function() {
        return this.controlElement.datepicker('getDate');
    };
    field.setData = function(value) {
        this.controlElement.datepicker('setDate', value);
    };
    field.reset = function() {
        this.setData(null);
    };
    field.validate = function() {
        return validateControl(this.controlElement, this);
    };
    field.disable = function() {
        this.controlElement.prop("disabled", true);
    };
    field.enable = function() {
        this.controlElement.prop("disabled", false);
    };

    var dateInput = field.controlElement;
    dateInput.datepicker({
        startView: 2
    });

    var data = getFieldData(this.data);
    field.setData(data);
});

Template.formliciousDateInputField.events({
    'change input': function(e, tmpl) {
        validateControl($(e.currentTarget), this);
    }
});

Template.formliciousCCInputField.onRendered(function() {
    var field = getFieldObject(this.data);
    field.controlElement = $(this.find('input'));
    field.getData = function() {
        return $.trim(this.controlElement.val());
    };
    field.setData = function(value) {
        this.controlElement.val(value);
    };
    field.reset = function() {
        this.setData('');
    };
    field.validate = function() {
        return validateControl(this.controlElement, this);
    };
    field.disable = function() {
        this.controlElement.prop("disabled", true);
    };
    field.enable = function() {
        this.controlElement.prop("disabled", false);
    };

    var data = getFieldData(this.data);
    field.setData(data);
});

Template.formliciousCCInputField.events({
    'input input': function(e, tmpl) {
        validateControl($(e.currentTarget), this);
    }
});

Template.formliciousCCExpirationField.onRendered(function() {
    var field = getFieldObject(this.data);
    field.controlElement = $(this.find('.formlicious-cc-expiration'));
    field.getData = function() {
        var monthsSelectElement = this.controlElement.find('.formlicious-cc-months');
        var yearsSelectElement = this.controlElement.find('.formlicious-cc-years');

        return {
            month: parseInt(monthsSelectElement.val(), 10),
            year: parseInt(yearsSelectElement.val(), 10)
        };
    };
    field.setData = function(value) {
        if (!value) {
            return;
        }
        var monthsSelectElement = this.controlElement.find('.formlicious-cc-months');
        var yearsSelectElement = this.controlElement.find('.formlicious-cc-years');
        if (value.month != null) {
            monthsSelectElement.val(value.month);
        }
        if (value.year != null) {
            yearsSelectElement.val(value.year);
        }
    };

    field.reset = function() {
        this.setData({month: '', year: ''});
    };
    field.validate = function() {
        return validateControl(this.controlElement.parent(), this);
    };
    field._toggleDisabled = function(disabled) {
        var monthsSelectElement = this.controlElement.find('.formlicious-cc-months');
        var yearsSelectElement = this.controlElement.find('.formlicious-cc-years');
        monthsSelectElement.prop("disabled", disabled);
        yearsSelectElement.prop("disabled", disabled);
    };
    field.disable = function() {
        this._toggleDisabled(true);
    };
    field.enable = function() {
        this._toggleDisabled(false);
    };

    var data = getFieldData(this.data);
    field.setData(data);
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

Template.formliciousCheckboxField.onRendered(function() {
    initCheckboxAndRadioInput.call(this);
});

Template.formliciousCheckboxGroupField.onRendered(function() {
    initCheckboxAndRadioGroupInputs.call(this, '.formlicious-checkbox', '.formlicious-checkbox-group');
});

Template.formliciousRadioButtonField.onRendered(function() {
    initCheckboxAndRadioInput.call(this);
});

Template.formliciousRadioButtonGroupField.onRendered(function() {
    initCheckboxAndRadioGroupInputs.call(this, '.formlicious-radio', '.formlicious-radio-group');
});

Template.formliciousButton.onRendered(function() {
    var button = getButtonObject(this.data);
    button.controlElement =  $(this.find('button'));
    button.disable = function() {
        this.controlElement.prop("disabled", true);
    };
    button.enable = function() {
        this.controlElement.prop("disabled", false);
    };
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