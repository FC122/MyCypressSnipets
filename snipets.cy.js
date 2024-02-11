/*
When you are trying to access an element that has a hidden duplicate, you get all elements of the same type, you filter the the visibile
(without display:none on them or parents) ones withnot() or filter() than u acces the wanted element and scroll it into the view and click it
Specific case where this helped:
I was trying to access in for loop elements of multi select. For Create choice it kept telling me that it has display:none, it was targeting other
element in the dom that had Create in it self but was not visible.
*/
Generic.selectDropdownItem().not(':hidden').contains(snakeCaseToAllCaps(verbs[i])).scrollIntoView().click({ force: true })

/*alternative auth to cy.session*/
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
        if(){
            errors.push('some error')
        }
    })

})

/**
 * Function checks that element is not shown by element not existing or not being visible 
 */
const shouldNotBeShown = (subject) => () => {
    const isHiddenByParent = (element) => {
        if (!element || element.length === 0) {
            return false; // Element doesn't exist or reached the root
        }
        const display = element.css('display');
        const visibility = element.css('visibility');
        if (display === 'none' || visibility === 'hidden') {
            return true; // Element is hidden by a parent
        }
        return isHiddenByParent(element.parent()); // Recursively check parent elements
    };

    if (isHiddenByParent(subject) || subject.length === 0) {
        //Button is not shown
        expect(true).to.be.true;
    } else {
        //Throw custom error
        throw new Error('Element is shown when it should not be.');
    }
}

/*For adding overwrites so you can define one overwrite and then just refernece functions inside*/
Cypress.Commands.overwrite('should', (originalFn, subject, expectation, ...args) => {
    const customMatchers = {
        'not.be.shown': shouldNotBeShown(subject, 'not')
    };
    // See if the expectation is a string and if it is a member of Jest's expect
    if (typeof expectation === 'string' && customMatchers[expectation]) {
        return originalFn(subject, customMatchers[expectation]);
    }
    return originalFn(subject, expectation, ...args);
});

/*Checking if checkbox is checked*/
Products.input_regionLocked().then(($element) => {
    const isChecked = $element.find('path.checkbox-check').attr('fill') === '#fff';
    Cypress.log({
        name: 'checkIfElementSelected',
        message: isChecked ? 'Element is selected (checked).' : 'Element is not selected (unchecked).',
    });
    expect(isChecked).to.be.true;
});

/** Experimental function
 * Wrapped it function that allowes chaining after to it 
 * so in the case where we have only a one cleanup or
 * multiple different ones we can define different after 
 * for each one
 * 
 * use:
 * custom.it('Test name', ()=>{
 *  //test
 * }).after(()=>{
 *  //cleanup
 * })
 * 
 * custom.only('Test name', ()=>{
 *  //test
 * }).after(()=>{
 *  //cleanup
 * })
 */
export const custom = {
    it: (name, testFn) => extendedIt(name, testFn, false),
    only: (name, testFn) => extendedIt(name, testFn, true)
};

function extendedIt(name, testFn, isOnly = false) {
    const wrappedTest = (isOnly ? it.only : it)(name, function () {
        let dataToPass;
        if (testFn) {
            dataToPass = testFn();
            cy.log(dataToPass);
        }
        this.dataToPass = dataToPass;
        this.afterEachCallback = null;
    });
    wrappedTest.after = (callback) => {
        wrappedTest.afterEachCallback = callback;
    };
    afterEach(function () {
        if (this.currentTest.state === 'failed' || this.currentTest.state === 'passed') {
            if (this.currentTest.title === name && this.currentTest.afterEachCallback) {
                this.currentTest.afterEachCallback(this.dataToPass);
            }
        }
    });
    return wrappedTest;
}
