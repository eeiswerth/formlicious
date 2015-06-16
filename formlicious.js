var formId;

var updateTextareaCounter = function(tmpl) {
    var textareaElem = $(tmpl.find('textarea'));
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

Template.formlicious.onCreated(function() {
    formId = FormliciousUtils.getCount();
});

Template.formlicious.onDestroyed(function() {
});

Template.formlicious.helpers({
    vertical: function() {
        if (!this.options || !this.options.orientation) {
            return true;
        }
        var isVertical = this.options.orientation === 'vertical';
        var isHorizontal = this.options.orientation === 'horizontal';
        if (!isVertical && !isHorizontal) {
            throw new Error('Invalid orientation: "' + this.options.orientation + '"');
        }
        return isVertical;
    },
    formId: function() {
        return 'formliciousForm_' + formId;
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

Template.formliciousTextareaField.events({
    'input textarea': function(e, tmpl) {
        updateTextareaCounter(tmpl);
    }
});
