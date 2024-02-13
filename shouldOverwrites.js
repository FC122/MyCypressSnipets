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