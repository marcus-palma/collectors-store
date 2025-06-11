"use strict";

///////////////////////////////////////////
//  Script scoped variables
///////////////////////////////////////////

// Server prefix URL kept in one place for appending filepaths easily 
const serverBaseURL = "http://localhost:8000"

// Map for keeping track of fetched data used for dynamic DOM manipulation
// Structure: URL<string>, { data:value<string>, inserted:value<boolean> }
let fetchedDataMap = new Map();

// DOM objects
let bodyElement;
let searchButtonMobile;

// Media Query List for narrow screens
let MediaQueryListNarrow;


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
//  Routine for switching HTML structure based on platform 
/////////////////////////////////////////////////////////////

function initializePlatformSwitch() {
    // Get <body> element as a target for inserting content
    bodyElement = document.querySelector("body");

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
    // Check MediaQueryList object
    let relativePath;
    if (mediaQueryListNarrow.matches) {
        relativePath = "/source/collectors-store/html/header_narrow.html";
    }
    else {
        relativePath = "/source/collectors-store/html/header_wide.html";
    }

    // Check if required data already is inserted into the DOM


    // Check if required data is already cached in this script context
    const url = serverBaseURL + relativePath;
    if (fetchedDataMap.has(url)) {
        // Then get the cached data for next step
        const dataRecord = fetchedDataMap.get(url);

        // Check if the required data is already inserted in the DOM
        if (dataRecord.inserted) {
            return;
        } else {
            // Otherwise, insert the required data into the DOM
            insertHTML(dataRecord.data);
        }
    } else {
        // Otherwise, fetch the data and then insert into the DOM
        fetchHTMLAndInsert(url);
    }
}

function fetchHTMLAndInsert (url) {
    if (url && typeof url === "string") {
        fetchHTML(url)
        .then((content) => {
            insertHTML(content, bodyElement, "div")
            return Promise.resolve(true);
        })
        .catch((error) => {
            console.error(`fetchHTMLAndInsert - Caught error while fetching and inserting HTML data: ${error}`)
        });
    } else {
        console.error("fetchHTMLAndInsert - HTMLFileName has a falsy value or is not a string type");
    }
}

function fetchHTML (url) {
    return fetch(url)
        .then((response) => {
            if (response.ok) {
                return response.text();    // TODO: Validation for HTML content
            }
            else {
                throw new Error(`HTTP error - status code: ${response.status}`);
            }
        })
        .catch((error) => {
            console.error(`fetchHTML - Caught error while fetching HTML data: ${error}`);
        })
}

function insertHTML (content, targetElement, containerType, sourceURL) {
    // Validate mandatory arguments
    if (!(content && targetElement && sourceURL)) {
        throw new Error("insertHTML function received mandatory arguments with at least one falsy value");
    }

    // Check if the optional argument containerType is specified in this function call
    if (typeof containerType !== "undefined") {
        
        // Wrap the HTML content by creating a container with specfied type
        const container = document.createElement(containerType);
        container.innerHTML = content;

        // Insert the wrapped HTML content into the target element
        targetElement.appendChild(container);

    } else {
        // Otherwise, just insert the HTML content directly into the target element
        targetElement.appendChild(content);
    }

    // Register the inserted HTML content and that it's currently used in the DOM
    fetchedDataMap.set(sourceURL, { data:content, inserted:true });

    return Promise.resolve(true);
}


///////////////////////////////////////////////////
//  Routine for search button in mobile version
///////////////////////////////////////////////////

function initializeSearchButtonMobile() {
    searchButtonMobile = document.querySelector("#nav-search-button.mobile");
    
    // Attach event listener to search button in mobile version
    const searchButtonType = typeof searchButtonMobile;
    if (searchButtonType !== "undefined" && searchButtonType !== "null" && searchButtonMobile != null) {  // TODO: better validation
        searchButtonMobile.addEventListener("click", handleSearchMobileClick);
    }
}

// Define event handler for search button in mobile version
function handleSearchMobileClick(event) {
    if (searchButtonMobile) {
        const display = searchButtonMobile.style.display;

        // Switch between "block" and "none" values from CSS property "display"
        // Background: HTML and CSS is already set up statically in files
        switch (display) {
            case "none":
                searchButtonMobile.style.display = "block";
                break;
            case "block":
                searchButtonMobile.style.display = "none";
        }
    } else {
        console.error("searchButtonMobile reference variable has a falsy value");
    }
}