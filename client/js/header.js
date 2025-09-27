// The "Header" feature.
// Purpose:
// - Be available on top of each web page related to shopping
// - Display the logo and title of the e-commerce store
// - Provide navigation over the website, linking to neccessary web pages
// - Display the current status of the shopping, such as the number of items added in the "Shopping Cart" feature
// Dependency: The Header is a module, and is used in all pages related to shopping

"use strict";

///////////////////////////////////////////
//  Script scoped variables
///////////////////////////////////////////

// Resource URLs
const headerNarrowHTMLURL = "/source/collectors-store/client/html/header_narrow.html";
const headerWideHTMLURL = "/source/collectors-store/client/html/header_wide.html";

// Map for keeping track of fetched data used for dynamic DOM manipulation
// Structure: URL<string>, { data:value<string>, inserted:value<boolean> }
const fetchedDataMap = new Map();

// Set for keeping track of inserted data in this script scope
/** @type {Set<URL>} */
const insertedDataSet = new Set();

// DOM objects
let mobileSearchButton;
let mobileSearchButtonContainer;

// Media Query List for narrow screens
let mediaQueryListNarrow;

// A boolean for marking when the header waiting for a switch. To be used as a gate-keeper, because the routines involve asynchronous microtasks and animation frame requests
let isWaitingForHeaderSwitch = false;


///////////////////////////////////////////
// Initialize functionality
///////////////////////////////////////////

// When this script file is run, do setup work
initializePlatformSwitch();


/////////////////////////////////////////////////////////////
//  Routine for switching HTML structure based on media
/////////////////////////////////////////////////////////////

// One-time setup for header for switchHeaderHTML routine
function initializePlatformSwitch() {
    // Create MediaQueryList object for narrow screen
    mediaQueryListNarrow = matchMedia(
        "(width <= 1080px) and (max-aspect-ratio: 6/7)"
    );

    // Attach event listener to the MediaQueryList object for resize event
    window.addEventListener("resize", handleResize);
    
    // Initialize header representation by running the switch function
    switchHeaderHTML();
}

// Routine when resize event fires
function handleResize(event) {
    switchHeaderHTML();
}

// Switch or initialize header component for wide and narrow screen version
// Instruction: Run this at least once after the DOM is loaded, and let "resize" event run this for updates
function switchHeaderHTML() {
    // Check with MediaQueryList object if the screen size is narrow
    let url;
    if (mediaQueryListNarrow.matches)   url = headerNarrowHTMLURL;
    else                                url = headerWideHTMLURL;

    // Check if there currently is a call of this function, already waiting to finish
    // Check if the required data is already inserted into the DOM
    // Then do no changes in header and return
    if (isWaitingForHeaderSwitch || insertedDataSet.has(url)) return;

    // Proceed attempt to change the header
    // Activate gate keeper
    isWaitingForHeaderSwitch = true;

    // Check if required data is already cached in this script scope    
    const insertPromise = new Promise((resolve, reject) => {
        if (fetchedDataMap.has(url)) {
            // Then get the cached data and resolve with it as "HTMLData" argument
            const fetchRecord = fetchedDataMap.get(url);
            resolve(fetchRecord);
        } else {
            // Otherwise, fetch the HTML data and resolve with the result
            fetchHTML(url)
            .then((HTMLData) => {
                // Cache the fetched HTML data
                fetchedDataMap.set(url, HTMLData);

                // Resolve the promise executor with the fetched HTML data
                resolve(HTMLData);
            })
            .catch((error) => reject(`switchHeaderHTML - Caught error when fetching HTML data: ${error}`));
        }
    })
    // After getting HTML Data, pre-render it before inserting
    .then((HTMLData) => preRenderHTMLAndInsert(HTMLData, "div", "100vw", "6rem", (container) => {
        // Defining the onInsert callback function for preRenderHTMLAndInsert function
        // Replace existing child node with the pre-rendered container
        document.body.replaceChild(container, document.body.firstChild);
    }))
    .then(() => {
        // After inserting the HTML data, run OnDomInsert routine of header
        try { headerOnDOMInsert(url) }
        catch (e) { return Promise.reject(`switchHeaderHTML - Caught error when calling HeaderOnDOMInsert function: ${error}`) }
    })
    .catch((error) => console.error(`switchHeaderHTML - Caught error at the end of promise chain: ${error}`))
    // And finally, reset the gate-keeping boolean to allow new attempts
    .finally(() => isWaitingForHeaderSwitch = false);
}

// Generalized utility function for fetching HTML data
function fetchHTML (url) {
    return fetch(url)
        .then((response) => {
            if (response.ok) return response.text();
            else return Promise.reject(`fetchHTML - HTTP error with status code: ${response.status}`);
        })
        .catch((error) => Promise.reject(`fetchHTML - Caught error while fetching HTML data: ${error}`));
}

/** Generalized utility function for inserting HTML data directly into the DOM. Returns true on success, throws error on failure
* @param {string} content
* @param {object} targetElement
* @param {string} containerType - (optional)
* @param {string} sourceURL
*/
function insertHTMLDirectly (content, targetElement, containerType, sourceURL) {
    // Validate mandatory arguments
    if (!(content && targetElement && sourceURL)) { throw "insertHTML - mandatory arguments have at least one falsy value" };

    // Check if the optional argument containerType is specified in this function call
    if (typeof containerType !== "undefined") {
        
        // Wrap the HTML content with the specfied container element type 
        const wrappedContent = `<${containerType}>${content}</${containerType}>`;

        // Insert the wrapped HTML content into the target element
        targetElement.innerHTML = wrappedContent;

    } else {
        // Otherwise, just insert the HTML content directly into the target element
        targetElement.innerHTML = content;
    }

    // Cache the fetched HTML content
    fetchedDataMap.set(sourceURL, content);

    // Return true for success
    return true;
}

/** Utility function for pre-rendering HTML data off-screen and then inserting it to the DOM. Returns the resulting element after waiting for one MutationObserver and two requestAnimationFrame callbacks.
* @param {string} content
* @param {string} containerType
* @param {string} CSSWidth - CSS text
* @param {string} CSSHeight - CSS text
* @param {function} onInsert - Callback for defining the behavior of inserting the resulting element. Allows optimal timing for insertion and internal cleanup
*/
function preRenderHTMLAndInsert (content, containerType, CSSWidth, CSSHeight, onInsert) {
    // Validate mandatory arguments
    if (!(content && containerType, CSSWidth, CSSHeight)) return Promise.reject("preRenderHTML - mandatory arguments have at least one falsy value");
    if (typeof content !== "string") return Promise.reject("preRenderHTML - content argument is not a string");
    if (typeof containerType !== "string") return Promise.reject("preRenderHTML - containerType argument is not a string");
    if (typeof CSSWidth !== "string") return Promise.reject("preRenderHTML - CSSWidth argument is not a string");
    if (typeof CSSHeight !== "string") return Promise.reject("preRenderHTML - CSSHeight argument is not a string");
    if (typeof onInsert !== "function") return Promise.reject("preRenderHTML - onInsert argument is not a function");

    // Create container element specified as argument and validate the result
    const container = document.createElement(containerType);
    if (container === null) return Promise.reject("insertHTMLWithObserver - createElement resulted in a null element");
    
    // Setup container to render HTML data off-screen before presentation
    container.style.cssText = `
        display: block;
        position: absolute;
        top: -5000px;
        width: ${CSSWidth};
        height: ${CSSHeight};
        `

    // Add container to the DOM for pre rendering
    document.body.appendChild(container);

    // Use a Mutation Observer to wait for the inserted HTML data to be parsed the user agent. Layout would be finished
    return new Promise ((resolve, reject) => {
        const observer = new MutationObserver(() => {
            // Once fired, disconnect the observer
            observer.disconnect();
            
            // After waiting for Mutation Observer, wait more for two animation frames
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Call onInsert callback before doing cleanup
                    onInsert(container);

                    // Unset container style after rendering HTML data off-screen
                    container.removeAttribute("style");

                    // Continue outer promise chain
                    resolve(container);
                })
            })
        })

        // After setting up the observer, activate it
        observer.observe(container, {
            subtree: true,
            childList: true
        });

        // After activating the observer, insert the HTML data into the created container
        container.innerHTML = content;
    });
}

// Work on header to run after inserting HTML into the DOM. Returns true on success, throws error on failure
function headerOnDOMInsert(insertedURL) {
    // Check if the inserted URL argument is undefined, then throw error to outer caller
    if (typeof insertedURL === "undefined") throw "headerOnDOMInsert - insertedURL argument is undefined";

    // Check if the mobile header HTML was currently inserted
    if (insertedURL == headerNarrowHTMLURL) {
        initializeMobileSearchButton();
    }

    // Check if the mobile header HTML has been replaced by any other header representation
    else if (insertedDataSet.has(headerNarrowHTMLURL)) {
        // Then call the OnRemove routine for mobile search button
        mobileSearchButtonOnRemove();
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

    // Remove in-line size attributes on img elements
    removeImgSizeAttributes();

    // Return true for success
    return true;
}


///////////////////////////////////////////////////
//  Routine for search button in mobile version
///////////////////////////////////////////////////

// Routine needs to be run everytime the mobile representation of the header component is loaded
function initializeMobileSearchButton() {
    mobileSearchButton = document.querySelector("#nav-search-button.mobile");
    mobileSearchButtonContainer = document.querySelector("#nav-search-bar-container");

    // Validate the mobile search button element variable, otherwise, do nothing. TODO: improve validation
    const searchButtonType = typeof mobileSearchButton;
    if (typeof mobileSearchButton !== "undefined" && typeof mobileSearchButton !== "null" && mobileSearchButton != null) {
        // Check if the mobile search button mobile element is currently inserted into the DOM
        if (document.body.contains(mobileSearchButton)) {
            // Attach event listener to search button in mobile version
            mobileSearchButton.addEventListener("click", handleMobileSearchClick);
        }
        else console.error("initializeSearchButtonMobile - Expected mobile search button element to be a descendant of body element, but returned false");
    }
    else console.error("initializeSearchButtonMobile - Expected to find mobile search button element, but failed");
}

// Work to do after removing mobile search button
function mobileSearchButtonOnRemove() {
    mobileSearchButton.removeEventListener("click", handleMobileSearchClick);
}

// Define event handler for search button in mobile version
function handleMobileSearchClick(event) {
    if (mobileSearchButtonContainer) {
        // Switch between "block" and "none" values from CSS property "display"
        // Reason: HTML and CSS for both states are already set up statically in files, and only needs a switch on display property
        const currentDisplay = mobileSearchButtonContainer.style.display;
        let newDisplay;
        switch (currentDisplay) {
            case "none":
                newDisplay = "block";
                break;
            case "block":
                newDisplay = "none";
                break;
            default:
                newDisplay = "block";
        }
        mobileSearchButtonContainer.style.display = newDisplay;
    }
    else console.error("searchButtonMobile reference variable has a falsy value");
}

// Remove HTML in-line size attributes on <img> elements, that were added to prevent the images from flashing in large size when inserting HTML into the DOM. This may enable responsive size and stylesheets to override rules
function removeImgSizeAttributes () {
    // Before removing, wait two animation frames to give time for CSS stylesheet to load properly
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
        try {
            // Get all <img> elements with width attribute, assuming that height attribute also is specified for those
            const imgs = document.body.querySelectorAll("img[width]");
            
            // Validate the returned collection
            if (typeof imgs === "undefined") return;

            for (const img of imgs) {
                // Validate the entry
                if (typeof img === "undefined" && img === null) continue;

                // Remove both width and heigth attributes from element
                img.removeAttribute("width");
                img.removeAttribute("height");
            }
        } catch (e) { console.error(`removeImgSizeAttributes - Caught error: ${e}`) }
        })
    })
}