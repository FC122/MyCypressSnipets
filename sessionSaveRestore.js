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
