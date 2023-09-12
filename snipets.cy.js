
/*When you are trying to access an element that has a hidden duplicate, you get all elements of the same type, you filter the the visibile
(without display:none on them or parents) ones withnot() or filter() than u acces the wanted element and scroll it into the view and click it
*/
/*
Specific case where this helped:
I was trying to access in for loop elements of multi select. For Create choice it kept telling me that it has display:none, it was targeting other
element in the dom that had Create in it self but was not visible.
*/
Generic.selectDropdownItem().not(':hidden').contains(snakeCaseToAllCaps(verbs[i])).scrollIntoView().click({ force: true })
