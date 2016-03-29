var FormliciousAPI = function(options, vertical) {
    this.options = options;
    this.vertical = vertical;
    this.formId = FormliciousUtils.getCount();
    this.spinner = new ReactiveVar(false);
    this.fields = {};
    this.buttons = {};
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

/**
 * Show the spinner.
 */
FormliciousAPI.prototype.showSpinner = function() {
    this.spinner.set(true);
};

/**
 * Hide the spinner.
 */
FormliciousAPI.prototype.hideSpinner = function() {
    this.spinner.set(false);
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
    var api = FormliciousUtils.getApi.call(this);
    var classes = this.titleClasses;
    if (!api.vertical) {
        if (!classes) {
            classes = 'col-sm-2';
        }
    }
    return classes;
};

var getControlClasses = function() {
    var api = FormliciousUtils.getApi.call(this);
    var classes = this.controlClasses;
    if (!api.vertical) {
        if (!classes) {
            classes = 'col-sm-10';
        }
    }
    return classes;
};

var validateControl = function(controlElement, field) {
    field = getFieldObject.call(this, field);
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
    var api = FormliciousUtils.getApi.call(this);
    var data = {};
    $.each(api.fields, function(i, field) {
        if ($.isFunction(field.getData)) {
            data[field.name] = field.getData();
        }
    });
    return data;
};

var getSubmitButton = function() {
    var api = FormliciousUtils.getApi.call(this);
    var button = null;
    $.each(api.options.buttons, function(i, b) {
        if (b.type === 'submit') {
            button = b;
            return false; // break out of the loop.
        }
    });
    return button;
};

var handleButtonClick = function(button) {
    var api = FormliciousUtils.getApi.call(this);
    button = getButtonObject.call(this, button);
    if (!button.callback) {
        // Nothing to do.
        return;
    }

    var result = api.validate();
    if (result && button.disableOnClick) {
        api.disable();
    }
    if (result && button.type === 'submit' && api.options.showSpinnerOnSubmit) {
        api.spinner.set(true);
    }
    var data = getFormData.call(this);
    button.callback(api, result, data);
};

var getFieldData = function(field) {
    var api = FormliciousUtils.getApi.call(this);
    if (!api.options.data) {
        return null;
    }
    return api.options.data[field.name];
};

var getFieldObject = function(field) {
    var api = FormliciousUtils.getApi.call(this);
    var fieldObj = api.fields[field.name];
    if (!fieldObj) {
        fieldObj = _.clone(field);
        api.fields[field.name] = fieldObj;
    }
    return fieldObj;
};

var getButtonObject = function(button) {
    var api = FormliciousUtils.getApi.call(this);
    var buttonObj = api.buttons[button.text];
    if (!buttonObj) {
        buttonObj = _.clone(button);
        api.buttons[button.text] = buttonObj;
    }
    return buttonObj;
};

var initCheckboxAndRadioInput = function() {
    var self = this;
    var field = getFieldObject.call(this, this.data);
    field.controlElement = $(this.find('input'));
    field.controlElement.on('click', function(e) {
        if ($.isFunction(self.data.click)) {
           self.data.click(e);
        }
    });
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
        return validateControl.call(self, this.controlElement, this);
    };
    field.disable = function() {
        this.controlElement.prop("disabled", true);
    };
    field.enable = function() {
        this.controlElement.prop("disabled", false);
    };

    var data = getFieldData.call(this, this.data);
    field.setData(data);
};

var initCheckboxAndRadioGroupInputs = function(selector, parentSelector) {
    var self = this;
    var field = getFieldObject.call(this, this.data);
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
        return validateControl.call(self, this.controlElement, this);
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

    var data = getFieldData.call(this, this.data);
    field.setData(data);
};

Template.formlicious.onCreated(function() {
    if (!this.data.options) {
        return;
    }
    var _options = this.data.options;

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

    var fieldNames = [];
    $.each(_options.fields, function(i, field) {
       if (!field.name || !field.type) {
           throw new Error("Fields need a name and a type.");
       }
       if ($.inArray(field.name, fieldNames) !== -1) {
           throw new Error("Fields names must be unique. Duplicate field name: " + field.name);
       }
       fieldNames.push(field.name);
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

    this.view.formlicious = {
      _api: new FormliciousAPI(_options, isVertical)
    };
});

Template.formlicious.helpers({
    vertical: function() {
        var api = FormliciousUtils.getApi.call(this);
        return api.vertical;
    },
    formId: function() {
        var api = FormliciousUtils.getApi.call(this);
        return 'formliciousForm_' + api.formId;
    }
});

Template.formlicious.events({
    'submit form': function(e, tmpl) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        var button = getSubmitButton.call(this);
        handleButtonClick.call(this, button);
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
    },
    dropzoneType: function() {
        return this.type === 'dropzone';
    },
    fileUploadType: function() {
      return this.type === 'file-upload';
    },
    selectType: function() {
        return this.type === 'select';
    }
});

Template.formliciousInputField.onRendered(function() {
    var self = this;
    var field = getFieldObject.call(this, this.data);
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
        return validateControl.call(self, this.controlElement, this);
    };
    field.disable = function() {
        this.controlElement.prop("disabled", true);
    };
    field.enable = function() {
        this.controlElement.prop("disabled", false);
    };

    var data = getFieldData.call(this, this.data);
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
        validateControl.call(this, $(e.currentTarget), this);
    }
});

Template.formliciousTextareaField.onRendered(function() {
    var self = this;
    var field = getFieldObject.call(this, this.data);
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
        return validateControl.call(self, this.controlElement, this);
    };
    field.disable = function() {
        this.controlElement.prop("disabled", true);
    };
    field.enable = function() {
        this.controlElement.prop("disabled", false);
    };

    var data = getFieldData.call(this, this.data);
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
        validateControl.call(this, $(e.currentTarget), this);
    }
});

Template.formliciousDateInputField.onRendered(function() {
    var self = this;
    var field = getFieldObject.call(this, this.data);
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
        return validateControl.call(self, this.controlElement, this);
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

    var data = getFieldData.call(this, this.data);
    field.setData(data);
});

Template.formliciousDateInputField.events({
    'change input': function(e, tmpl) {
        validateControl.call(this, $(e.currentTarget), this);
    }
});

Template.formliciousCCInputField.onRendered(function() {
    var self = this;
    var field = getFieldObject.call(this, this.data);
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
        return validateControl.call(self, this.controlElement, this);
    };
    field.disable = function() {
        this.controlElement.prop("disabled", true);
    };
    field.enable = function() {
        this.controlElement.prop("disabled", false);
    };

    var data = getFieldData.call(this, this.data);
    field.setData(data);
});

Template.formliciousCCInputField.events({
    'input input': function(e, tmpl) {
        validateControl.call(this, $(e.currentTarget), this);
    }
});

Template.formliciousCCExpirationField.onRendered(function() {
    var self = this;
    var field = getFieldObject.call(this, this.data);
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
        return validateControl.call(self, this.controlElement.parent(), this);
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

    var data = getFieldData.call(this, this.data);
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
       for (var i = currentYear; i <= currentYear + 20; ++i) {
           years.push(i);
       }
       return years;
   }
});

Template.formliciousCCExpirationField.events({
    'change select.formlicious-cc-months': function(e, tmpl) {
        validateControl.call(this, $(e.currentTarget).parent(), this);
    },
    'change select.formlicious-cc-years': function(e, tmpl) {
        validateControl.call(this, $(e.currentTarget).parent(), this);
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

Template.formliciousDropzoneField.onRendered(function() {
  var self = this;
  var dropzoneOptions = {
    url: '/dummy',
    id: this.data.id
  };
  if (this.data.options) {
    $.each(this.data.options, function (key, value) {
      dropzoneOptions[key] = value;
    });
  }

  var dropzone = new Dropzone('.dropzone', dropzoneOptions);
  dropzone.uploadFiles = DropzoneUtils.uploadFiles;

  var field = getFieldObject.call(this, this.data);
  field.dropzone = dropzone;
  field.controlElement = $(dropzone.element);
  field.getData = function () {
    return this.dropzone.getAcceptedFiles();
  };
  field.setData = function (value) {
    throw new Error("setData is not supported for the dropzone field type.");
  };
  field.reset = function () {
    this.dropzone.removeAllFiles();
  };
  field.validate = function () {
    return validateControl.call(self, this.controlElement, this);
  };
  field.disable = function () {
    this.controlElement.prop("disabled", true);
  };
  field.enable = function () {
    this.controlElement.prop("disabled", false);
  };
});

Template.formliciousFileUploadField.onCreated(function() {
  var field = getFieldObject.call(this, this.data);
  field.uploadedFileUrl = new ReactiveVar(null);
});

Template.formliciousFileUploadField.onRendered(function() {
  var self = this;
  var field = getFieldObject.call(this, this.data);
  field.controlElement = $(this.find('.file-upload-button'));
  field.getData = function() {
    return this.uploadedFileUrl.get();
  };
  field.setData = function(value) {
    this.uploadedFileUrl.set(value);
  };
  field.reset = function() {
    this.setData(null);
  };
  field.validate = function() {
    return validateControl.call(self, this.controlElement, this);
  };
  field.disable = function() {
    this.controlElement.find('input').prop("disabled", true);
  };
  field.enable = function() {
    this.controlElement.find('input').prop("disabled", false);
  };
  field.getWidth = function() {
    var width = 130;
    if (this.width) {
      width = this.width;
    }
    return width;
  };

  var data = getFieldData.call(this, this.data);
  field.setData(data);
});

Template.formliciousFileUploadField.helpers({
  width: function() {
    var field = getFieldObject.call(this, this);
    return field.getWidth();
  },
  uploadUrl: function() {
    var field = getFieldObject.call(this, this);
    var data = field.uploadedFileUrl.get();
    if (data) {
      return data.dataUrl;
    }
    return null;
  },
  previewUrl: function() {
    var field = getFieldObject.call(this, this);
    var data = field.uploadedFileUrl.get();
    var url = null;

    if (data) {
      url = data.dataUrl;
    }

    if (url && url.indexOf('data:image') === 0) {
      // If it's an image, display an image preview. Otherwise show a default file icon.
      return url;
    }

    if (field.previewImageUrl) {
      return field.previewImageUrl;
    } else {
      return '/packages/eeiswerth_formlicious/img/file-icon.png';
    }
  },
  filename: function() {
    var field = getFieldObject.call(this, this);
    var data = field.uploadedFileUrl.get();
    if (data) {
      return data.name;
    }
    return null;
  }
});

Template.formliciousFileUploadField.events({
  'click input[type=file]': function(e, tmpl) {
    var input = e.currentTarget;
    input.value = null;
  },
  'change input[type=file]': function(e, tmpl) {
    var field = getFieldObject.call(this, this);
    var type = null;
    var input = tmpl.find('input[type=file]');
    var files = input.files;

    if (files.length === 0) {
      // They hit cancel.
      return;
    }

    if (this.accept) {
      type = new RegExp(this.accept);
    }

    var file = files[0];
    if (type && !file.type.match(type)) {
      // TODO: Throw an error. The wrong type of file is being uploaded.
      console.error("Invalid type: " + file.type);
      return;
    }

    if (!window.FileReader) {
      // TODO: throw an error. The browser doesn't support the FileReader API.
      console.error("Browser doesn't support FileReader API.");
      return;
    }

    var reader = new FileReader();
    reader.onload = function(evt) {
      var data = {
        dataUrl: evt.target.result,
        name: FormliciousUtils.formatFilename(file.name, field.getWidth())
      };
      field.uploadedFileUrl.set(data);
    };

    reader.onabort = function() {
      console.error('File reader aborted.');
      console.error(arguments);
    };

    reader.onerror = function() {
      console.error('File reader error file.');
      console.error(arguments);
    };

    reader.readAsDataURL(file);
  },
  'click .file-upload-actions button': function(e, tmpl) {
    var field = getFieldObject.call(this, this);
    field.uploadedFileUrl.set(null);
  }
});

Template.formliciousSelectField.onRendered(function() {
    var self = this;
    var field = getFieldObject.call(this, this.data);
    field.controlElement = $(this.find('select'));
    field.getData = function() {
        var val = this.controlElement.val();
        return this.getValue(val);
    };
    field.setData = function(value) {
        if (value == null) {
            return;
        }
        field.controlElement.val(value);
    };
    field.reset = function() {
        this.setData(field.values);
    };
    field.validate = function() {
        return validateControl.call(self, this.controlElement, this);
    };
    field.disable = function() {
        this.controlElement.prop("disabled", true);
    };
    field.enable = function() {
        this.controlElement.prop("disabled", false);
    };
    /**
     * Helper function to retrieve the true object corresponding to the given option/value.
     * @param value
     */
    field.getValue = function(value) {
        var result = null;
        $.each(field.values, function(i, val) {
            if (val.value === value) {
                result = val;
                return false; // Break from loop.
            }
        });
        return result;
    };
    /**
     * Helper function to retrieve the index of the given value in the given array of input values/options.
     * @param value
     */
    field.getValueIndex = function(value) {
        var index = -1;
        $.each(field.values, function(i, val) {
           if (val.value === value.value) {
               index = i;
               return false; // Break out of loop.
           }
        });
        return index;
    };

    var data = getFieldData.call(this, this.data);
    field.setData(data);
});

Template.formliciousButtons.helpers({
    showSpinner: function() {
      var api = FormliciousUtils.getApi.call(this);
      return api.spinner.get();
    }
});

Template.formliciousButton.onRendered(function() {
    var button = getButtonObject.call(this, this.data);
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
       handleButtonClick.call(this, this);
   }
});

Template.formliciousSpinner.helpers({
    spinnerUrl: function() {
        if (this.options.spinnerUrl) {
            return this.options.spinnerUrl;
        }
        return '/packages/eeiswerth_formlicious/img/loading.gif';
    }
});

Template.formliciousProgressBar.updateProgressBar = function(id, progress) {
    var progressBar = $('#' + id + '-progress-bar');
    if (!progressBar) {
        return;
    }
    if (progress < 0 || progress > 100) {
        return;
    }
    var progressBarElems = progressBar.find('.progress-bar');
    if (!progressBarElems || progressBarElems.length !== 1) {
        throw new Error("Invalid number of progress bar children: " + progressBarElems.length);
    }
    progressBar.removeClass('hidden');
    var progressBarElem = $(progressBarElems[0]);
    progressBarElem.attr('aria-valuenow', progress);
    progressBarElem.css('width', progress + '%');
    progressBarElem.html(progress + '%');
};

Template.formliciousProgressBar.hideProgressBar = function(id) {
    var progressBar = $('#' + id + 'upload-progress-bar');
    if (!progressBar) {
        return;
    }
    progressBar.addClass('hidden');
};
