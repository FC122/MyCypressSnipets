/**
 * When test fails on any cypress command
 * this ensures that all custom errors will be shown
 * along with the cypress error of failed command.
 */
/// <reference types="cypress" />
let errors = []

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
        if(true){
            errors.push('some error')
        }
    })

})