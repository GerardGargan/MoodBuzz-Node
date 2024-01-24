document.addEventListener('DOMContentLoaded', () => {

    //get all range elements on the page
    const rangeItems2 = document.querySelectorAll('input[type="range"]');
    //loop through each range element, add an input event listener so that when the slider is moved, we update the div showing the current number selected
    rangeItems2.forEach((range) => {
        range.addEventListener('input', (event) => {
            let displayVal = document.getElementById(`${range.id}-val-display`);
            displayVal.textContent = `${range.value}`;
        })
    })

    //obtain the reset button, range sliders, checkboxes and notes input elements
    const resetButton = document.getElementById('resetbutton');
    const rangeItems = document.querySelectorAll('input[type="range"]');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const notes = document.getElementById('notes');

    //add an event listener to the reset button for a click event
    resetButton.addEventListener('click', (event) => {
        //prevent the default behaviour of a button to submit the form
        event.preventDefault();
        //loop through all range sliders and reset to the default of 5
        rangeItems.forEach((rangeItem) => {
            const valueDiv = document.getElementById(`${rangeItem.id}-val-display`);
            rangeItem.value = 5;
            valueDiv.innerHTML = `<h3 class="bg-dark text-light p-3 rounded">5</h3>`;
        });

        //reset all checkboxes to unchecked
        checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
        });

        //set notes to be empty
        notes.value = '';
    });
});

