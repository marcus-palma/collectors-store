"use strict";

// Important variables
const serverBaseURL = "http://localhost:8000"


/////////////////////////////////////////////////////////////
//  Routine for switching HTML structure based on platform 
//

// Get header slot element
const bodyElement = document.querySelector("body");

// Create MediaQueryList object for narrow screen
const mediaQueryListNarrow = matchMedia(
    "(width < 900px) or (orientation: portrait)"
);

// Attach event listener to the MediaQueryList object for resize event
window.addEventListener("resize", handleResize);

switchHeaderHTMLFile();

// Routine when resize event fires
function handleResize(event) {
    switchHeaderHTMLFile();
}

// Switch header component for wide and narrow screen version
function switchHeaderHTMLFile() {
    // Check MediaQueryList object
    let HTMLFileRelativePath;
    if (mediaQueryListNarrow.matches) {
        HTMLFileRelativePath = "/source/collectors-store/html/header_narrow.html";
    }
    else {
        HTMLFileRelativePath = "/source/collectors-store/html/header_wide.html";
    }
    fetchHTMLFileAndInsertContentIntoSlot(HTMLFileRelativePath);
}

function fetchHTMLFileAndInsertContentIntoSlot (HTMLFileRelativePath) {
    if (HTMLFileRelativePath && typeof HTMLFileRelativePath === "string") {
        fetchHTMLFile(HTMLFileRelativePath)
        .then((HTMLContent) => {
            insertHTMLContentIntoSlot(HTMLContent, "div", bodyElement)
        })
        .catch((error) => {
            console.error(`fetchHTMLFileAndInsertContentIntoSlot - Thrown error in promise chain: ${error}`)
        });
    } else {
        console.error("fetchHTMLFileAndInsertContentIntoSlot - HTMLFileName has a falsy value or is not a string type");
    }
}

function fetchHTMLFile (HTMLRelativePath) {
    const url = `${serverBaseURL}/${HTMLRelativePath}`;
    return fetch(url)
        .then((response) => {
            if (response.ok) {
                return response.text();    // TODO: Validation for HTML content
            }
            else {
                throw new Error(`HTTP error - status code: ${response.status}`);
            }
        })
    // Note: This function does not catch its own errors. Error handling needs to be deferred to outer function.  
}

function insertHTMLContentIntoSlot (HTMLContent, containerType, slotElement) {
    if (HTMLContent && containerType && slotElement) {
        const container = document.createElement(containerType);
        container.innerHTML = HTMLContent;
        slotElement.appendChild(container);
        return Promise.resolve(true);
    } else return Promise.reject("insertHTMLContentIntoSlot function received arguments with at least one falsy value");
}

/////////////////////////////////////////////////////////////


///////////////////////////////////////////////////
//  Routine for search button in mobile version
//

// Get search button in mobile version
const searchButtonMobile = document.querySelector("#nav-search-button.mobile");

// Attach event listener to search button in mobile version
const searchButtonType = typeof searchButtonMobile;
if (searchButtonType !== "undefined" && searchButtonType !== "null" && searchButtonMobile != null) {  // Needs better validation
    searchButtonMobile.addEventListener("click", handleSearchButtonClick);
}

// Define event handler for search button in mobile version
function handleSearchButtonClick(event) {
    if (searchButtonMobile) {
        const display = searchButtonMobile.style.display;

        // Switch between "block" and "none" values from CSS property "display"
        // Background: HTML and CSS is already set up statically in files
        switch (display) {
            case "none":
                searchbuttonMobile.style.display = "block";
                break;
            case "block":
                searchbuttonMobile.style.display = "none";
        }
    } else {
        console.error("searchButonMobile reference variable has a falsy value");
    }
}

///////////////////////////////////////////////////