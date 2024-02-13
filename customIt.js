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