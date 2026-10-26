$(function () {
  var $form = $('#regForm');
  var $errorBox = $('#errorBox');

  function showErrors(messages) {
    var html = '<strong>Please fix the following:</strong><ul>';
    $.each(messages, function (_, m) { html += '<li>' + $('<div>').text(m).html() + '</li>'; });
    html += '</ul>';
    $errorBox.html(html).prop('hidden', false);
    $('html, body').animate({ scrollTop: 0 }, 250);
  }

  function validate() {
    var errors = [];
    $form.find('.invalid').removeClass('invalid');

    function require(sel, msg) {
      var $el = $(sel);
      if (!String($el.val()).trim()) { $el.addClass('invalid'); errors.push(msg); return false; }
      return true;
    }

    require('#fullName', 'Full name is required.');

    if (require('#email', 'Email is required.') &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String($('#email').val()).trim())) {
      $('#email').addClass('invalid');
      errors.push('Enter a valid email address.');
    }

    if (require('#phone', 'Phone number is required.') &&
        !/^[0-9]{10}$/.test(String($('#phone').val()).trim())) {
      $('#phone').addClass('invalid');
      errors.push('Phone must be exactly 10 digits.');
    }

    require('#dob', 'Date of birth is required.');
    if (!$('input[name="gender"]:checked').length) errors.push('Select a gender.');
    require('#course', 'Select a course.');
    require('#address', 'Address is required.');
    if (!$('#agree').is(':checked')) errors.push('You must confirm the declaration.');

    return errors;
  }

  $form.on('submit', function (e) {
    e.preventDefault();
    $errorBox.prop('hidden', true);

    var errors = validate();
    if (errors.length) { showErrors(errors); return; }

    var $btn = $('#submitBtn').prop('disabled', true).text('Registering...');

    $.ajax({
      url: 'submit.php',
      method: 'POST',
      data: $form.serialize(),
      dataType: 'json'
    }).done(function (res) {
      if (res.success) {
        renderResult(res.data);
      } else {
        showErrors(res.errors || ['Submission failed.']);
      }
    }).fail(function (xhr) {
      var msg = 'Server error. Please try again.';
      if (xhr.responseJSON && xhr.responseJSON.errors) { showErrors(xhr.responseJSON.errors); }
      else { showErrors([msg]); }
    }).always(function () {
      $btn.prop('disabled', false).text('Register');
    });
  });

  function renderResult(d) {
    var rows = [
      ['Full name', d.fullName],
      ['Date of birth', d.dob],
      ['Gender', d.gender],
      ['Program', d.course],
      ['Topics', d.interests.length ? d.interests.join(', ') : 'None selected'],
      ['Email', d.email],
      ['Mobile number', d.phone],
      ['Address', d.address]
    ];
    var $table = $('#detailsTable').empty();
    $.each(rows, function (_, r) {
      // .text() escapes content, so user input can't inject HTML
      var $tr = $('<tr>');
      $('<th>').text(r[0]).appendTo($tr);
      $('<td>').text(r[1]).css('white-space', 'pre-line').appendTo($tr);
      $table.append($tr);
    });
    $('#refNo').text(d.reference);
    $('#submittedAt').text(d.submittedAt);
    $('#formSection').prop('hidden', true);
    $('#resultSection').prop('hidden', false);
    $('body').addClass('done');
    $('html, body').scrollTop(0);
  }

  $('#printBtn').on('click', function () { window.print(); });

  $('#backBtn').on('click', function () {
    $form[0].reset();
    $form.find('.invalid').removeClass('invalid');
    $('#resultSection').prop('hidden', true);
    $('#formSection').prop('hidden', false);
    $('body').removeClass('done');
    $('html, body').scrollTop(0);
  });
});