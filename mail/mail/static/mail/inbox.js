document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(prefill = {}) {

  // Show compose view and hide other views
  document.querySelector('#email-display').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = prefill.recipients || '';
  document.querySelector('#compose-subject').value = prefill.subject || '';
  document.querySelector('#compose-body').value = prefill.body || '';



  document.querySelector('#compose-form').onsubmit =  event => {
      event.preventDefault();
      fetch('/emails', {
        method:'POST',
        body:JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);

    load_mailbox('sent');
  });
  };
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#email-display').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

   // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach (email => {
    //print emails
    // Loop through the fetched emails and add them into HTML elements
          console.log(email.sender, email.subject, email.timestamp);
          const element = document.createElement('div');
          element.className = "email-design";

          if(email.read) {
            element.classList.add('read');
          } else {
            element.classList.add('unread');
          }
          

          element.innerHTML = `
          <div>
           <strong>${email.sender}</strong>
            ${email.subject}
            ${email.timestamp}
          </div>
          `;

          element.addEventListener('click', () => {
             view_email(email.id, mailbox)
          });
          document.querySelector('#emails-view').append(element);
          
          
      });
          

  });
}

function view_email(id, mailbox) {

document.querySelector('#email-display').style.display = 'block';
document.querySelector('#emails-view').style.display = 'none';
document.querySelector('#compose-view').style.display = 'none';

fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
  document.querySelector('#email-display').innerHTML = `
  <b>From: </b>${email.sender}<br>
  <b>To: </b>${email.recipients}<br>
  <b>Subject: </b>${email.subject}<br> 
  <b>Timestamp: </b>${email.timestamp}<br><br>
  ${email.body}
   `;

  fetch(`/emails/${id}`, {
    method:'PUT',
    body: JSON.stringify({
      read: true
    })
  });



  
const display = document.querySelector('#email-display');

if (!email.archived && mailbox !== 'sent') {

  const archiveButton = document.createElement('button');
  archiveButton.innerText = "Archive";
  archiveButton.className = "btn btn-sm btn-outline-primary";

  archiveButton.addEventListener('click', () => {
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
    .then(() => load_mailbox('inbox'));
  });
  
  display.append(archiveButton);
}



  
if(email.archived && mailbox !== 'sent') {
  const unarchiveButton = document.createElement('button');
  unarchiveButton.innerText = "Dearchive";
  unarchiveButton.className = "btn btn-sm btn-outline-primary";

  unarchiveButton.addEventListener('click', () => {
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    }) 
    .then(() => load_mailbox('inbox'));

  });

  display.append(unarchiveButton);
}

if (mailbox === 'inbox') {
  const replyButton = document.createElement('button');
  replyButton.innerText = "Reply";
  replyButton.className = "btn btn-sm btn-outline-primary";

  replyButton.addEventListener('click', () => {
  compose_email({
    recipients: email.sender,
    subject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
    body: `\n\nOn ${email.timestamp} ${email.sender} wrote:\n${email.body}`
  });

  });
  
  display.append(replyButton);
}


  });
} 

    

