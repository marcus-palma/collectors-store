"use strict";

///////////////////////////////////////////
//  Script scoped variables
///////////////////////////////////////////

// Server prefix URL kept in one place for appending filepaths easily 
const serverBaseURL = "http://localhost:8000"

// Resource URLs
const headerNarrowHTMLURL = serverBaseURL + "/source/collectors-store/html/header_narrow.html";
const headerWideHTMLURL = serverBaseURL + "/source/collectors-store/html/header_wide.html";

// Map for keeping track of fetched data used for dynamic DOM manipulation
// Structure: URL<string>, { data:value<string>, inserted:value<boolean> }
const fetchedDataMap = new Map();

// Set for keeping track of inserted data in this script scope
/** @type {Set<URL>} */
const insertedDataSet = new Set();

// DOM objects
let searchButtonMobile;
let searchButtonContainerMobile;

// Media Query List for narrow screens
let mediaQueryListNarrow;


///////////////////////////////////////////
// Document load events
///////////////////////////////////////////

// Listen for DOMContentLoaded event
document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);

// Define event handler for DOMContentLoaded event
function handleDOMContentLoaded() {
    initializePlatformSwitch();
    
    // TODO: Defer this until mobile version is loaded
    // initializeSearchButtonMobile();
}


/////////////////////////////////////////////////////////////
//  Routine for switching HTML structure based on media
/////////////////////////////////////////////////////////////

function initializePlatformSwitch() {
    // Create MediaQueryList object for narrow screen
    mediaQueryListNarrow = matchMedia(
        "(width < 900px) or (orientation: portrait)"
    );

    // Attach event listener to the MediaQueryList object for resize event
    window.addEventListener("resize", handleResize);
    
    switchHeaderHTML();
}

// Routine when resize event fires
function handleResize(event) {
    switchHeaderHTML();
}

// Switch header component for wide and narrow screen version
function switchHeaderHTML() {
    // Check with MediaQueryList object if the screen size is narrow
    let url;
    if (mediaQueryListNarrow.matches) {
        url = headerNarrowHTMLURL;
    }
    else {
        url = headerWideHTMLURL;
    }

    // Check if the required data is already inserted into the DOM
    if (insertedDataSet.has(url)) {
        return;
    } 

    // Check if required data is already cached in this script scope    
    if (fetchedDataMap.has(url)) {
        // Then get the cached data for next step
        const fetchRecord = fetchedDataMap.get(url);

        // Insert the cached HTML data
        insertHTML(fetchRecord, document.body, "div", url)
        .then(headerOnDOMInsert)
        .catch((error) => console.error(`switchHeaderHTML - Caught error in Promise chain after insertHTML: ${error}`));
    } else {
        // Otherwise, fetch the data and then insert into the DOM
        fetchHTMLAndInsert(url)
        .then(headerOnDOMInsert)
        .catch((error) => console.error(`switchHeaderHTML - Caught error in Promise chain after fetchHTMLandInsert: ${error}`));
    }
}

function fetchHTMLAndInsert (url) {
    if (url && typeof url === "string") {
        return fetchHTML(url)
        .then((content) => {
            insertHTML(content, document.body, "div", url)
            .catch((error) => {
                console.error(`fetchHTMLAndInsert - Caught error while inserting HTML: ${error}`)
            });
        })
        .catch((error) => {
            return Promise.reject(`fetchHTMLAndInsert - Caught error while fetching and inserting HTML data: ${error}`);
        });
    } else {
        return Promise.reject("fetchHTMLAndInsert - HTMLFileName has a falsy value or is not a string type");
    }
    // Fallback return for any potential future coding mistakes, to make debugging easier
    return Promise.reject("fetchHTMLAndInsert - fallback return. This should not fire");
}

function fetchHTML (url) {
    return fetch(url)
        .then((response) => {
            if (response.ok) {
                return response.text();
                //return Promise.resolve(response.url, response.text());
            }
            else {
                Promise.reject(`HTTP error - status code: ${response.status}`);
            }
        })
        .then((content) => {
            // Cache the fetched HTML content
            // Warning: responseURL may be altered by redirects, potentially different from sourceURL
            //fetchedDataMap.set(responseURL, content);

            // Return back to outer promise chain with resolve promise
            return Promise.resolve(content);
        })
        .catch((error) => {
            console.error(`fetchHTML - Caught error while fetching HTML data: ${error}`);
        })
}

/** @param {string} content
* @param {object} targetElement
* @param {string} containerType - (optional)
* @param {string} sourceURL
* @param {boolean} doReplace
*/
function insertHTML (content, targetElement, containerType, sourceURL) {
    // Validate mandatory arguments
    if (!(content && targetElement && sourceURL)) {
        // An outer catch promise is expected to handle this throwing error
        return Promise.reject("insertHTML - mandatory arguments have at least one falsy value");
    }

    // Check if the optional argument containerType is specified in this function call
    if (typeof containerType !== "undefined") {
        
        // Wrap the HTML content by creating a container with specfied type
        //const container = document.createElement(containerType);
        //container.innerHTML = content;
        const wrappedContent = `<${containerType}>${content}</${containerType}>`;

        // Insert the wrapped HTML content into the target element
        targetElement.innerHTML = wrappedContent;

    } else {
        // Otherwise, just insert the HTML content directly into the target element
        targetElement.innerHTML = content;
    }

    // Cache the fetched HTML content
    fetchedDataMap.set(sourceURL, content);

    // Return back to outer promise chain with resolve promise
    return Promise.resolve(sourceURL);
}

function headerOnDOMInsert(insertedURL) {
    // Check if the mobile header HTML was currently inserted
    if (insertedURL == headerNarrowHTMLURL) {
        initializeSearchButtonMobile();
    }

    // Check if the mobile header HTML has been replaced by any other header representation
    else if (insertedDataSet.has(headerNarrowHTMLURL)) {
        searchButtonMobileOnRemove();

        // Finally, delete it from the set
        insertedDataSet.delete(headerNarrowHTMLURL);
    }

    // Check if the wide header HTML has been replaced by any other header representation
    if (insertedURL != headerWideHTMLURL && insertedDataSet.has(headerWideHTMLURL)) {
        // Then delete it from the set
        insertedDataSet.delete(headerWideHTMLURL);
    }

    // Finally, after using the set of inserted data, add the currently inserted URL into the set
    insertedDataSet.add(insertedURL);

    // Return outer promise chain with a resolve promise
    return Promise.resolve(true);
}


///////////////////////////////////////////////////
//  Routine for search button in mobile version
///////////////////////////////////////////////////

// Routine needs to be run everytime the mobile representation of the header component is loaded
function initializeSearchButtonMobile() {
    searchButtonMobile = document.querySelector("#nav-search-button.mobile");
    searchButtonContainerMobile = document.querySelector("#nav-search-bar-container");

    // Validate the mobile search button element variable, otherwise, do nothing. TODO: improve validation
    const searchButtonType = typeof searchButtonMobile;
    if (typeof searchButtonMobile !== "undefined" && typeof searchButtonMobile !== "null" && searchButtonMobile != null) {
        // Check if the mobile search button mobile element is currently inserted into the DOM
        if (document.body.contains(searchButtonMobile)) {
            // Attach event listener to search button in mobile version
            searchButtonMobile.addEventListener("click", handleSearchClickMobile);
        } else {
            console.error("initializeSearchButtonMobile - Expected mobile search button element to be a descendant of body element, but returned false");
        }
    } else {
        console.error("initializeSearchButtonMobile - Expected to find mobile search button element, but failed");
    }
}

function searchButtonMobileOnRemove() {
    searchButtonMobile.removeEventListener("click", handleSearchClickMobile);
}

// Define event handler for search button in mobile version
function handleSearchClickMobile(event) {
    if (searchButtonContainerMobile) {
        const display = searchButtonContainerMobile.style.display;

        // Switch between "block" and "none" values from CSS property "display"
        // Background: HTML and CSS is already set up statically in files
        switch (display) {
            case "none":
                searchButtonContainerMobile.style.display = "block";
                break;
            case "block":
                searchButtonContainerMobile.style.display = "none";
                break;
            default:
                searchButtonContainerMobile.style.display = "block";
        }
    } else {
        console.error("searchButtonMobile reference variable has a falsy value");
    }
}