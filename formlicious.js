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
    }
});

Template.formliciousFields.helpers({
    inputType: function() {
        console.log(this);
        return !this.type || this.type === 'input';
    }
});

