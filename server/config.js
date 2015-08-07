/**
 * Setup our dummy router for file uploads. This is here to keep dropzone happy. Dropzone needs a URL. We use a dummy
 * URL that does nothing except keep the HTTP responses looking good.  The actual uploads are handled outside of
 * dropzone (i.e., Slingshot).
 */
Router.route('/dummy', {where: 'server'})
  .post(function() {
    this.response.statusCode = 200;
    this.response.end('');
  });