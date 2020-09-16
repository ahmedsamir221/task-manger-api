const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)



const welcomeEmailMessage = (email , name) => {
  sgMail.send({
    to: email,
    from: 'asamir2211997@gmail.com',
    subject: 'welcome message',
    text: `hello ${name} , welcome to our APP`
  })
}


const deleteEmailMessage = (email , name) => {
  sgMail.send({
    to: email,
    from: 'asamir2211997@gmail.com',
    subject: 'delete message',
    text: `we wait you another time  ${name}`
  })
}

module.exports = {
  welcomeEmailMessage,
  deleteEmailMessage
}
