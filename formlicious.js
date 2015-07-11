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
    var classes = '';
    if (!_vertical) {
        if (this.titleClasses) {
            classes = this.titleClasses;
        } else {
            classes = 'col-sm-2';
        }
    }
    return classes;
};

var getControlClasses = function() {
    var classes = '';
    if (!_vertical) {
        if (this.controlClasses) {
            classes = this.controlClasses;
        } else {
            classes = 'col-sm-10';
        }
    }
    return classes;
};

Template.formlicious.onCreated(function() {
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
    }
});
