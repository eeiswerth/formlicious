FormliciousUtils = {

  _count: 0,

  getCount: function() {
    return this._count++;
  },

  formatFilename: function(filename, containerWidth) {
    var width = containerWidth / 10;
    if (filename.length <= width) {
      return filename;
    }

    filename = filename.substring(0, width);
    return filename + '...';
  },

  getApi: function() {
    var tmpl = Template.instance();
    var view = tmpl.view;
    var api;
    while (!api && view) {
      if (view.name === 'Template.formlicious') {
        api = view.formlicious._api;
      } else {
        view = view.parentView;
      }
    }
    if (!api) {
      debugger;
    }
    return api;
  }

};


DropzoneUtils = {
  uploadFiles: function(files) {
    var self = this;
    var minSteps = 6;
    var maxSteps = 60;
    var timeBetweenSteps = 100;
    var bytesPerStep = 100000;
    var totalSteps;

    for (var i = 0; i < files.length; i++) {

      var file = files[i];
      totalSteps = Math.round(Math.min(maxSteps, Math.max(minSteps, file.size / bytesPerStep)));

      for (var step = 0; step < totalSteps; step++) {
        var duration = timeBetweenSteps * (step + 1);
        setTimeout(function (file, totalSteps, step) {
          return function () {
            file.upload = {
              progress: 100 * (step + 1) / totalSteps,
              total: file.size,
              bytesSent: (step + 1) * file.size / totalSteps
            };

            self.emit('uploadprogress', file, file.upload.progress, file.upload.bytesSent);
            if (file.upload.progress == 100) {
              file.status = Dropzone.SUCCESS;
              self.emit("success", file, 'success', null);
              self.emit("complete", file);
              self.processQueue();
            }
          };
        }(file, totalSteps, step), duration);
      }
    }
  }
};