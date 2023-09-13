
/*When you are trying to access an element that has a hidden duplicate, you get all elements of the same type, you filter the the visibile
(without display:none on them or parents) ones withnot() or filter() than u acces the wanted element and scroll it into the view and click it
*/
/*
Specific case where this helped:
I was trying to access in for loop elements of multi select. For Create choice it kept telling me that it has display:none, it was targeting other
element in the dom that had Create in it self but was not visible.
*/
Generic.selectDropdownItem().not(':hidden').contains(snakeCaseToAllCaps(verbs[i])).scrollIntoView().click({ force: true })

//alternative auth to cy.session
Cypress.Commands.add('getUserCookies', (email, password) => {
    cy.loginThroughUI(email, password)
    cy.getCookies().then((cookies) => {
        return cookies
    })
})

Cypress.Commands.add('setUserCookies', (cookies, url) => {
    cy.clearCookies()
    cookies.forEach((cookie) => {
        const { name, value, path, domain, secure, httpOnly, sameSite } = cookie;
        cy.setCookie(name, value, { path, domain, secure, httpOnly, sameSite });
    })
    if (url === undefined) {
        cy.visit(Cypress.env('app_base_url'))
    } else {
        cy.recurseVisit(url)
    }
})

//*********************************************************** */
//Function visits the page until the url matches the given one.
//Doesn't work with just the app_base_url because it leads to 
//either /workspace or /workospaceHandle/ which are not expected.
//Reduces flakyness because cy.visit inside setUserCookies seems 
//to sometimes not properly execute and lands on login page.
//*********************************************************** */
Cypress.Commands.add('recurseVisit', (url) => {
    recurse(
        () => {
            return cy.visit(url);
        },
        () => {
            return cy.url().then(url1 => {
                return url1 === url
            })
        },
        {
            log: true,
            limit: 5,
            timeout: 30000,
            delay: 300,
        }
    );
})



//email testing

//configs
const { defineConfig } = require("cypress");
const getLastEmail = require('./cypress/plugins/get-last-email');
const parseEmail = require('./cypress/plugins/parse-email')
const deleteUnseenEmails = require('./cypress/plugins/delete-email')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        generateOTP: require("cypress-otp"),
        async getLastEmail({ user, pass }) {
          const get_Email = await getLastEmail(user, pass)
          return get_Email
        },
        async parseEmail({ message }) {
          const parse_Email = await parseEmail(message)
          return parse_Email
        },
        async deleteUnseenEmails({ user, pass }) {
          const delete_Email = await deleteUnseenEmails(user, pass)
          return delete_Email
        }
      })
      require('@cypress/grep/src/plugin')(config);
    }
  },


//files

    //delet
    const { ImapFlow } = require("imapflow");

const deleteUnseenEmails = async (user, pass) => {
  let client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: user,
      pass: pass
    }
  });
  await client.connect();

  let result = false;

  await client.mailboxOpen("INBOX");

  try {//delete messages that are unseen
    result = await client.messageDelete({ seen: false });
  } catch (error) {
    console.error(error);
  } finally {
    await client.mailboxClose();
  }
  await client.logout();

  return result;
};

module.exports = deleteUnseenEmails;


//get
const { ImapFlow } = require("imapflow")

const getLastEmail = async (user, pass) => {
  debugger
  let client = new ImapFlow({
    host: "imap.gmail.com",//constant depending on service
    port: 993,
    secure: true,
    auth: {
      user: user,
      pass: pass
    }
  })
  await client.connect()

  let message

  let lock = await client.getMailboxLock("INBOX")

  try { //taking latest message
    message = await client.fetchOne(client.mailbox.exists, { source: true })
  } finally {
    lock.release()
  }

  await client.logout()

  if (!message)
    return message
  else
    return {
      uid: message.uid,
      source: message.source //email data - text, html, subject in raw form
    }
}

module.exports = getLastEmail


//parse
const simpleParser = require("mailparser").simpleParser

const parseEmail = async (message) => {
  const source = Buffer.from(message.source)
  const mail = await simpleParser(
    source
  )//raw data converted into an object
  return { //object with data needed for testing
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    attachments: mail.attachments
  }
}

module.exports = parseEmail


//in test
 const getLastEmail = (subject) => {
    //executes the task for set parameters until condition is met
    return recurse(
      () => {//task
        return cy.task("getLastEmail", { user: Cypress.env('imap_email'), pass: Cypress.env('imap_password') }).then((message) => {
          return cy.task("parseEmail", { message }).then((body) => {
            return body
          })
        })
      },
      (body) => body.subject === subject,//condition
      {//parameters
        log: true,
        limit: 5, // max number of iterations
        timeout: 30000, // time limit in ms
        delay: 500, // delay before next iteration, ms
      }
    )
  }

  const deleteUnseenEmails = () => {
    cy.task('deleteUnseenEmails', { user: Cypress.env('imap_email'), pass: Cypress.env('imap_password') }).then((result) => {
      expect(result).to.eq(true)
    })
  }


//custom error handling where for loop is used to do assertions but we don't want to test to fail before it trys all combinations
 cy.wait('@activityLogs').then((interception) => {
      let objectNames = interception.response.body.objectNames
      let errors = []
      for (let i = 0; i < objectNames.length; i++) {
        Activities.buttonFilterOrRefine().click()
        Activities.FilterDialog.buttonClear().click()
        Activities.FilterDialog.selectObject().click()
        Generic.selectDropdownItem().not(':hidden').contains(snakeCaseToAllCaps(objectNames[i])).scrollIntoView().click({ force: true })
        cy.contains('Filter or refine results').click()
        Activities.FilterDialog.buttonApply().click()
        cy.url().then(url => {
          if (url.includes(`objectName=${objectNames[i]}`)) {
            errors.push(objectNames[i])
          }
        })
      }
      cy.wrap(null).then(() => {
        if (errors.length > 0) {
          let errorMessage = ' '
          for (let i = 0; i < errors.length; i++) {
            errorMessage += `-Url doesn't contain ${errors[i]}-\n`
          }
          throw new Error(errorMessage)
        }
      })
    })


//advanced custom error handling
/// <reference types="cypress" />
let errors = []

/**
 * When test fails on any cypress command
 * this ensures that all custom errors will be shown
 * along with the cypress error of failed command.
 */

Cypress.on('fail', (error, runnable) => {
  let errorMessage = ' '
  if (errors.length > 0) {
    for (let i = 0; i < errors.length; i++) {
      errorMessage += `Url doesn't contain >>${errors[i]}<<\n`
    }
  }
  errors = []
  errorMessage += error.message
  throw new Error(errorMessage)
})

describe('Check my activities page', () => {
  let cookieList

  afterEach('Handle errors', () => {
    if (errors.length > 0) {
      let errorMessage = ' '
      for (let i = 0; i < errors.length; i++) {
        errorMessage += `Url doesn't contain >>${errors[i]}<<\n`
      }
      errors = []
      throw new Error(errorMessage)
    }
  })
    
it('Some test', ()=>{
    if(){
        errors.push('some error')
    }
})

})
