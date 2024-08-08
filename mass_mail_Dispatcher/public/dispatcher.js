const message = document.querySelector('#report');
document.getElementById('file').addEventListener('change', function() {
  const fileName = this.files.length > 0 ? this.files[0].name : 'No file selected';
  document.getElementById('fileName').textContent = fileName;
});

document.getElementById('uploadForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'sending') {
      message.innerHTML = 'Sending Emails ...'
    }

    const invalidEmailsTextArea = document.getElementById('invalidEmails');
    invalidEmailsTextArea.value = data.invalidEmails.join('\n');
    message.innerHTML = 'Emails Sent Successful';
  })
  .catch(error => console.error('Error:', error));
});
