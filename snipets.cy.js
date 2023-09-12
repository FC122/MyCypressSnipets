
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
