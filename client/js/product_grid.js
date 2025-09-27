// The "Product Grid" feature
// The purpose of this feature is to act as a dynamic, functional container for multiple instances of "Product Entries" feature, allowing the user to browse between the shopping items with 
// Two examples of usages are:
// - Present results of Product Entries in a 2D-grid on the entire device screen.
// - Showcase Product Entries inside of a one-dimensional segment of a document.
// Dependency: The Product Grid is a module and is used in web pages where shopping items needs to be presented in a concise manner, such as the "Home Page" and the "Query Results Body"
// Options: The Product Grid allows to pass options to the constructor, opening up for multiple use cases. To see what options are available, please refer to "gridOptions".

"use strict";

////////////////////////////////////////
// Modules
////////////////////////////////////////

export {
    /** Remove this JSDoc comment later
     * @function
     * @param {string}          growthDirectionParam
     * @param {number}          maxProductsParam    
     * @param {boolean}         enablePages         
     * @param {productQueryOptions}    initialQuery    
     */
    initializeGrid as initialize,
    requestToFetchAndPropagateGrid as requestToPropagate,
};

// Wait for Product Entry script to evaluate before proceeding. It will define a Custom Element in the registry, register Event Listeners and load its dependencies
import "/source/collectors-store/client/js/product_entry.js";

// Use shared Media Query List objects for a unified definition of media breakpoints across the application 
import { MediaQueryListNarrow } from "/source/collectors-store/client/js/media_query_lists.js";

import { applyProductFilterMenuTemplate } from "/source/collectors-store/client/js/product_filter_menu.js";


////////////////////////////////////////
// Data Structures
////////////////////////////////////////

/** The data structure of options for initializing a "Product Grid"
 * @typedef {object} gridOptions
 * @property {string} growthDirection   - ("vertical" | "horizontal") Control which direction the grid grows in size, internally, and how it adapts externally. "vertical" mode wraps the content into new rows. The actual height depends on the number of rows. "horizontal" mode will overflow internally in horizontal direction, enabling scrolling. The actual height is always one row. Every mode has a width that fits 100% of the container.
 * @property {number} maxProducts       - (number ≤ 0 | number ≥ 1) Limit the number of products that can be propragated into the grid. May be used in places where page mode is inappropriate. A value less than or equal to zero indicates no limit.
 * @property {boolean} enablePages      - (true | false) For vertical growth direction only. Display products page-by-page, adding a clickable page-bar. The capacity of pages is defined within "Product Grid".
 * @property {productQueryOptions} initialQuery - The initial query for requesting products from the server.
 */

/** (DEPRECATED: Combined into productGridRequest) The data structure of a "chunk request" when requesting the client to propagate the "product grid". The intention is to store identifiable data of chunks, to avoid incorrect/duplicate chunks during potential race conditions. 
 * @typedef chunkRequest
 * @property {number} ID - The index of the chunk
 * @property {productQueryOptions} query - The "product query" of the chunk
 */

/** The data structure of a filter for requesting products from the server.
 * @typedef {object} productFilter
 * @property {string} categoryType      - The type of category for organizing the filters
 * @property {string} categoryID        - The name identifier of this category
 */

/** The data structure of the options for a query of requesting products from the server.
 * @typedef productQueryOptions
 * @property {string} searchStr                 - The search string
 * @property {Array.<productFilter>} filters    - An array of "Product Filters". See productFilter
 * @property {string} sort                      - The identifier string for the sorting method
 */

/** (DEPRECATED: Combined into productGridRequest) The data structure of a server response used for initializing the "Product Grid" with settings. Refer to "initializeGrid" function
 * @typedef initDataResponse
 * @property {number} chunkSize     - The size of chunks, expressed in number of data entries for the "Product Entry" feature. Assigned once from a server response when calling the initializeGrid function.
 * @property {number} endChunkID    - (number ≤ 0 | number ≥ 1) The ending index of chunks that the server matched with the currentQuery. Assigned once from a server response when loading the "Product Grid" feature. A value equal or less than zero indicates that there are no results for this query 
 */

/** (DEPRECATED: Combined into productGridResponse) The data structure of server response for propagating the "Product Grid" with one or more instances of "Product Entry". Refer to "propagateGrid" function
 * @typedef propagateGridResponse
 * @property {productEntryDataResponses} productEntryDataResponses
 */

// DEPRECATED: Moved to file "product_entry.js"
//
// /** The data structure of server response for data of one instance of "Product Entry".
//  * @typedef productEntryDataResponse
//  * @property {string} imgSrc        - Product preview image URL
//  * @property {string} name          - Product display name
//  * @property {string} culture       - Culture display name
//  * @property {number} priceCents    - Price in cents (1/100)
//  * @property {string} productURL    - Product view page URL
//  */

/** PLACEHOLDER
 * @typedef validProductFilterStringsStruct
 * @property {Set.<string>} categoryType
 * @property {Set.<string>} categoryID
 * @property {Set.<string>} form
 * @property {Set.<string>} culture
 * @property {Set.<string>} kind
 */

/** The data structure of a "history state object" that is retreived from parsing a "URL query string" in the function "parseURLQueryString"
 * @typedef historyState
 * @property {productQueryOptions} query
 * @property {number} page          - Page number, 1-based
 */

/** (DEPRECATED: Combined into productGridRequest) The data structure of an "index interval"
 * @typedef indexInterval
 * @property {number} startID - The start index
 * @property {number} endID - The end index
 */

/** (DEPRECATED: Combined into productGridRequest) The data structure of an "index interval request"
 * @typedef indexIntervalRequest
 * @property {indexInterval} interval
 * @property {productQueryOptions} query
 */

/** (DEPRECATED: Combined into productGridRequest) The data structure for the most recent request for propagating the "product grid"
 * @typedef propagationRequest
 * @property {number} chunkID
 * @property {indexInterval} interval
 * @property {productQueryOptions} query
 */

/** The data structure for making requests to the server for any relevant data for the "Product Grid" and "Product Filter Menu". It should be used for propagating the grid, getting hints about the available product query results, and getting the available "product filter menu" settings 
 * @typedef productGridRequest
 * @property {number} startID                       - The inclusive starting index of "product entry data response" to request
 * @property {number} length                        - The number of "product entry data responses" to request. The server will limit this value to the server-side "block size" value. If omitted, the server will default to a "block-sized" response of "Product Entries"
 * @property {string} searchStr                     - The search string. See productQueryOptions
 * @property {Array.<productFilter>} filters        - An array of "Product Filters". See productFilter
 * @property {string} sort                          - The string identifier for the sorting method. See productQueryOptions
 * @property {boolean} getBlockSize                 - If true, request to get value of the server-side "size of block of product entry data responses"
 * @property {boolean} getLastAvailableID           - If true, request to get value of the "last available product entry index for this query"
 * @property {boolean} getProductFilterMenuTemplate - If true, request to get a structured data object of "Product Filter Menu Template" for constructing the menu in the client
 */

/** The data structure of server responses for the "Product Grid" and "Product Filter Menu"
 * @typedef productGridResponse
 * @property {productEntryDataResponses} productEntries                                      - An array of "product entry data responses"
 * @property {number} blockSize                                                                     - The server-side "size of block of product entries"
 * @property {number} lastAvailableID                                                               - The reported "last available product entry index for this query"
 * @property {import("./product_filter_menu").productFilterMenuTemplate} productFilterMenuTemplate  - A structured data object of "Product Filter Menu Template" for constructing the menu in the client
 */

////////////////////////////////////////
// Script-level variables
////////////////////////////////////////

/** (TODO: Implement this) The direction in which the grid grows in size, internally, and how it adapts externally. "vertical" mode wraps the content into new rows. The actual height depends on the number of rows. "horizontal" mode will overflow internally in horizontal direction, enabling scrolling. The actual height is always one row. Every mode has a width that fits 100% of the container.
 * @type {string} */
let growthDirection;

/** An option for the "Product Grid". If true, create and add a "Product Filter Menu" component on the top of the "Product Grid".
 * @type {string} */
let isProductFilterMenuEnabled;

/** The size of a block, expressed in number of data entries for the "Product Entry" feature. Assigned once with the value from the first response from the server.
 * @type {number} */
let blockSize;

/** (DEPRECATED: Replaced by fulfilledProductGridRequest) The data of the most recently requested chunk that was received in a server response of a fetch. 
 * @type {chunkRequest} */
let currentRequestedChunk = {
    ID: null,
    query: null
};

/** (DEPRECATED: Replaced by fulfilledProductGridRequest) The data of the most recently received chunk that was requested in a fetch to the server.
 * @type {chunkRequest} */
let currentReceivedChunk = {
    ID: null,
    query: null
};

/** The current "Product Entry Pointer". It points to a "Product Entry index" in the context of the "Product Grid container", used for pointing where to propagate new entries. 
 * @type {number} */
let currentProductPointer = null;

/** (DEPRECATED: Will be replaced by endProductID) (number ≤ 0 | number ≥ 1) The ending index of chunks that the server matched with the currentQuery. Assigned once from a server response when loading the "Product Grid" feature. A value equal or less than zero indicates that there are no results for this query 
 * @type {number} */
let endBlockID;

/** A option for the "Product Grid". If true, apply "page-by-page mode". Some of the effects involves creating and adding a "Page Bar" and a "Horizontal Bar" feature.
 * @type {boolean} */
let arePagesEnabled;

/** The size of one page of the "Product Grid", expressed in "number of products". Should to be a multiple of "block size", such as 1xblockSize, 2xblockSize, 3xblockSize, ...
 * @type {number} */
let pageSize;

/** The number of available pages that was reported from the server at the initialization of "Product Grid" with the current query
 * @type {number} */
let numPages;

/** The previous value of numPages
 * @type {number} */
let lastNumPages = 0;

/** The index of the active page of results in "Product Grid".
 * @type {number} */
let currentPageID = 0;

/** A variable for keeping track of the previous value for "current page index"
 * @type {number} */
let lastPageID = null;

/** The current number of products in "Product Grid"
 * @type {number} */
let numProducts = 0;

/** The server-reported last available index of "product entries" for the given "Product Query Options". A value of less than or equal to zero indicates that there are no available results from the server-side.
 * @type {number} */
let lastAvailableProductID = null;

/** (DEPRECATED: Replaced by fulfilledProductGridRequest) The most recently requested interval of "product entry" indices
 * @type {indexIntervalRequest} */
let currentRequestedInterval = {
    interval: {
        startID: null,
        endID: null 
    },
    query: null
}

/** (number ≤ 0 | number ≥ 1) The limit of number of products that can be propragated into the grid. May be used in places where page-by-page mode is inappropriate. A value less than or equal to zero indicates that there is no limit.
 * @type {number}
 * @memberof {gridOptions} */
let maxProducts;

/** (DEPRECATED: Replaced by fulfilledProductGridRequest) The most recently fulfilled "product grid propagation request". The intention is to avoid redundant new requests
 * @type {propagationRequest} */
let fulfilledPropagationRequest = {
    chunkID: null,
    interval: {
        startID: null,
        endID: null
    },
    query: null
}

/** (DEPRECATED: Replaced by pendingProductGridRequest)
 * @type {propagationRequest} */
let pendingPropagationRequest = {
    chunkID: null,
    interval: {
        startID: null,
        endID: null
    },
    query: null
}

/** A script-level variable for storing a new "product grid request object", that might become the next pending request.
 * @type {productGridRequest} */
let newProductGridRequest = {
    startID: null,
    length: null,
    searchStr: null,
    filters: null,
    sort: null,
    getBlockSize: null,
    getLastAvailableID: null,
    getProductFilterMenuTemplate: null
};

/** The most recent "Product Grid Request" that is pending, before becoming fulfilled
 * @type {productGridRequest} */
let pendingProductGridRequest = {
    startID: null,
    length: null,
    searchStr: null,
    filters: null,
    sort: null,
    getBlockSize: null,
    getLastAvailableID: null,
    getProductFilterMenuTemplate: null
};

/** The most recent "Product Grid Request" that has been fulfilled, after being pending.
 * @type {productGridRequest} */
let fulfilledProductGridRequest = {
    startID: null,
    length: null,
    searchStr: null,
    filters: null,
    sort: null,
    getBlockSize: null,
    getLastAvailableID: null,
    getProductFilterMenuTemplate: null
};

/** The current setting of the "product query options", intended for creating new "Product Grid Requests"
 * @type {productQueryOptions} */
let currentQueryOptions = {
    searchStr: null,
    filters: null,
    sort: null
};

/** Grid container that is to be propagated with "Product Entries"
 * @type {HTMLDivElement | null} */ 
const grid = document.body.querySelector("product-grid.container");

/** The "end of results text object" holding references to relevant elements  
 * @type {endOfResultsTextStruct}
 * @typedef endOfResultsTextStruct
 * @property {HTMLDivElement | null} container - The container for the text element
 * @property {HTMLSpanElement | null} element - The "end of results text element" that is to be placed beneath the grid element of the "product grid". It has three life cycle states: 1) Non-existing. 2) Placed in the DOM. 3) Removed from the DOM.
 */
const endOfResultsText = {
    container: document.body.querySelector("end-of-results-text.container"),
    element: null
};

/** The "horizontal bar object" holding references to relevant elements  
 * @type {horizontalBarStruct}
 * @typedef horizontalBarStruct
 * @property {HTMLDivElement | null} container - The container for the bar element
 * @property {HTMLImageElement | null} element - The "horizontal bar element" that is to be placed beneath the grid element of the "product grid". It has three life cycle states: 1) Non-existing. 2) Placed in the DOM. 3) Removed from the DOM.
 */
const horizontalBar = {
    container: document.body.querySelector("horizontal-bar.container"),
    element: null
};

/** Page Bar elements, displaying "Page" followed by a serial number starting from 1 for every page (Page 1 2 3 ...)
 * @type pageBarStruct
 * @typedef pageBarStruct
 * @property {HTMLElement} container
 * @property {HTMLElement} page
 * @property {Array.<HTMLElement>} pages
 */ 
const pageBar = {
    container: document.body.querySelector("page-bar.container"),
    page: undefined,
    pages: []
}

/** (TODO: Make static variable for Class implementation) A script-level variable for storing the "Product Filter Menu Template" in this "Product Grid" script
 * @type {import("./product_filter_menu").productFilterMenuTemplate} */
let productFilterMenuTemplate = null;

/** @type validProductFilterStringsStruct */
let validProductFilterStrings;

/** (DEPRECATED: Moved to the productEntry class as a static variable) A pool of free, deactivated "product entries". Allows re-using old instances
 * @type {Array.<productEntry>} */
const productEntryPool = new Array();

/** (DEPRECATED: Replaced by checking date difference on demand) Timeout-gates for "requests to propagate the product grid" that are equal to their previous ones, and requests that are inequal to their previous ones. The intention is to use different duration for the timeout depending on whether the request is same or different.
 * @type {requestTimeoutGates}
 * @typedef requestTimeoutGates
 * @property {boolean} isOpenForRetry - If true, the gate is open for repeated requests. If false, the gate is closed.
 * @property {boolean} isOpenForNew - If true, the gate is open for new requests. If false, the gate is closed.
*/
const requestTimeoutGates = {
    isOpenForRetry: true,
    isOpenForNew: true
};

/** The timestamp of the last time that a "Product Grid Request" was approved on the client-side before it was sent to the server
 * @type {Date} */
let lastProductGridRequestDate = null;


////////////////////////////////////////
// Main functionality
////////////////////////////////////////

// DEPRECATED
// initValidProductFilterStrings();
//
// DEPRECATED: Remove this function call after adding it in the promise chain in initializeGrid.
// Ready to run one iteration of propagating the grid
// fetchAndPropagate(0);

/** Initialize the "Product Grid". This function should be called once after importing its module
 * @param {string}              [growthDirectionParam]  - ("vertical" | "horizontal") Control which direction the grid grows in size, internally, and how it adapts externally. "vertical" mode wraps the content into new rows. The actual height depends on the number of rows. "horizontal" mode will overflow internally in horizontal direction, enabling scrolling. The actual height is always one row. Every mode has a width that fits 100% of the container.
 * @param {number}              [maxProductsParam]      - (number < 1 | number > 1) Limit the number of products that can be propragated into the grid. May be used in places where "page mode" is inappropriate.
 * @param {boolean}             [enablePages]           - (true | false) For vertical growth direction only. Display products page-by-page, adding a clickable page-bar. The capacity of pages is defined within "Product Grid".
 * @param {boolean}             [enableFilterMenu]      - (true | false) Add a "Product Filter Menu" component on top of the "Product Grid". It allows the client to change "Product Filters" for filtering results of "Product Entries".
 * @param {productQueryOptions} [initialQueryOptions]   - (Required) The initial query for requesting products from the server.
 * */ 
function initializeGrid (
    growthDirectionParam = "vertical",
    maxProductsParam = 0,
    enablePages = true,
    enableFilterMenu = true,
    initialQueryOptions = null
){
    // Set up the CSS Grid based on the desired type of "Product Grid", determined by the direction of growth
    switch(growthDirectionParam) {
        case "vertical":
            grid.setAttribute("class", "container vertical");
            growthDirection = growthDirectionParam;
            break;
        case "horizontal":
            grid.setAttribute("class", "container horizontal");
            growthDirection = growthDirectionParam;
            break;
        default:
            growthDirection = "vertical";
            grid.setAttribute("class", "container vertical");
            console.warn("Product Grid - initializeGrid: argument 'growthDirection' has an invalid value. Defaulting to 'vertical'.");
    }

    // Store the setting for limiting the number products
    if (typeof maxProductsParam === "number") {
        maxProducts = maxProductsParam; 
    }
    else console.error("Product Grid - initializeGrid: argument 'maxProductsParam' is invalid");

    // Store the setting for enabling page-mode
    if (typeof enablePages === "boolean") {
        arePagesEnabled = enablePages;
    }
    else console.error("Product Grid - initializeGrid: argument 'arePagesEnabled' is invalid");
    
    // Store the setting for enabling the "product filter menu"
    if (typeof enablePages === "boolean") {
        isProductFilterMenuEnabled = enableFilterMenu;
    }
    else console.error("Product Grid - initializeGrid: argument 'enableFilterMenu' is invalid");

    // Set up the new "product grid request", before proceeding to fetch.

    // Start from index zero
    // NOTE: Length value has to be omitted, because of the "block size" remaining unknown until the first "product grid response" has been received
    // TODO: To compensate for this, apply maxProducts in fetchAndProcessProductGridResponse when using the property productEntries
    newProductGridRequest.startID = 0;

    // Assign flags for get-directives to true
    newProductGridRequest.getBlockSize = true;
    newProductGridRequest.getLastAvailableID = true;

    // The get-directive for "product filter menu template" should only be enabled if the argument "enable product filter menu" is true
    // TODO: Add a new "product grid setting"
    if (enableFilterMenu) newProductGridRequest.getProductFilterMenuTemplate = true;

    // Check if the argument "initial product query options" is valid with a specialized function
    if (validateProductQueryOptionsObj(initialQueryOptions)) {
        // Assign the new "product grid request" with "product query options"
        newProductGridRequest.searchStr = initialQueryOptions.searchStr;
        newProductGridRequest.filters = initialQueryOptions.filters;
        newProductGridRequest.sort = initialQueryOptions.sort;
    }
    
    // If not valid, check if it's NOT null before printing an error to console. Null is considered as an intended setting
    else if (initialQueryOptions !== null) console.error("Product Grid - initializeGrid: argument 'initialQuery' is invalid");
 
    // Skip the "pre-requisites to propagate the product grid", since this request is mandatory for the "product grid" to work as intended. Therefore, changes to the state of the "product grid" will be made

    // Set the new "product grid request" to pending state. NOTE: Structured cloning should not be neccessary
    pendingProductGridRequest = newProductGridRequest;

    // For timeout processing, save the current date as the "last product grid request date"
    lastProductGridRequestDate = new Date();

    // Now, when the "product grid request" is complete, fetch and process the "product grid response", by using the new "product grid request"
    fetchAndProcessProductGridResponse();

    // If pages are enabled, set up the "horizontal bar" component asynchronously
    if (arePagesEnabled) {
        const horizontalBarPromise = Promise.resolve()
        .then(() => {
            setHorizontalBarVisibility(true);
            return Promise.resolve();
        })
        .catch((error) => console.error(`Product Grid - initializeGrid: Caught an error in the promise chain of 'horizontalBarPromise': ${error}`));
    }

    // DEPRECATED: all of the fetch and it's promise chain below will be replaced by a combined fetch function
    //
    // // Fetch blockSize and endBlockID values from the server
    // // TODO: add a query string to the URL, so the server can check the total number of chunks for the given query 
    // fetch("source/collectors-store/client/json/product_grid_initialize_response_sample.json")
    // 
    // // Process server HTTP response
    // .then((response) => {
    //     // Check if the "HTTP status code" is OK
    //     if (!response.ok) Promise.reject("Product Grid - initializeGrid: Response HTTP status code was not OK when fetching for initalization data");
    //     
    //     // Convert the "HTTP response body" to text
    //     return response.text();
    // })
    // 
    // // Process the stringified text from the server response
    // .then((JSONText) => {
    //     /** @type {initDataResponse} */
    //     const init = JSON.parse(JSONText);
    // 
    //     // Process chunkSize response
    //     // Check for invalid property or value. Only number type is allowed
    //     if (typeof init.chunkSize !== "number" || !init.chunkSize) {
    //         // If invalid, use default value
    //         blockSize = 12;
    //         console.warn("Product Grid - initializeGrid: Server response property 'chunkSize' is either undefined or has a falsy value. Defaulting to 12");
    //     }
    //     // Otherwise, it's considered valid and will be applied as a setting of "Product Grid"
    //     else blockSize = init.chunkSize;
    //    
    //     // Process endChunkID response
    //     // Check if the value is undefined or invalid
    //     if (typeof init.endChunkID === "undefined" || !Number.isInteger(init.endChunkID)) {
    //         // Then, apply with default value
    //         endBlockID = null;
    //         console.error("Product Grid - initializeGrid: Server response property 'chunkSize' is either undefined or has an invalid value. This can lead to problems with page-by-page mode and redundant requests to server");
    //     }
    //     // Otherwise, it's considered valid and will be applied as a setting of "Product Grid"
    //     else endBlockID = init.endChunkID;
    // 
    //     // Now, the fetch is finished
    //     // Return to outer promise chain
    //     return Promise.resolve();
    // })
    // 
    // // Do various synchronous work after finishing the fetch
    // .then(() => {
    //     // Catch errors to avoid letting them flow into the outer promise chain
    //     try {
    //         updatePageState();
    //         setHorizontalBarVisibility(arePagesEnabled);
    //         requestToFetchAndPropagateGrid();            
    //     }
    // 
    //     // If an error is caught, reject this promise
    //     catch (e) { return Promise.reject(`Product Grid - initializeGrid: Caught an error when doing work after the fetch is finished: ${e}`); }
    //     
    //     // When reaching this line, this promise is considered successful
    //     return Promise.resolve();
    // })
    // 
    // // All uncaught errors in this promise chain end up in this catch-promise
    // .catch((error) => console.error(`Product Grid - initializeGrid: Caught an error from promise chain: ${error}`));
}

/** (DEPRECATED: Replaced by fetchAndProcessProductGridRequest) Propagate the grid container with one or more instances of "Product Entry" feature. Should only be called once per requestToPropagateGrid function call.
 * @param {number} numToPropagate - (number ≤ 0 | number ≥ 1) Fetch a specified number of entries from the server. If zero or less, fetch a chunk of entries from the server.
 * @param {indexInterval} intervalToFetch - The interval of "product entry indices" to fetch
 * @param {number} chunkIDToFetch - The "chunk index" to fetch
 */
function fetchAndPropagate(isChunkFetch) {
    // Check if the argument "is chunk" is undefined
    if (typeof isChunkFetch === "undefined") return Promise.reject("Product Grid - fetchAndPropagateGrid: argument 'isChunk' is undefined");
    
    // Since there may be concurrent fetch requests, each with unpredictable timings, it's a good practice to allow checking if this fetch still is current, or replaced by another fetch. The approach is to save the current state of the "current requested chunk" object.
    // Make a "deep copy" of the "current requested chunk" variable and store it in this function-scope. It will be accessible within this closure. They will associate the server response with the original request, so that the server won't have to re-send redundant data back to the client.
    /** A "deep copy" of the "current requested chunk" at the time of calling the "fetch and propagate product grid" function. To achieve this easily, use the "structured clone algorithm" that works for simple nested objects and arrays.
     * @type {propagationRequest} */
    let thisFetchPropagationRequest = {
        chunkID: null,
        interval: {
            startID: null,
            endID: null
        },
        query: null
    }
    
    // Store a "deep copy" of the "pending product grid propagation request" inside this function-scope
    thisFetchPropagationRequest = structuredClone(pendingPropagationRequest);

    /** The URL string, selected by whether the argument is asking for a chunk or for a specific number of entries
     * @type {string} */
    let url;

    // Check the argument "is chunk" if this fetch is for a chunk
    if (isChunkFetch) {
        // Then, set URL to fetch a chunk
        url = "/source/collectors-store/client/json/product_grid_response_sample.json";
        // TODO: Develop a server in order to respond to dynamic requests
    }
    // Otherwise, this fetch is for an "interval of product entries"
    else {
        // Fetch an "interval of product entries"
        // TODO: Develop a server in order to respond to dynamic requests
        return Promise.reject("Product Grid - fetchAndPropagateGrid: TODO: Develop a server in order to respond to dynamic requests");
    }

    // Now, when the URL has been selected, return a Promise-chain starting with fetch
    return fetch(url)
    .then((response) => {
        // Since there may be are concurrent fetch requests, each with unpredictable timings, it's a good practice to see if this fetch still is based on a currently pending "propagation request". The "pending propagation request" may have been replaced by a more recent one after this fetch started.
        // Check for NON-equality between the function-scoped "this fetch propagation request" and the script-scoped "pending propagation request"
        if (!comparePropagationRequestsForEquality(thisFetchPropagationRequest, pendingPropagationRequest)) return Promise.reject("Product Grid - fetchAndPropagateGrid: This fetch has been replaced by a more recent one. Reason: The locally stored 'propagation request' of this fetch is no longer the same as the script-level 'propagation request'.");

        // Check the HTTP status code 
        if (!response.ok) Promise.reject("Product Grid - fetchAndPropagateGrid: Response HTTP status code is not OK");
        
        // Convert response body into text
        return response.text();
    })


    // Process the stringified text from the server response body
    .then((JSONText) => {
        // Parse the JSON text into JavaScript objects
        /** @type {propagateGridResponse} */
        const propagateGridResponse = JSON.parse(JSONText);

        // Check if the new "propagate grid response" object, created from parsing, is invalid
        if (
            typeof propagateGridResponse.productEntryDataResponses === "undefined"
            || !Array.isArray(propagateGridResponse.productEntryDataResponses)
            || propagateGridResponse.productEntryDataResponses.length === 0
        ) return Promise.reject("Product Grid - fetchAndPropagateGrid: The parsed 'propagateGridResponse' object is invalid");

        /** The number of received "product entries" from the server response
         * @type {number} */
        let numSuccessfulProductEntries;

        // Loop through the Product Entry Array (size is determined by server)
        for (const productEntryData of propagateGridResponse.productEntryDataResponses) {
            // Check if the "product entry data response object" is valid, by usinga specialized function
            if (!isProductEntryDataResponseValid) {
                // Then skip this entry, don't count this iteration as a "successful product entry", and continue this for-loop
                continue;
            }

            // Since the validation was successful, count this as a "successful product entry"
            numSuccessfulProductEntries++;

            /** The selected "product entry" element reference to use
             * @type {productEntry} */
            let selectedProductEntry = null;            

            // To get an instance of "product entry" check the "product entry pool" first before creating a new instance

            // Does the "product entry pool" have any instances?
            if (productEntry.productEntryPool.length > 0) {
                // Then re-use one instance. It doesn't matter which instance is picked, as they are all reset since earlier
                selectedProductEntry = productEntry.productEntryPool.pop();
            }

            // Otherwise, the "product entry pool" is empty
            else {
                // Create new "product entry" custom element
                selectedProductEntry = document.createElement("product-entry");

                // Create and add an attribute node for passing one "Product Entry Data Structure" as string type to the "Product Entry".
                const attr = document.createAttribute("product-entry-data");
                selectedProductEntry.setAttributeNode(attr);
            }

            // The "product entry" implements the "attributeChangedCallback" of "custom elements API", as the constructor for applying data. The "product entry data object" is stringified/serialized so that it can be contained within an attribute
            selectedProductEntry.setAttribute(JSON.stringify(productEntryData));

            // Add the "product entry" to the DOM
            grid.appendChild(selectedProductEntry);

            /* DEPRECATED: Replaced by the usage of pool system
            // Create and add a Custom Element to the grid container
            const productEntry = document.createElement("product-entry");
            grid.appendChild(productEntry);

            // Create and add an attribute node for passing one "Product Entry Data Structure" as string type to the "Product Entry". This is expected to fire the "attributeChangedCallback" function on the Custom Element
            const attr = document.createAttribute("product-entry-data");
            attr.value = JSON.stringify(entry);
            productEntry.setAttributeNode(attr);
            */
        }

        // Reaching to this line is considered a successful "fetch and propagation of the product grid"

        // Transfer the contents of "pending propagation request" to "fulfilled propagation request". This effectively marks the "pending propagation request" as fulfilled.
        // Update the script-level variable "fulfilled propagation request" with its counterpart "pending propagation request".
        fulfilledPropagationRequest = pendingPropagationRequest;

        // Assign a new, nullified object to the "pending propagation request" variable
        pendingPropagationRequest = {
            chunkID: null,
            interval: {
                startID: null,
                endID: null
            },
            query: null
        };

        // Update the script-level "number of products" variable with the "number of received product entries from the server response".
        numProducts += numSuccessfulProductEntries;

        // When reaching this line, this promise is considered successful
        // Return to outer promise chain
        return Promise.resolve(true);
    })

    // After fetching and propagating the grid, show or hide "end of results text"
    .then(() => {
        // Check if pages are NOT enabled. Then, return to outer promise chain
        if (!arePagesEnabled) return Promise.resolve(false);
        
        // Use error handling when calling the non-thenable function "update end of results text" 
        try { updateEndOfResultsText(); }
        catch (e) { Promise.reject(`Product Grid - fetchAndPropagateGrid: Caught error while calling function 'updateEndOfResultsText': ${e}`) }
    })

    // All uncaught errors of this promise chain end up in this catch-promise
    .catch((error) => console.log(`Product Grid - fetchAndPropagateGrid: Caught error in promise chain: ${error}`));
}

/** Checks if the current state of the "Product Grid" fulfills the general pre-requisites in the client to propagate the "Product Grid" container with "Product Entry" entries.
 * @param {number | null} chunkIDToRequest - The "chunk index" to request for. Defaults to the next index after the current index
 * @returns {boolean} If the circumstances meets the pre-requisites, returns true. If not, returns false.
 * @throws {Error} If the script-level "product grid request" variables are invalid
 */
function checkPreRequisitesToFetchAndPropagateGrid () {
    // Ensure that approved requests are not occuring too rapidly, putting redundant load on the server. Therefore, check if the corresponding "timeout gate" is open for this type of request.
    // There are two different timer durations for the "timeout gates". Use an algorithm to determining request equality, that depends the type of request.

    // Firstly, check if both of the timeout-gates are NOT open
    if (!requestTimeoutGates.isOpenForRetry && !requestTimeoutGates.isOpenForNew) {
        // Then, do nothing and return false for rejection
        return false;
    }

    /** If true, the requested data is the same as the data in the fulfilled request. If false, the requested data is different from the fulfilled request.
     * @type {boolean} */
    let isNewRequestEqualToFulfilled = null;

    // Compare the new request with the fullfilled request
    // TODO: The comparison function may throw an error
    try { isNewRequestEqualToFulfilled = comparePropagationRequestsForEquality(newProductGridRequest, fulfilledProductGridRequest); }
    catch (e) { throw new Error(`Product Grid - checkPreRequisitesToFetchAndPropagateGrid: Caught error while getting the result of comparing the new "product grid request" with the fulfillled request, to determine which timeout-gate to use: ${e}`) }

    // Check the result from the comparison, to see if the new request is the same as the fulfilled request
    if (isNewRequestEqualToFulfilled) {
        // Then, return false for rejection
        return false;
    }

    /** If true, the requested data is the same as the data in the pending request. If false, the requested data is different from the pending request.
     * @type {boolean} */
    let isNewRequestEqualToPending = null;

    // Compare the new request with the pending request
    // The comparison function may throw an error
    try { isNewRequestEqualToPending = comparePropagationRequestsForEquality(newProductGridRequest, pendingProductGridRequest); }
    catch (e) { console.error(`Product Grid - checkPreRequisitesToFetchAndPropagateGrid: Caught error while getting the result of comparing the new "product grid request" with the pending request, to determine which timeout-gate to use: ${e}`) }

    // Check which gate to use depending on if the new request is equal or inequal to the previous request
    if (isNewRequestEqualToPending) {
        // Check if the gate for equal requests is open
        if (requestTimeoutGates.isOpenForRetry) {
            // Close this gate after passing through it
            requestTimeoutGates.isOpenForRetry = false;

            // Start a timer for opening the gate again. The duration is longer for equal requests
            setTimeout(() => requestTimeoutGates.isOpenForRetry = true, 4000);
        }

        // Otherwise, the gate for equal requests is closed
        else {
            // Then, return false for rejection
            return false;
        }
    }

    // Else, this is an inequal request. This else-statement will also be the fallback if isRequestEqual still is null because of an error.
    else {
        // Check if the gate for inequal requests is open
        if (requestTimeoutGates.isOpenForNew) {
            // Close this gate after passing through it
            requestTimeoutGates.isOpenForNew = false;

            // Start a timer for opening the gate again. The duration is shorter for inequal requests
            setTimeout(() => requestTimeoutGates.isOpenForNew = true, 2000);
        }

        // Otherwise, the gate for inequal requests is closed
        else {
            // Then do nothing and return false for rejection
            return false;
        }
    }
    
    // Check if the "start index" of the new "product grid request" has reached the end of the available results, by checking the script-level "last available product entry index" variable
    if (
        // Check if lastAvailableProductID is valid
        Number.isInteger(lastAvailableProductID)
        && lastAvailableProductID >= 0

        // AND check if the "start index" property value is NOT omitted by leaving it as null
        // AND check if the "start index" property is reaching is exceeding the last available index
        && newProductGridRequest.startID !== null
        && newProductGridRequest.startID >= lastAvailableProductID
    ) return false;

    // Check if the "start index" of the new "product grid request" has exceeded the client-side maximum limit, by checking the script-level "max product entries" variable
    if (
        // Check if maxProducts is valid
        Number.isInteger(maxProducts)
        && maxProducts > 0

        // AND check if the "start index" property value is NOT omitted by leaving it as null
        // AND check if the "start index" property is reaching or being past the last available index
        && newProductGridRequest.startID !== null
        && newProductGridRequest.startID+1 > maxProducts
    ) return false;

    // If pages are enabled, check if the "start index" property is within the range of the "current product grid page"
    if (
        // Check if "product grid pages" are enabled
        arePagesEnabled
        
        // AND check if the "start index" property value is NOT omitted by leaving it as null
        && newProductGridRequest.startID !== null

        // AND check if the "start index" property is outside the valid range of the "current product grid page"
        && (
            newProductGridRequest.startID < currentPageID * pageSize
            || newProductGridRequest.startID > (currentPageID + 1) * pageSize - 1
        )
    ) return false

    // When reaching this line, the new request is considered as accepted. Return true for approval
    return true;
}

/** (DEPRECATED: Replaced by checkPreRequisitesToFetchAndPropagateGrid) Checks pre-requisites in the client to propagate the grid container of "Product Grid" with "Product Entry" entries. If it passes, this function will call the fetch function. This function can be called multiple times for requesting an increased number of entries in the grid, or to retry due to a network error.
 * @param {number | null} chunkIDToRequest - The "chunk index" to request for. Defaults to the next index after the current index
 * @returns {boolean} - If the circumstances meets the pre-requisites, returns true. If not, returns false.
 */
function requestToFetchAndPropagateGrid() {
    /* DEPRECATED: Replaced by assuming that the requested chunk is the next index from the current index
    // Check the argument "chunk index to request" is null
    if (chunkIDToRequest === null) {
        // Then default to one "current received chunk index"
        chunkIDToRequest = currentReceivedChunk.ID + 1;
    }
    */
    
    // Firstly, check if both of the timeout-gates are NOT open
    if (!requestTimeoutGates.isOpenForRetry && !requestTimeoutGates.isOpenForNew) {
        // Then, do nothing and return false for rejection
        return false;
    }

    // Check the current state of the "product grid" to determine if it is appropriate to propagate or not. Meanwhile, determine what type of request is appropriate, and the number of "product entries" that is appropriate to propagate with.
    
    /** If zero, then it's appropriate to use a chunk to propagate. If greater than zero, then the value represents the number of products to that is appropriate to propagate the grid with. If null, then it is NOT appropriate to propagate the grid.
     * @type {number | null} */
    let appropriateNumToPropagate = null;
    
    // Determine the value for the "appropriate number of product entries to propagate the product grid with"
    appropriateNumToPropagateBlock: {
        // Check if page-by-page mode is enabled
        if (arePagesEnabled) {
            // Check if the current received chunk is the ending chunk
            if (fulfilledPropagationRequest.chunkID >= endBlockID) {
                // Then, propagation is considered inappropriate
                // Don't do any work and break this labeled block
                break appropriateNumToPropagateBlock;
            }
    
            // Check if the "current page index" has changed since the last chunk was fetched and used. This is a range-check to see if the "current received chunk index" is outside the "current product grid page".
            if (
                (fulfilledPropagationRequest.chunkID < currentPageID * pageSize
                || fulfilledPropagationRequest.chunkID > (currentPageID + 1) * pageSize - 1)
            ) {
                // Then, Now, there's an appropriate number of "product entries" to propagate the grid with
    
                // Set "number of product entry to propagate" to zero, indicating to fetch a chunk of "product entry data"
                appropriateNumToPropagate = 0;
            }
    
            // Otherwise, the "current received chunk index" is within the "current product grid page"
            // Check if there is NO remaining space left for chunks on the current page. The value of "current received chunk index" is converted from zero-based to one-based value. The algorithm is only accurate when the remainder is zero, but not for remainders greater than zero.
            else if ((fulfilledPropagationRequest.chunkID + 1) % pageSize === 0) { 
                // Then, propagation is considered inappropriate
                // Don't do any work and break this labeled block
                break appropriateNumToPropagateBlock;
            }
    
            // Now, there's an appropriate number of "product entries" to propagate the grid with
    
            // Set "number of product entry to propagate" to zero, indicating to fetch a chunk of "product entry data"
            appropriateNumToPropagate = 0;
        }
    
        // Otherwise, pages are NOT enabled, indicating that variables "number of products" and "max products" are used
        else {
            // Before proceeding, check if the current "number of products" has reached the reported "end product index"
            // OR check if the "max products" setting is activated WHILE the grid has reached the maximum number of products
            if (
                (numProducts-1) >= lastAvailableProductID
                || (
                    maxProducts > 0
                    && numProducts >= maxProducts
                )
            ) {
                // Then propagation is considered inappropriate
                // Don't do any work and break this labeled block
                break appropriateNumToPropagateBlock;
            }
    
            // Now, there's an appropriate number of "product entries" to propagate the grid with
            // Calculate the remaining space that can be propagated
    
            // The remaining space to "end product index"
            const remainingSpaceToEnd = lastAvailableProductID - numProducts-1;
    
            // The remaining space to "max products"
            const remainingSpaceToMax = maxProducts - numProducts;
            
            // Pick the smallest value
            const remainingSpace =  min(remainingSpaceToEnd, remainingSpaceToMax);
    
            // Check if the remaining space for products can fill an entire chunk
            if (remainingSpace >= blockSize) {
                // Set "number of product entry to propagate" to zero, indicating to fetch a chunk of "product entry data"
                appropriateNumToPropagate = 0;
            }
            else {
                // Otherwise, fetch a smaller number of products that will fill the "Product Grid" to the client-side maximum limit
                appropriateNumToPropagate = remainingSpace;
            }
        }
    }
    
    // Check if the result from running the labeled block "checkIfAppropriateBlock" is indicating that propagation is inappropriate, OR if the value is invalid
    if (
        appropriateNumToPropagate === null
        || typeof appropriateNumToPropagate !== "number"
        || appropriateNumToPropagate < 0
    ) {
        // Then do nothing and return false for rejected request
        return false;
    }

    // Now, there is an appropriate number of "product entries" that the grid could be propagated with.
    // Analyze what type of request this is involving, whether it is a chunk, or an interval of indices of "product entries" to propagate the "product grid" with.
    // If the request involves a chunk, then the new "chunk index" needs to be defined
    // If the request involves an interval of indices, then the interval bounds need to be defined

    /** The new "product grid propagation request" object to construct and analyze. This object has the potential to become the new "pending propagation request", if the function approves it.
     * @type {propagationRequest} */
    const newPropagationRequest = {
        chunkID: null,
        interval: {
            startID: null,
            endID: null
        },
        query: null
    };

    // Check if the new request is for a chunk
    if (appropriateNumToPropagate === 0) {
        // Set the new "chunk index"
        newPropagationRequest.chunkID = fulfilledPropagationRequest.chunkID + 1;
    }

    // Otherwise, the new request is for an interval of indices
    else {
        // Set bounds of the interval. Starts from the "current number of product entries", extended by the "appropriate number of product entries to propagate the product grid with"
        newPropagationRequest.interval.startID = numProducts - 1;
        newPropagationRequest.interval.endID = numProducts + appropriateNumToPropagate - 1;
    }

    // Set the "product query" of the new request, using the "current product query settings"
    newPropagationRequest.query = currentQueryOptions;

    // Ensure that approved requests are not occuring too rapidly, putting redundant load on the server. Therefore, check if the corresponding "timeout gate" is open for this type of request.
    // There are two different timer durations for the "timeout gates". Use an algorithm to determining request equality, that depends the type of request.

    /** If true, the requested data is the same as the data in the previous request. If false, the requested data is different from the previous request.
     * @type {boolean} */
    const isRequestEqual = comparePropagationRequestsForEquality(newPropagationRequest, pendingPropagationRequest);

    // TODO: Move the timer-gate-processing up to the top
    // Check which gate to use depending on if the new request is equal or inequal to the previous request
    if (isRequestEqual) {
        // Check if the gate for equal requests is open
        if (requestTimeoutGates.isOpenForRetry) {
            // Close this gate after passing through it
            requestTimeoutGates.isOpenForRetry = false;

            // Start a timer for opening the gate again. The duration is longer for equal requests
            setTimeout(() => requestTimeoutGates.isOpenForRetry = true, 4000);
        }

        // Otherwise, the gate for equal requests is closed
        else {
            // Then do nothing and return false for a rejected request
            return false;
        }
    }

    // Else, this is an inequal request
    else {
        // Check if the gate for inequal requests is open
        if (requestTimeoutGates.isOpenForNew) {
            // Close this gate after passing through it
            requestTimeoutGates.isOpenForNew = false;

            // Start a timer for opening the gate again. The duration is shorter for inequal requests
            setTimeout(() => requestTimeoutGates.isOpenForNew = true, 2000);
        }

        // Otherwise, the gate for inequal requests is closed
        else {
            // Then do nothing and return false for a rejected request
            return false;
        }
    }

    // When reaching this line, the new request is considered as accepted
    
    // Check if the new request is a chunk type
    if (appropriateNumToPropagate === 0) {
        // Update the index of the "current requested chunk" by adding one to the index of the most recently received chunk
        newPropagationRequest.chunkID = fulfilledPropagationRequest.chunkID + 1;
    }
    // Otherwise, check if the new request is an "index interval" type
    else if (appropriateNumToPropagate > 0) {
        newPropagationRequest.interval.startID = numProducts - 1;
        newPropagationRequest.interval.endID = numProducts + appropriateNumToPropagate - 1;
    }

    // Update the "current requested chunk". Making a shallow copy of a function-scoped variable should not cause any problems once this function call is finished.
    pendingPropagationRequest = newPropagationRequest;

    // Fetch "product entries" and propagate the grid
    fetchAndPropagate(appropriateNumToPropagate);

    // Return true for an accepted request
    return true;
}

/** Update the value of "pageSize" when the value of "chunkSize" has been changed, which normally only happens during the initialization of the "product grid". */
function updatePageSize() {
    // Firstly, check if pages are disabled. If true, return.
    if (!arePagesEnabled) return;
    
    // Select desired products per page based on viewport width threshold
    const desiredProductsPerPage = MediaQueryListNarrow ? 20 : 28;

    // To set "page size", first get the closest whole number multiplier to achieve the following equation: blockSize * closestMultiplier ≈ desiredProductsPerPage
    const closestMultiplier = Math.round(desiredProductsPerPage / blockSize);

    // Attempt to create a result that should be near to the value of desiredProductsPerPage
    const result = closestMultiplier * blockSize;

    // Assign "page size" with the result if it is greater than 0. Otherwise, default to desiredProductsPerPage
    pageSize = result > 0 ? result : desiredProductsPerPage; 

    return;
}

/** Update the HTML elements of "Page Bar" that displays the clickable page numbers */
function updatePageBar() {
    // Firstly, check if pages are disabled. If true, return.
    if (!arePagesEnabled) return;

    // Check if the "Page" text element exists yet
    if (typeof pageBar.page === "undefined") {
        // It doesn't exist. Create it
        pageBar.page = document.createElement("span");
        pageBar.page.textContent = "Page";
        pageBar.page.setAttribute("class", "page-bar page");
        pageBar.container.appendChild(pageBar.page);
    }

    // Check if the variable for number of pages is a number OR has a falsy value.
    if (typeof numPages !== "number") {
        // If true, this function call is considered failed
        console.error(`Product Grid - updatePageBar: the variable 'numPages' has an invalid type that is not 'number': ${typeof numPages}`);
        // Don't any work and return
        return;
    }
    
    /* DEPRECATED: If using one for-loop for creating new elements, then another for-loop will be needed to append/remove elements from the DOM. Now these two tasks are done in only one for-loop.
    // Calculate to get the gap of how many more "page number" elements are needed
    const numNewElemNeeded = numPages - pageBar.pages.length;
    // Check if the calculated difference is on the positive side, which means that there are more available pages than elements
    if (numNewElemNeeded > 0) {
        // Iterate for every missing "page number" element that is needed
        for (let i = 1; i <= numNewElemNeeded; i++) {
            // Create new page elements
            const numElem = createElement("span");

            // Set the displayed number as a part of the number sequence
            numElem.textContent = numPages + i;

            // Set HTML class attribute, allowing the CSS stylesheet to apply
            numElem.setAttribute("class", "page-bar container");

            // Add the new element to "Page Bar" container
            // BUG: Do it later, otherwise it can cause a gap
            //pageBar.container.appendChild(numElem);

            // Store the new "page number" element reference inside the pageBar object
            pageBar.pages.push(numElem);
        }
    }
    // Othwerwise, no more "page number" elements need to be created
    */

    /* BUG: Can cause gaps
    // Otherwise, the difference result could be on the negative side. That would indicate that there are more "page number" elements than available pages 
    // Check if the value is negative
    else if (numNewElemNeeded < 0) {
        // Get the absolute value of the difference result
        const absNumNewElemsNeeded = Math.abs(numNewElemNeeded);

        // Get last index
        const last = pageBar.pages.length - 1;

        // Iterate for every displayed element that is excessive
        for (let i = 0; i < absNumNewElemsNeeded; i++) {
            // Get last child by iterating the array in reverse order
            const child = pageBar.pages[last - i];
            // Remove it from the "page bar" container
            pageBar.container.removeChild(child);
        }
    }
    // Otherwise, the difference is zero. No more "page number" elements needs to be created

    // Now, there could be more available pages than "page number" elements that are added to the DOM
    */

    // Check for changes in the state of "page-by-page mode" 
    // Get the difference between the server-reported "available pages" and its previous value. Previous value could be 0.
    const pageDiff = numPages - lastNumPages;

    // Get the last index of the "page bar" element array, for validating range. Can result in -1, indicating empty
    const lastIDOfPageNumElems = pageBar.pages.length - 1;

    // Zero difference indicates that there is a correct number of elements in the DOM. Do nothing and break the "else ... if" chain
    if (pageDiff === 0) { /* An empty block to break the "else ... if" chain */ }

    // The difference is not zero
    // A positive difference indicates that more elements need to be added to the DOM
    else if (pageDiff > 0) {
        // Iterate over page indices, 0-based
        for (let i = lastNumPages-1; i <= numPages-1; i++) {
            // If there were 0 pages previously, then this for-loop will iterate page index -1, which is invalid. Do nothing and continue this for-statement.
            if (i <= -1) continue;

            // Check if there is NOT a corresponding "page number" element created already
            if (i > lastIDOfPageNumElems) {
                // Then, a new "page number" element needs to be created and set up
                // Base HTML element
                const numElem = document.createElement("span");

                // Set the displayed number as a part of the number sequence {1, 2, 3 ...}. Addify by 1 to convert from 0-based to 1-based
                numElem.textContent = i + 1;

                // Set HTML class attribute, allowing the CSS stylesheet to apply
                numElem.setAttribute("class", "page-bar number");

                // Listen for click event
                numElem.addEventListener("click", handlePageBarClick);

                // Store the new "page number" element reference inside the pageBar object
                pageBar.pages[i] = numElem;
            }

            // Get the previously or newly created "page number" element
            const elemToAppend = pageBar.pages[i];

            // Before using the returned element, check if it's invalid
            if (typeof elemToAppend === "undefined") {
                console.error("Product Grid - updatePageBar: got an undefined return when accessing the array of stored 'page number' elements");
                // Do nothing and continue for-statement
                continue;
            }

            // Add the previously or newly created "page number" element to the "page bar" container 
            pageBar.container.appendChild(elemToAppend);
        }
    }

    // The difference is not zero nor positive
    // A negative difference indicates that one or more "page number" elements need to be removed from the DOM
    else if (pageDiff < 0) {
        // Iterate over page indices, 0-based.
        for (let i = lastNumPages-1; i >= numPages-1; i--) {
            // Remove element from the DOM
            pageBar.container.removeChild(pageBar.pages[i]);
        }
    }

    /*
    // Shorter version: Reset and add from the start again
    // Reset by removing all "pagen number" elements from the DOM
    for (const elem of pageBar.pages) {
        pageBar.container.removeChild(elem);
    }

    // Restarting from the beginning, add as many "page number" elements as necessary to the DOM
    for (let i = 0; i < numPages; i++) {
        pageBar.container.appendChild(pageBar.pages[i]);
    }
    */

    // Now, all the appropriate "page number elements" are displayed

    
    // Highlight the "current page number element" in the "page bar"
    // Before adding a highlight, remove any previous highlights.
    const highlightedPageNumElems = pageBar.container.querySelectorAll(".current");
    for (const highlighted of highlightedPageNumElems) {
        // Overwrite the value of attribute "class". This effectively removes the "current" class name, and stops the CSS stylesheet from applying rules on this element
        highlighted.setAttribute("class", "page-bar number");
    } 

    // Now, when all previous highlights are removed, add a highlight to the "current page number element"
    // Get the "page number element" that corresponds to the "current page index"
    const currentPageNumElem = pageBar.pages[currentPageID];

    // Check if the accessed "page number element" is valid
    if (currentPageNumElem !== null && currentPageNumElem instanceof HTMLElement) {
        // Overwrite the value of attribute "class". This effectively adds the "current" class name. This allows the CSS stylesheet to apply rules on this element
        currentPageNumElem.setAttribute("class", "page-bar number current");
    }

    // Now:
    // - All the "available page number elements" are displayed
    // - The "current page number element" is the only instance with highlight

    // Lastly, update the "last number of product grid pages"
    lastNumPages = numPages;
}

/** Update the number of available pages that was reported from the server for the current query */
function updateNumPages () {
    // Before proceeding, check if endChunkID is NOT valid
    if (!Number.isInteger(endBlockID)) console.error("Product Grid - updateNumPages: variable 'endChunkID' is invalid");
    
    // Calculate the number of pages by dividing the number of available chunks reported from server, with the page size from the client. Note: pageSize is expressed as "number of chunks per page"
    const result = (endBlockID + 1) / pageSize;
    
    // Check if the result is invalid. There can't be zero pages, even if there are no results
    if (result <= 0) console.error("Product Grid - updateNumPages: Result from calculation has a zero or negative value");

    numPages = result;
}

/** The event handler for "click" event for every "page number" element
 * @param {Event} event 
 */
function handlePageBarClick (event) {
    // To identify which "page index" has been clicked, find the index of the event target inside the script-level variable with "page number" elements.
    const clickedElementID = pageBar.pages.indexOf(event.target);

    // Check if the array method 'indexOf' returned -1, indicating failure for finding the item
    if (clickedElementID === -1) {
        console.error("Product Grid - handlePageBarClick: Failed finding the index of the event target inside the array of 'page number' elements");
        // Do nothing and return
        return;
    }

    // Check if the "clicked element index" is the same as the "current page index". Then, do nothing and return
    if (clickedElementID === currentPageID) return;

    // Now, the "clicked element index" value is considered as a valid "page index" that has been clicked on 

    // Change page to the "clicked element index"
    changePageInProductGrid(clickedElementID);
}

/** Change the "product results page" in the "product grid" to the given "page index"
 * @param {number} newPageID - The index, 0-based, of the new page to open 
*/
function changePageInProductGrid (newPageID) {
    // Before making any changes to the state of the "product grid", do a custom set up of a new "product grid request", and test it against custom pre-requisites before it can be approved for being sent to the server
    
    // For the "start index" of this "product grid request", set it to the first "product entry index" of the new "product grid page"
    newProductGridRequest.startID = getProductPointerForPageID(newPageID) + 1;

    // Do the general setup of creating a new "Product Grid Request" for changing page in the "product grid"
    generalSetupOfNewProductGridRequest();

    // Skip checking the general pre-requisites to fetch and propagate the "product grid". This is because changing page in the "product grid" overrides the majority of the general pre-requisites.

    // Check if enough time has passed since the last request was approved to be sent to the server
    if (!checkRequestTimeoutThresholdForApproval) {
        // Then, nullify the new "product grid request" and return
        nullifyNewProductGridRequest();
        return;
    }

    // Now, the new request for changing "product grid" page is considered approved to be applied on the client-side and to be sent to the server. Therefore, the state of the "product grid" can be changed.

    // Use the general routine for manipulating the browsing history while changing the state of the "product grid"
    // The function can potentially throw errors
    try { generalHistoryManipulation() }
    catch (e) { console.error(`Caught an error while calling the general function for manipulating the browsing history: ${e}`) }

    // Before changing the value of "current page index", remember its current value as the "last page index"
    lastPageID = currentPageID;
    
    // Update the script-level variable "current page index" with the argument "new page index"
    currentPageID = newPageID;

    // Set up the current "product pointer" for a new "page index"
    currentProductPointer = getProductPointerForPageID(newPageID);

    // Update which "page bar number element" that should be highlighted as the current page
    updatePageBar();

    // Clear out the "product grid" on all instances of "product entry"
    clearProductGrid();

    // For timeout processing, save the current date as the "last product grid request date"
    lastProductGridRequestDate = new Date();

    // Finally, fetch a "product grid response" with the new "product grid request" and process it
    fetchAndProcessProductGridResponse();
}


/** Creates an "URL query string" from the given "Product Query Options" and adds it to the given "URL object", or to a new "URL object" created from the given string.
 * @param {string | URL} url - The "URL string" or "URL API object" that will be used as the base for appending the created "URL query string"
 * @param {productQueryOptions} query - The query to stringify and add to an URL query string
 * @param {number} pageID - The page index to stringify and add to an URL query string
 * @returns {URL} An "URL API object" containing the created "query string"
 * @throws {TypeError | Error} If "url" argument is invalid or omitted
 */
function appendProductGridStateToURL (url, query, pageID) {
    // url invalid?
    if (
        typeof url === "undefined"
        || !url
        || (typeof url !== "string" && !(url instanceof URL))
    ) {
        // Do no more work and throw an Error
        throw new Error("Product Grid - addQueryOptionsToURL: The mandatory argument 'url' is invalid");
    }

    /** The resulting "URL API object". For easier processing, this variable is restricted to one type only, rather than two: string | "URL API object"
     * @type {URL} */
    let URLResult;

    // Check if the "url" argument is a string or a "URL API object"?
    // Start by checking if the "url" argument is a string
    if (typeof url === "string") {
        // Then create a new "URL API object" with the "url" string argument. Store it for further processing
        // Use a "try ... catch" statement to catch any TypeError thrown by the URL constructor, indicating that the given URL-string was invalid
        try { URLResult = new URL(url); }
        catch (e) {
            // Then, throw an error, but with different messages depending on the type
            if (e instanceof TypeError) throw new TypeError("Product Grid - addQueryOptionsToURL: The argument 'url' is an invalid string for creating a new URL object");
            else throw new Error(`Product Grid - addQueryOptionsToURL: Caught an error while creating a new URL object: ${e}`);
        }
    }

    // Since "url" argument was not a string type, check if it's a "URL API object"
    else if (url instanceof URL) {
        // Then use the given "URL API object". Store it for further processing
        URLResult = url;
    }

    /* DEPRECATED: Un-applicable when pageID is added
    // Check if the "product query" argument is undefined
    if (typeof query === "undefined") {
        console.error("Product Grid - createURLQueryString: The argument 'query' is undefined");
        // Do no more work and return "null" for failure
        return null;
    }
    // If not undefined, check if the "product query" argument is null has a falsy value
    else if (query === null || !query) {
        // Do no more work and return an empty string, that indicates an empty query
        return "";
    }
    */

    //  DEPRECATED: Replaced with "URLSearchParams API"
    // // Declare variables for storing resulting strings for composition at the end of this function
    // /** @type {string} */
    // let searchStrResult = null;
    // 
    // /** @type {Array.<string>} */
    // let filtersResult = null;
    // 
    // /** @type {number} */
    // let pageNumResult = null;

    queryBlock: {
        // Check if the "product query object" is invalid
        if (
            typeof query === "undefined"
            || typeof query !== "object"
            || !query
        ) {
            // Then do no more work on the "product query object" and its properties. Break this labeled block.
            break queryBlock;
        }

        searchStrBlock: {
            // Check if the "search string" property of the argument is invalid
            if (
                typeof query.searchStr === "undefined"
                || typeof query.searchStr !== "string"
                || !query.searchStr
            ) {
                // If invalid, break this labeled block and continue the outer flow
                break searchStrBlock;
            }

            // TODO: Sanitize the string

            // Now the "search string" property of the argument is considered valid

            /* DEPRECATED: Replaced with "URLSearchParams API"
            // Create a string of a key-value pair
            // key:value = searchStr:[searchStr]
            searchStrResult = `searchStr=${query.searchStr}`;
            */

            URLResult.searchParams.set("searchStr", query.searchStr);
        }

        filtersBlock: {
            // Check if the "filters" property of the argument is invalid
            if (
                typeof query.filters === "undefined"
                || query.filters === null
                || typeof query.filters !== "object"
                || !Array.isArray(query.filters)
            ) {
                // If invalid, break this labeled block and continue the outer flow
                break filtersBlock;
            }

            // Iterate through the nested properties according to the productFilter structure
            for (const filter of query.filters) {
                // Check if the "category type" property is invalid
                if (
                    typeof filter.categoryType === "undefined"
                    || typeof filter.categoryType !== "string"
                    || !filter.categoryType
                ) {
                    // Then do nothing with this filter, because both properties has to be valid for this filter to be considered as usable. Continue this for-statement
                    continue; 
                }

                // Check if the "category identifier" property is invalid
                if (
                    typeof filter.categoryID === "undefined"
                    || typeof filter.categoryID !== "string"
                    || !filter.categoryID
                ) {
                    // Then do nothing with this filter, because both properties has to be valid to be usable. Continue this for-statement
                    continue; 
                }

                // Now both properties "category type" and "category identifier" of this filter are valid

                /* DEPRECATED: Replaced with "URLSearchParams API"
                // If the "filters result" variable is still null, then make it into an array type before propagating it with filter entries
                if (filtersResult === null) filtersResult = new Array(); 
                */

                /* DEPRECATED: Replaced with "URLSearchParams API"
                // Create strings of key-value pairs:
                // key:value = [category type]:[category identifier]
                filtersResult.push(`${categoryType}=${categoryID}`);
                */

                URLResult.searchParams.set(filter.categoryType, filter.categoryID);
            }
        }

        sortBlock: {
            // Check if the "sort" property of the argument is invalid
            if (
                typeof query.sort === "undefined"
                || typeof query.sort !== "string"
                || !query.sort
            ) {
                // If invalid, break this labeled block and continue the outer flow
                break sortBlock;
            }

            // TODO: Sanitize the string

            // Now the "sort" property of the argument is considered valid

            URLResult.searchParams.set("sort", query.sort);
        }
    }

    pageNumBlock: {
        // To determine the page number, the argument "page index" will be used

        // Check if the "current page index" is invalid or redundant. The first page index (0) is considered redundant for storing in the URL
        if (
            typeof pageID === "undefined"
            || typeof pageID !== "number"
            || pageID <= 0
        ) {
            // Then do nothing and break this labeled block
            break pageNumBlock;
        }

        // Now, the "current page index" is considered valid and will be used for the "page number"
        
        // Convert the 0-based index to 1-based number
        const pageNumResult = pageID + 1;

        URLResult.searchParams.set("page", pageNumResult);
    }

    /* DEPRECATED: Replaced with "URLSearchParams API"
    // Check if there are NO results of "search string" AND "product filters" AND "page number"
    if (!searchStrResult && !filtersResult && !pageNumResult) {
        // Then only return an empty string, which is considered as a valid value that indicates an empty "product query" and a "page index" at 0 
        return "";
    }

    // Now, there is at least one result variable that is valid
    // To get the final output string, all the resulting data will be appended together, one-by-one
    */

    //  DEPRECATED: Replaced with "URLSearchParams API"
    // /** An object of an "object-literal class" that appends strings, using the "URL query string" format  */
    // const appendQueryStrObj = {
    //     isFirst: true,
    //     appendQueryStr: function (baseStrRef, appendStrRef) {
    //         if (this.isFirst) {
    //             baseStrRef += appendStrRef;
    //             this.isFirst = false;
    //         }
    //         else baseStrRef += `&${appendStrRef}`;
    //     }
    // };

    
    /* DEPRECATED: Replaced with "URLSearchParams API"
    // Declare the final resulting "URL query string", and start the query string with "?" to indicate a "query string" within a URL. It should be followed by one or more key-value pairs.
    let queryStr = "?";
    */

    /* DEPRECATED: Replaced with "URLSearchParams API"
    // Check if the property "search string" of query had any results
    if (searchStrResult) {
        
        // BUG: The first key-value pair will have a redundant ampersand "&"
        // Append with "&" to the query string
        queryStr += `&${searchStrResult}`;
        
    }
    */

    /* DEPRECATED: Replaced with "URLSearchParams API"
    // Check if the property "filters" of query had any results
    if (
        filtersResult
        && Array.isArray(filtersResult)
        && filtersResult.length > 0
    ) {
        // Iterate over every key-value pair of array "filters result"
        for (const keyAndValue of filtersResult) {
            // Append with "&" to the query string
            queryStr += `&${keyAndValue}`;
        }
    }
    */

    /* DEPRECATED: Replaced with "URLSearchParams API"
    // Check if there are any results for "page number"
    if (pageNumResult) {
        queryStr += `&${pageNumResult}`;
    }
    */

    /* DEPRECATED: Replaced with "URLSearchParams API"
    // Now the "final result" is a complete "URL query string" of format "?key1=value1&key2=value2&key3=value3 ..."
    return queryStr;
    */

    return URLResult;
}

/** (TODO: change to "parseProductGridStateURL" ) Parse a "URL query string" into a "productQuery" object and return it
 * @param {string} urlStr - The "URL string" containing the "query string". The "query string" will extracted and be parsed into a "productQuery" type object.
 * @returns {productQueryOptions}
*/
function parseURLQueryString (urlStr) {

    // Possible keys in "URL Query String":
    // searchStr
    // productFilter1, productFilter2, ...
    // page

    // To extract the "URL query string" more easily, setup a "URL API object"

    /** The local "URL API object" reference. @type {URL} */
    let urlObj;

    // Validate the "URL string" argument more easily by using the in-built validation inside the constructor of "URL API"
    try { urlObj = new URL(urlStr); }
    catch (e) {
        console.log(`Product Grid - parseURLQueryString: The constructor of 'URL API' has thrown an error: ${e}`);
        // Do no more work and return null, indicating an empty query
        return null;
    }

    // Now, the "URL string" is considered valid and has been passed into a "URL API object"

    // DEPRECATED: Replaced by using "URL API" and "URLSearchParams" for easier extraction
    // // Check if the argument is undefined
    // if (typeof urlStr === "undefined") {
    //     console.error("Product Grid - parseURLQueryString: The argument 'URL' is undefined");
    //     // Do no more work and return null, indicating an empty query
    //     return null;
    // }
    // // If not undefined, check if the argument is invalid
    // else if (
    //     typeof urlStr !== "string"
    //     || !urlStr
    // ) {
    //     // Do no more work and return null, indicating an empty query
    //     return null;
    // }
    // 
    // // Now, the "URL query string" argument is considered valid
    // 
    // // Create a URLSearchParams object for use of in-built utility methods for parsing "URL query strings". The constructor accepts strings with and without question mark "?" prefix.
    // const URLSearchParamsObj = new URLSearchParams(urlStr);

    // Get the "URLSearchParams object" from the "URL API object"
    const URLsearchParamsObj = urlObj.searchParams;

    /** The resulting "search string" as a property of the "product query" data structure. Null value indicates that there is no "search string" @type {string} */
    let searchStr = null;

    /** Limit instances of "search string" to the first occurence only, by using a one-time-gate. @type {boolean} */
    let hasNotFoundSearchStr = true;

    /** The resulting "product filter array", as the "filters" property of "product query" data structure. @type {Array.<productFilter>} */
    const filters = new Array();

    // Validate the "URL query string" for use as a "productQuery"
    for (const [key, value] of URLsearchParamsObj) {
        // Check if the key is the "search string"?
        if (hasNotFoundSearchStr && key === "searchStr") {
            // Check if the corresponding value is invalid
            // FEATURE: Create a separate function that filters productQuery-related objects with an exclusive list of allowed characters. a-z, A-Z, hyphen "-", and that "down-grades" accented characters (Ö = O) and converts to small-case
            if (!value) {
                // Then do no more work and continue this for-statement
                continue;
            }

            // The corresponding value is valid, so proceed to use it to assign "search string"
            searchStr = value;
            
            // This branch was successful. Close the gate
            hasNotFoundSearchStr = false;
        }

        // Check if the "key" AND "value" can be found in each of their respective set of valid strings 
        if (
            validProductFilterStrings.categoryType.has(key)
            && validProductFilterStrings.categoryID.has(value)
        ) {
            // Then this key-and-value pair is considered valid for use as a categoryType-categoryID pair for "productFilter"
            // Push on to the array of resulting filters
            filters.push({
                categoryType: key,
                categoryID: value
            })
        }
    }

    // Now, the "URL string" has been iterated and produced results. The results are ready to be inserted into the final "product query" object

    // Create the "product query object" so that we can propagate it with properties holding the results, if those are valid.
    const queryObj = {};

    // Check if the "search s"
    if (searchStr !== null && searchStr.length > 0) {
        queryObj.searchStr = searchStr;
    }
    if (filters.length > 0) {
        queryObj.filters = filters;
    }

    // As a last safety line, check if the final resulting "product query object" is empty
    if (
        typeof queryObj.searchStr === "undefined"
        && typeof queryObj.filters === "undefined"
    ) {
        // The return null, indicating an empty "product query"
        return null;
    }

    // Reaching this line is considered success. So, return the final resulting "product query object"
    return queryObj;
}

/** (TODO: Get those sets dynamically from server) Initialize the object holding sets of valid strings for productFilter. Avoids namespace cluttering. A placeholder function in place of a server response. */
function initValidProductFilterStrings () {

    /** A set of valid CategoryType strings for validating instances of "productFilter" data @type {Set.<string>} */
    const validCategoryTypeSet = new Set([
        "form",
        "culture",
        "kind"
    ]);

    /** A set of valid "form" strings for validating instances of "productFilter" data @type {Set.<string>} */
    const formSet = new Set([
        "figurines",
        "jewelry",
        "posters",
        "mugs"
    ]);

    /** A set of valid "culture" strings for validating instances of "productFilter" data @type {Set.<string>} */
    const cultureSet = new Set([
        "egyptian",
        "greek",
        "chinese",
        "nordic"
    ])

    /** A set of valid "kind" strings for validating instances of "productFilter" data @type {Set.<string>} */
    const kindSet = new Set([
        "humanoid",
        "canine",
        "feline",
        "avian",
        "reptilian",
        "aquatic",
        "equine",
        "insectoid",
        "hybrid"
    ])

    // To provide a simple method of validating "category identifiers", combine all "category identifier" sets into one set.
    const categoryIDSet =  formSet.union(cultureSet.union(kindSet));

    // Those objects created in this function will be kept alive from garbage collection for the life of this script, since their references are now being stored in a script-level object
    validProductFilterStrings = {
        categoryType: validCategoryTypeSet,
        categoryID: categoryIDSet,
        form: formSet,
        culture: cultureSet,
        kind: kindSet
    }
}

/** (TODO: Is this needed or not? Then implement "sort" property) Validate a "product query options object" for its structure, keys and values
 * @param {productQueryOptions} query
 * @returns {boolean} a boolean for result
 */
function validateProductQueryOptionsObj (query) {    
    // Check if outer object is invalid
    if (
        typeof query === "undefined"
        || typeof query !== "object"
    ) return false;
    
    // Check if the "searchStr" property is present
    if (typeof query.searchStr !== "undefined") {
        // Then check if the "searchStr" property is invalid
        if (
            typeof query.searchStr !== "string"
            || !query.searchStr
        ) return false;
    }

    // Check if the "filters" property is present
    if (typeof query.filters !== "undefined") {
        // Then check if the "filters" property is invalid
        if (!Array.isArray(query.filters)) return false;

        // Since the "filters" property is an array, check if any of the "key-value pair entries" are valid 
        for (const [key, value] of query.filters) {
            if (
                !validProductFilterStrings.categoryType.has(key)
                || !validProductFilterStrings.categoryID.has(value)
            ) return false;
        }
    }

    // Check if the "sort" property is present
    if (typeof query.sort !== "undefined") {
        // Then check if the "sort" property is invalid
        if (typeof query.sort !== "string") return false;
    }

    // Reaching this line is considered success
    return true;
}

/** Clear the "product grid" on all "product entry" instances and move their references to the "product entry pool". This function may be used when the "product grid page" or "product query" have changed. This function does not change any counter or index variable */
function clearProductGrid () {

    /** All child elements of the "grid container"
     * @type {HTMLCollection} */
    const children = grid.children;

    // Iterate through every child element of the "grid container"
    for (const element of children) {
        // Check if the element is a valid "product entry" 
        if (
            // Check the internal "HTML tag" 
            element.localName === "product-entry"

            // AND check if the reference is an instance of class "productEntry"
            && element instanceof productEntry
        ) {
            // DEPRECATED: attributesChangedCallback is replaced by using a direct function call 
            //
            // // Deactivate the "product entry" by clearing its data, which is stored in an attribute by design. In the module of "product entry", the "attributeChangedCallback" function will be called to process this.
            // element.setAttribute("product-entry-data", "");

            // DEPRECATED: Moved to the file "product_entry.js" to the class "productEntry"
            //
            // // Add to the "product entry pool"
            // productEntryPool.push(element);
            
            // Remove from the DOM. The Custom Elements API lifecycle callback "disconnectedCallback" will be called on this instance
            element.remove();
        }
        // If there are any other elements of any other type in this container, don't remove those unless there is a need for it.
    }
}

/** TODO: Update the "End of results" text after the end of the grid */
function updateEndOfResultsText () {
    // Check if pages are NOT enabled. Then, do nothing and return
    if (!arePagesEnabled) return;
    
    // Check if the property "chunk index" of the script-level variable "fulfilled propagation request" is invalid
    if (
        typeof fulfilledPropagationRequest.chunkID === "undefined"
        || typeof fulfilledPropagationRequest.chunkID !== "number"
        || fulfilledPropagationRequest.chunkID < 0
    ) {
        console.error("Product Grid - updateEndOfResultsText: the property 'chunk index' of the script-level variable 'fulfilled propagation request' is invalid.");
        // Do nothing and return
        return;
    }

    // Check if the "endChunkID" is invalid
    if (
        typeof endBlockID === "undefined"
        || typeof endBlockID !== "number"
        || endBlockID < 0
    ) {
        console.error("Product Grid - updateEndOfResultsText: the script-level variable 'endChunkID' is invalid.");
        // Do nothing and return
        return;
    }
    
    // Check if the "current received chunk index" has reached the ending index, reported by the server on initialization
    if (fulfilledPropagationRequest.chunkID >= endBlockID) {
        // Show the "end of results text element"
        
        // Check if the element is NOT created yet?
        if (endOfResultsText.element === null) {
            // The create it
            endOfResultsText.element = document.createElement("span");

            // Set the "class" attribute to enable applying the CSS stylesheet
            endOfResultsText.element.setAttribute("class", "end-of-results-text text");

            // Set the inner text of the element
            endOfResultsText.element.innerText = "Bottom of results.";
        }

        // Add the element to the DOM
        endOfResultsText.container.appendChild(endOfResultsText.element);
    }

    // Otherwise, the "current received chunk index" has NOT reached the ending index
    else {
        // Hide the "end of results text element"
        // Check if the element is NOT created
        if (endOfResultsText.element === null) return;
        
        // Remove the element from the DOM, but keep its reference to allow re-usage
        endOfResultsText.element.remove();
    }
}

/** (DEPRECATED: Replaced by the other variant "comparePropagationRequestsForEquality") Compares two "chunk request" objects for equality by iterating through every nested values inside nested objects and arrays. For data structure details, please refer to the "chunkRequest" type.
 * @param {chunkRequest} chunkRequest1
 * @param {chunkRequest} chunkRequest2
 * @returns {boolean} - True for equality, false for inequality
 */
function compareChunkRequestsForEquality (chunkRequest1, chunkRequest2) {
    // "Chunk index" inequality
    if (chunkRequest1.ID !== chunkRequest2.ID) return false;

    // "Product query search string" inequality
    if (chunkRequest1.query.searchStr !== chunkRequest2.query.searchStr) return false;

    // "Product query filters" array length inequality
    if (chunkRequest1.query.filters.length !== chunkRequest2.query.filters.length) return false;

    // Now, the "filters" arrays have been concluded to have the same length 

    // Iterate through the "filters" arrays, knowing that they have the same length
    for (let i = 0; i < chunkRequest1.query.filters.length; i++) {
        // "Category type" inequality
        if (chunkRequest1.query.filters[i].categoryType !== chunkRequest1.query.filters[i].categoryType) return false;

        // "Category identifier" inequality
        if (chunkRequest1.query.filters[i].categoryID !== chunkRequest1.query.filters[i].categoryID) return false;
    }

    // When reaching this line, the entire "chunk request 1" and "chunk request 2" objects are considered equal for every nested value
    return true;
}

/** (DEPRECATED: Replaced by "productGridRequest" variant) Compares two "propagation request" objects for equality by iterating through every nested values inside nested objects and arrays. For data structure details, please refer to the "propagationRequest" type.
 * @param {propagationRequest} request1
 * @param {propagationRequest} request2
 * @returns {boolean} - True for equality, false for inequality
 */
function comparePropagationRequestsForEquality (request1, request2) {
    // The algorithm varies for the two types of propagation requests: chunk and "index interval"
    // Firstly, check if the two arguments are chunk type
    if (
        typeof request1.chunkID === "number"
        && typeof request2.chunkID === "number"
    ) {
        // Check for "chunk index" inequality
        if (request1.chunkID !== request2.chunkID) return false;
    }

    // Otherwise, check if two arguments are "index interval" type
    else if (
        typeof request1.interval.startID === "number"
        && typeof request2.interval.startID === "number"
        && typeof request1.interval.endID === "number"
        && typeof request2.interval.endID === "number"
    ) {
        // Check for "index interval" inequality
        if (
            request1.interval.startID !== request2.interval.startID
            || request1.interval.endID !== request2.interval.endID
        ) return false;
    }

    // Neither type test succeeded, indicating that there is an invalid value
    else {
        console.error("Product Grid - comparePropagationRequestsForEquality: There is at least one invalid value about the the 'request' arguments");
        // Return false for inequality
        return false;
    }

    // Now, only the "product query" data remains to be tested

    // "Product query search string" inequality
    if (request1.query.searchStr !== request2.query.searchStr) return false;

    // "Product query filters" array length inequality
    if (request1.query.filters.length !== request2.query.filters.length) return false;

    // Now, the "product query filters" arrays have been concluded to have the same length 

    // Iterate through the "product query filters" arrays, knowing that they have the same length
    for (let i = 0; i < request1.query.filters.length; i++) {
        // "Category type" inequality
        if (request1.query.filters[i].categoryType !== request1.query.filters[i].categoryType) return false;

        // "Category identifier" inequality
        if (request1.query.filters[i].categoryID !== request1.query.filters[i].categoryID) return false;
    }

    // When reaching this line, the entire "request 1" and "request 2" objects are considered equal for every nested value
    // Return true for equality
    return true;
}

/** (DEPRECATED: Moved to the productEntry class as a static method) Check if the given "product entry data response object" is valid or not
 * @param {productEntryDataResponse} productEntryData - The "product entry data response" object to validate
 * @returns {boolean} - Returns true for a valid object, and false for an invalid object. 
*/
function isProductEntryDataResponseValid (productEntryData) {
    // Is undefined?
    if (typeof productEntryData === "undefined") {
        console.error("Product Grid - isProductEntryDataResponseValid: The argument 'product entry data response' is undefined");
        return false;
    }

    // Is imgSrc invalid?
    if (
        typeof productEntryData.imgSrc === "undefined"
        || (
            typeof productEntryData.imgSrc !== "string"
            && !(productEntryData.imgSrc instanceof URL)
        )
        || !productEntryData.imgSrc
    ) return false;

    // Is the URL of imgSrc invalid?
    try {
        // Use the in-built validation logic inside the URL constructor
        url = new URL(productEntryData.imgSrc);
    }
    catch (e) {
        // Check if the URL constructor returned a TypeError object to indicating an invalid URL address
        if (e instanceof TypeError) return false;
    }

    // Is "name" invalid?
    if (
        typeof productEntryData.name === "undefined"
        || typeof productEntryData.name !== "string"
        || !productEntryData.name
    ) return false;
    
    // Is "culture invalid"?
    if (
        typeof productEntryData.culture === "undefined"
        || typeof productEntryData.culture !== "string"
        || !productEntryData.culture
    ) return false;

    // Is priceCents invalid?
    if (
        typeof productEntryData.priceCents === "undefined"
        || typeof productEntryData.priceCents !== "number"
        || !Number.isInteger(productEntryData.priceCents)
    ) return false;

    // productURL invalid?
    if (
        typeof productEntryData.productURL === "undefined"
        || (
            typeof productEntryData.productURL !== "string"
            && !(productEntryData.productURL instanceof URL)
        )
        || !productEntryData.productURL
    ) return false;

    // Is the URL of productURL invalid?
    try {
        // Use the in-built validation logic inside the URL constructor
        url = new URL(productEntryData.productURL);
    }
    catch (e) {
        // Check if the URL constructor returned a TypeError object to indicating an invalid URL address
        if (e instanceof TypeError) return false;
    }

    // When reaching this line, the "product entry data response object" is considered valid
    return true;
}

/** (TODO: Is this function replaced by the similar function for "product query options"?) Checks if the given "product filter object" is valid.
 * @param {productFilter} filter
 * @returns {boolean} - Returns true for a valid filter, and false for an invalid filter.
 */
function isProductFilterValid (filter) {
    // Is the argument "filter" undefined?
    if (typeof filter === "undefined") {
        console.error("Product Grid - isProductFilterValid: The argument 'filter' is undefined.");
        return false;
    }

    // Is CategoryType invalid?
    if (
        typeof filter.categoryType === "undefined"
        || typeof filter.categoryType !== "string"
        || !filter.categoryType
    ) return false;

    // Is CategoryID invalid?
    if (
        typeof filter.categoryID === "undefined"
        || typeof filter.categoryID !== "string"
        || !filter.categoryID
    ) return false;

    // Check if categoryType or categoryID NOT are included in the corresponding sets of "valid product filter strings"
    if (
        !validProductFilterStrings.categoryType.has(filter.categoryType)
        || !validProductFilterStrings.categoryID.has(filter.categoryID)
    ) return false;

    // When reaching this line, the "product filter object" is considered valid
    return true;
}

/** Show or hide the "horizontal bar element"
 * @param {boolean} doShow - Set to true to show the "horizontal bar element". Set to false hide it
 */
function setHorizontalBarVisibility (doShow) {
    // Check if pages are NOT enabled? Then do nothing and return
    if (!arePagesEnabled) return;

    // Check if the argument "do show" is set to show the element
    if (doShow) {
        // Check if the element is NOT created yet
        if (horizontalBar.element === null) {
            // Create the "img" element
            horizontalBar.element = document.createElement("img");

            // Set "class" attribute of the element
            horizontalBar.element.setAttribute("class", "horizontal-bar bar");

            // Set "src" attribute of the "img" element
            horizontalBar.element.src("/media/ornaments/golden-ornamental-frames_23-2147545654_upscaled_01.png");
        }

        // Add the element to the DOM by adding it to the corresponding container
        horizontalBar.container.appendChild(horizontalBar.element);
    }
    
    // Otherwise, the argument is set to hide the element
    else {
        // Check if the element is NOT created yet. Then do nothing and return
        if (horizontalBar.element === null) return;

        // Remove the element from the DOM, but keep the reference to allow re-usage
        horizontalBar.element.remove();
    }
}

/** A setter function for the script-level variable "current product query". Only intended for usage after the initalization, such as applying a search term in the "search bar" in "header", or when applying settings in the "product filter menu".
 * @param {productQueryOptions} query - The new "product query" value. Undefined filters or searchStr property indicates no change, but null values are treated as intentional. 
*/
function setCurrentQueryOptionsVar (query) {
    
    // Check if pages are NOT enabled
    if (!arePagesEnabled) {
        console.error("Product Grid - setCurrentQuerySettingsVar: The script-level variable 'are pages enabled' is false, while expecting it to be true");
        // Do nothing and return
        return;
    }

    let wasOnePropertySuccessful = false;
    
    filtersBlock: {
        // Check if property "product filters" is undefined
        if (typeof query.filters === "undefined") {
            // Then, do no more work in this block and return to outer block
            break filtersBlock;
        }

        currentQueryOptions.filters = query.filters;
        wasOnePropertySuccessful = true;
    }

    searchStrBlock: {
        // Check if property "search string" is undefined
        if (typeof query.searchStr === "undefined") {
            // Then, do no more work in this block and return to outer block
            break searchStrBlock;
        }

        currentQueryOptions.searchStr = query.searchStr;
        wasOnePropertySuccessful = true;
    }

    // If no property was successfully set, then do nothing and return 
    if (!wasOnePropertySuccessful) return;

    // TODO: Fetch the new endChunkID from server, and wrap the rest of the function in a then-promise

    // Since the "product query" has been changed, update the "page state"
    updatePageState();

    // Clear the "product grid" to make it empty of "product entries"
    clearProductGrid();

    // Reset the "chunk index" for this page
    getProductPointerForPageID(currentProductPointer, currentPageID);

    // And lastly, request to propagate the "product grid" with "product entries"
    requestToFetchAndPropagateGrid();
}

/** Update the states of the "product grid page" feature. This function should be run when changes as been made to the "product query", "product entry chunk size", "product entry ending chunk index", or "product entry ending product index" */
function updatePageState () {
    // "update page size" should always evaluate before every other routine for the "page state"
    updatePageSize();

    // "update number of pages" should always evaluate before "update page bar"
    updateNumPages();
    updatePageBar();
}

/** (TODO: Update this description) Set up the "start index" property of the "fulfilled product grid request" variable for the given "page index". This ensures that the next "start index" of new and pending "product grid requests" becomes the starting index of the given "page index" 
 * @param {number} pageID - The "page index" to set up for
 * @returns {number | null} On success, returns a number. On failure, returns null.
 */
function getProductPointerForPageID (pageID) {
    // Check if the argument "pageID" is invalid
    if (
        !Number.isInteger(pageID)
        || !pageID < 0
    ) {
        console.error("Product Grid - getProductPointerForPageID: The argument 'pageID' is invalid.");
        
        // Do nothing and return null for failure
        return null;
    }

    // Check if the script-level variable pageSize is invalid
    if (
        !Number.isInteger(pageSize)
        || !pageSize < 0
    ) {
        console.error("Product Grid - getProductPointerForPageID: The script-level variable pageSize is invalid.");
        
        // Do nothing and return null for failure
        return null;
    }
    
    // Desired sequence of numbers: (n-1)*pageSize-1, where n has a value of zero or greater. The intention is to ensure that the next "product entry pointer" is the starting index of the new "page index". This is achieved by setting the "product entry pointer" to one unit behind the new page.
    return (pageID - 1) * pageSize - 1;
}

/** (TODO) A general set up for the script-level "new product grid request" variable. Intended to evaluate before the "pre-requisites to propagate the product grid" function */
function generalSetupOfNewProductGridRequest () {
    // TODO: Should the variable be nullified before setting it up? Probably somewhere else
    
    // Set up the "start index" of the new "product grid request"
    // First, check if the property is still null, indicating that is not already set earlier
    if (newProductGridRequest.startID === null) {
        // Then, set "start index" to one step over the current "product entry pointer"
        newProductGridRequest.startID = currentProductPointer + 1;
    }

    // Determine the "length" property of the new "product grid request"
    lengthBlock: {
        // Calculate the available space from one step behind the "start index" of the "new product grid request"
        let availableSpaceResult;

        // The function may throw an error
        try { availableSpaceResult = getAvailableSpaceForPropagation(newProductGridRequest.startID - 1) }
        catch (e) {
            console.error(`Product Grid - generalSetupOfNewProductGridRequest: Caught an error while determining the the "length" property: ${e}`);
            
            // Then, skip processing this property. Break this labeled block
            break lengthBlock;
        }
        
        // Process the "available space result"
        if (
            // Check if the script-level variable "block size" is valid
            Number.isInteger(blockSize)
            && blockSize > 0

            // AND check if the "available space result" is greater than or equal to the script-level variable "block size"
            && availableSpaceResult >= blockSize
        ) {
            // Then, omit assigning this property. Break this labeled block
            break lengthBlock;
        }

        // When reaching this line, it's considered appropriate to use the result of "available space" to assign the "length" property
        newProductGridRequest.length = availableSpaceResult;
    }
    
    // For the "product query options", copy the values from the script-level "current product query options" variable
    newProductGridRequest.searchStr = currentQueryOptions.searchStr;
    newProductGridRequest.filters = currentQueryOptions.filters;
    newProductGridRequest.sort =  currentQueryOptions.sort;

    // Check if the script-level variable "block size" has NOT been set to a valid integer yet
    if (
        !Number.isInteger(blockSize)
        || blockSize <= 0
    ) {
        // Then, set the get-directive for "block size" to true
        newProductGridRequest.getBlockSize = true;
    }

    // Process the get-directive for "last available product entry index"
    if (
        // Check if the script-level variable "last available product index" is invalid
        !Number.isInteger(lastAvailableProductID)
        || lastAvailableProductID < 0

        // OR if the corresponding property from the "pending product grid request" has a truesy value. The intention is to take-over the get-directive from the pending request
        || pendingProductGridRequest.getLastAvailableID
    ) {
        newProductGridRequest.getLastAvailableID = true;
    }

    // For the get-directive for "product filter menu template", check the script-level variables if the "product filter menu" is enabled and if the "product filter menu template" is still null
    if (
        isProductFilterMenuEnabled
        && productFilterMenuTemplate === null
    ) {
        newProductGridRequest.getProductFilterMenuTemplate = true;
    }
}

/** Use the script-level variable "new product grid request" to fetch and then process the "product grid response" */
function fetchAndProcessProductGridResponse () {
    /** The URL object with URLSearchParams for fetching from the "Product Grid API"
     * @type {URL} */
    let fetchURL = null;

    try { fetchURL = new URL("source/collectors-store/client/json/product_grid_response_sample.json"); }
    catch (e) {
        if (e instanceof TypeError) console.error("Product Grid - fetchAndProcessProductGridResponse: The URL constructor received an invalid URL address");
        else console.error(`Product Grid - addQueryOptionsToURL: Caught an error while creating a new URL object: ${e}`);
        
        // Reset the new "product grid request" and return
        nullifyNewProductGridRequest();
        return;
    }

    // Insert the properties of the new "product grid request" variable into the "query" part of the URL 
    fetchURL.searchParams.set("start-id", newProductGridRequest.startID);
    if (newProductGridRequest.length !== null) fetchURL.searchParams.set("length", newProductGridRequest.length);
    if (newProductGridRequest.searchStr !== null) fetchURL.searchParams.set("search-str", newProductGridRequest.searchStr);
    
    // The "filters" property is an array of structured objects that needs destructuring
    if (newProductGridRequest.filters !== null) {
        // Iterate through the outer array container in the productFilter structure
        for (const filter of newProductGridRequest.filters) {
            // Format: [categoryType]: [categoryID]
            // The maximum number of "URL query parameters" from the "filters" property should be equal to the total number of "category types" in the product_grid_response_sample.json file
            fetchURL.searchParams.set(filter.categoryType, filter.categoryID);
        }
    }

    if (newProductGridRequest.getBlockSize) fetchURL.searchParams.set("get-block-size", "true");
    if (newProductGridRequest.getLastAvailableID) fetchURL.searchParams.set("get-last-available-id", "true");
    if (newProductGridRequest.getProductFilterMenuTemplate) fetchURL.searchParams.set("get-product-filter-menu-template", "true");

    // Now, the "query" part of the URL for fetching is completed

    /** The closure-scoped "product grid request" used for this instance of fetching and processing
     * @type {productGridRequest} */
    let thisFetchProductGridRequest = structuredClone(newProductGridRequest);

    /** @type {Promise} */
    let fetchAndProcessPromise = fetch(fetchURL)

    // Process the "HTTP response"
    .then((response) => {
        // Check if the "HTTP status code" is NOT OK. Then, do nothing and reject this promise.
        if (!response.ok) return Promise.reject("Product Grid - fetchAndProcessProductGridResponse: The 'HTTP response status code' was not OK");
        
        // Convert the "HTTP response body" to text
        return response.text();
    })

    // Process the string from the "HTTP response body", which should be text in JSON-format
    .then((JSONText) => {
        // Check if the "JSON text" is invalid. Then, do nothing and reject this promise.
        if (
            typeof JSONText === "undefined"
            || typeof JSONText !== "string"
        ) return Promise.reject("Product Grid - fetchAndProcessProductGridResponse: The argument 'JSONText', passed from the previous promise, is invalid.");

        // Parse the "JSON Text" into a "JavaScript object"
        /** The "product grid response" object that has been parsed from "JSON text" from the server
         * @type {productGridResponse} */
        const productGridResponse = JSON.parse(JSONText);

        // Process the newly created object from parsing

        /** If true, update the state of the "product grid pages". If any of the two variables blockSize and lastAvailableProductID are updated on the client, by the "product grid response", set this flag to true. */
        let doUpdatePageState = false;

        // To salvage useful response data in previous requests, save results for checking if the pending "product grid request" has changed since this fetch started
        let hasProductGridRequestChangedWhileWaiting = null;
        let hasProductQueryOptChangedWhileWaiting = null;

        // Destructure the "product query options" properties from the thisFetchProductGridRequest
        /** @type {productQueryOptions} */
        const thisFetchProductQueryOpt = {
            searchStr: thisFetchProductGridRequest.searchStr,
            filters: thisFetchProductGridRequest.filters,
            sort: thisFetchProductGridRequest.sort
        }

        // These comparison-functions are designed to throw TypeErrors if the objects have any invalid values
        try {
            hasProductGridRequestChangedWhileWaiting = !compareProductGridRequestForEquality(thisFetchProductGridRequest, pendingProductGridRequest);
            hasProductQueryOptChangedWhileWaiting = !compareProductQueryOptionsForEquality(thisFetchProductQueryOpt);
        }
        catch (e) { console.error(`Product Grid - fetchAndProcessProductGridResponse: Caught an error while using functions for checking if the properties of the pending "Product Grid Request" have changed: ${e}`) };

        // Process the blockSize property of the "product grid response" in a labeled block
        blockSizeBlock: {
            // Check if the client-side blockSize already is valid
            if (
                !Number.isInteger(blockSize)
                || blockSize <= 0
            ) {
                // Then, it's considered redundant to re-assign it and apply further work. Break this labeled block
                break blockSizeBlock;
            }

            // Now, when the client-side value is invalid, consider using the provided value in the response

            // Check if the blockSize property is missing in the response, even though the get-directive for this property was used
            if (
                typeof productGridResponse.blockSize === "undefined"
                && thisFetchProductGridRequest.getBlockSize
            ) {
                console.error("Product Grid - fetchAndProcessProductGridResponse: The blockSize property is missing from the response, even though the get-directive for this property was used");
                // Then, don't process this property. Break this labeled block.
                break blockSizeBlock;
            }

            // Check if blockSize in the response is invalid
            if (
                typeof productGridResponse.blockSize === "undefined"
                || !Number.isInteger(productGridResponse.blockSize)
                || productGridResponse.blockSize <= 0
            ) {
                console.error("Product Grid - fetchAndProcessProductGridResponse: The blockSize property in the response is invalid.")
                // Then, don't process this property. Break this labeled block
                break blockSizeBlock;
            }

            // Now, it's considered appropriate to use the blockSize property of the response for assigning the script-level variable blockSize
            blockSize = productGridResponse.blockSize;

            // Now, when blockSize has been updated, set the do-directive flag for updating state of "product grid pages" later.
            doUpdatePageState = true;

            // Save this fulfilled get-directive property in the script-level "fulfilled product grid request" variable
            fulfilledProductGridRequest.getBlockSize = true;
        }

        // Process the lastAvailableID property of the "product grid response" in a labeled block
        lastAvailableIDBlock: {
            // Check if the lastAvailableID property is missing in the response, even though the get-directive for this property was used
            if (
                typeof productGridResponse.lastAvailableID === "undefined"
                && thisFetchProductGridRequest.getLastAvailableID
            ) {
                console.error("Product Grid - fetchAndProcessProductGridResponse: The lastAvailableID property is missing from the response, even though the get-directive for this property was used");
                // Then, don't process this property. Break this labeled block.
                break lastAvailableIDBlock;
            }

            // Check if lastAvailableID in the response is invalid
            if (
                typeof productGridResponse.lastAvailableID === "undefined"
                || !Number.isInteger(productGridResponse.lastAvailableID)
                || productGridResponse.lastAvailableID < 0
            ) {
                console.error("Product Grid - fetchAndProcessProductGridResponse: The lastAvailableID property in the response is invalid.")
                // Then, don't process this property. Break this labeled block
                break lastAvailableIDBlock;
            }

            // Since this request could have been replaced by another request while waiting, check if this property is still useful. It would only be useful if the "product queryt options" is still the same as in the most recent "pending product grid request"
            if (hasProductQueryOptChangedWhileWaiting) {
                // Then, this property is not useful anymore and won't be processed. Break this labeled block
                break lastAvailableIDBlock;
            }

            // Now, it's considered appropriate to use the lastAvailableID property of the response for assigning the script-level variable lastAvailableProductID
            lastAvailableProductID = productGridResponse.lastAvailableID;

            // Now, when lastAvailableProductID has been updated, set the do-directive flag for updating state of "product grid pages" later.
            doUpdatePageState = true;

            // Save this fulfilled get-directive property in the script-level "fulfilled product grid request" variable
            fulfilledProductGridRequest.getLastAvailableID = true;
        }

        // Now, after processing the two properties blockSize and lastAvailableID of the "product grid response", consider updating the state of "product grid pages", by checking if the function-scoped do-directive flag was set
        if (doUpdatePageState) updatePageState();

        // Process the productEntries property of the "product grid response" in a labeled block
        productEntriesBlock: {
            // Before processing this property, check if it has been replaced by a more recent request
            if (hasProductGridRequestChangedWhileWaiting) {
                // Then, this property is not useful anymore. Don't process this property. Break this labeled block
                break productEntriesBlock;
            }

            // Check if the productEntries property of the response is invalid
            if (
                typeof productGridResponse.productEntries === "undefined"
                || !Array.isArray(productGridResponse.productEntries)
                || productGridResponse.productEntries.length <= 0
            ) {
                console.error("Product Grid - fetchAndProcessProductGridResponse: The productEntries property in the response is invalid.")
                // Then, don't process this property. Break this labeled block
                break productEntriesBlock;
            }

            // Now, it's considered appropriate to use the productEntries property for propagating the "product grid" with the provided "product entry data responses"
        
            /** The number of successfully inserted "product entries"
             * @type {number} */
            let numSuccessfulProductEntries;

            // Loop through the Product Entry Array (size is determined by server)
            for (const productEntryData of propagateGridResponse.productEntryDataResponses) {
                // Check if the "number of product entries" has exceeded the client-side maximum limit
                if (
                    // Check if maxProducts valid and activated. A zero value means inactivated
                    Number.isInteger(maxProducts)
                    && maxProducts > 0

                    // AND check if the script-level variable "number of product entries" has exceeded the client-side maximum limit, by checking the script-level variable "max number of products"
                    && numProducts >= maxProducts
                ) {
                    // Then don't continue propagating the "product grid" with "product entries". Break this for-statement
                    break;
                }
                
                // DEPRECATED: Moved to file "product_entry.js" to class "productEntry"
                //
                // Check if the "product entry data response object" is valid, by using a specialized function
                // if (!isProductEntryDataResponseValid(productEntryData)) {
                //     // Then skip this entry, don't count this iteration as a "successful product entry", and continue this for-loop
                //     continue;
                // }

                /** The selected "product entry" element reference to use
                 * @type {productEntry} */
                let newProductEntry = null;  

                // The method may throw an error
                try { newProductEntry = productEntry.createEntry(productEntryData) }
                catch (e) {
                    console.error(`Product Grid - fetchAndProcessProductGridResponse: Caught an error while creating an instance of class "productEntry": ${e}`);

                    // Then, skip this entry. Don't count this iteration as a "successful product entry". Continue this for-statement
                    continue;
                }

                // DEPRECATED: Moved to file "product_entry.js" to class "productEntry"
                //
                // // To get an instance of "product entry" check the "product entry pool" first before creating a new instance
                // 
                // // Does the "product entry pool" have any instances?
                // if (productEntry.#productEntryPool.length > 0) {
                //     // Then re-use one instance. It doesn't matter which instance is picked, as they are all reset since earlier
                //     productEntryInstance = productEntry.#productEntryPool.pop();
                // }
                // 
                // // Otherwise, the "product entry pool" is empty
                // else {
                //     // Create new "product entry" custom element
                //     productEntryInstance = document.createElement("product-entry");
                // 
                //     // Create and add an attribute node for passing one "Product Entry Data Structure" as string type to the "Product Entry".
                //     const attr = document.createAttribute("product-entry-data");
                //     productEntryInstance.setAttributeNode(attr);
                // }
                // 
                // // TODO: If possible, change to a module function call instead of using attributeChangedCallback. Less error-prone
                // // The "product entry" implements the "attributeChangedCallback" of "custom elements API", as the constructor for applying data. The "product entry data object" is stringified/serialized so that it can be contained within an attribute
                // productEntryInstance.setAttribute(JSON.stringify(productEntryData));

                // Add the instance of "product entry" to the DOM
                grid.appendChild(newProductEntry);

                // When reaching this line, the "product entry insertion" has been successful.
                // Count this as a "successful product entry"
                // AND count this in the "current number of products in the product grid"
                numSuccessfulProductEntries++;
                numProducts++;             
            }

            // Check if any "product entries" were successfully added
            if (numSuccessfulProductEntries <= 0) {
                // Then, don't do any further work. Break this labeled block
                break productEntriesBlock;
            }

            // Save the "product entry index range" in the script-level "fulfilled product grid request" variable
            fulfilledProductGridRequest.startID = thisFetchProductGridRequest.startID;
            fulfilledProductGridRequest.length = thisFetchProductGridRequest.length;

            // If the script-level blockSize variable still is invalid, then consider using the length of the "product entry response array" as a fallback value
            if (
                // Check if the blockSize has NOT been set to an integer value yet
                // OR if the value is in an invalid range
                !Number.isInteger(blockSize)
                || blockSize <= 0

                // AND Check if a block-sized array was requested in this fetch, by checking if the length property was omitted OR less than zero
                && (
                    thisFetchProductGridRequest.length === null
                    || thisFetchProductGridRequest.length <= 0
                )

                // AND Check if the length of the "product entry response array" is useful
                && productGridResponse.productEntries.length >= 8
            ) {
                // Then, set the script-leve blockSize variable to the length of the "product entry response array" as a fallback value
                blockSize = productGridResponse.productEntries.length;

                // After updating the blockSize value, the "product grid page state" also needs to be updated
                updatePageState();
            }

            // Since the "product grid" has been propagated with "product entries", update the state of "end of results text"
            // Make an async function call, by adding a promise chain to the existing promise chain of fetchAndProcessPromise
            fetchAndProcessPromise.then(() => {
                try { updateEndOfResultsText(); }
                catch (e) { return Promise.reject(e) }
                return Promise.resolve();
            })
            .catch((error) => { console.error(`Product Grid - fetchAndProcessProductGridResponse: Caught an error in the promise that calls the function updateEndOfResultsText: ${error}`) });
        }

        // Process the property "product filter menu template" in a labeled block
        productFilterMenuTemplateBlock: {
            // Check if this property is undefined
            if (typeof productGridResponse.productFilterMenuTemplate === "undefined") {
                // Check if this property was expected, by checking the get-directive of this request
                if (thisFetchProductGridRequest.getProductFilterMenuTemplate) console.error("Product Grid - fetchAndProcessProductGridResponse: The property productFilterMenuTemplate is expected but is undefined");
                
                // Then, don't process this property. Break this labeled block.
                break productFilterMenuTemplateBlock;
            }

            // TODO: Develop this function in the product_filter_menu.js file
            applyProductFilterMenuTemplate(thisFetchProductGridRequest.getProductFilterMenuTemplate);

            // Save this fulfilled get-directive property in the script-level "fulfilled product grid request" variable
            fulfilledProductGridRequest.getProductFilterMenuTemplate = true;
        }
    })

    // The error handler for the fetch-and-process promise chain
    .catch((error) => { console.error(`Product Grid - fetchAndProcessProductGridResponse: Caught an error in the promise fetchAndProcessPromise: ${error}`) });

    // Lastly, after creating a promise chain, reset the "new product grid request" by replacing its object with a object with all properties set to null
    nullifyNewProductGridRequest();
}

/** Calculate how much space there is left in the "Product Grid" for propagating more "Product Entries". Intended for checking pre-requisites for fetching and propagating the "Product Grid" and for setting the "length" property of the new "Product Grid Request".
 * @param {number} newProductPointer - The "product entry pointer" to be tested
 * @returns {number} If there is space left, returns a positive number. If there is no space left, returns a zero or negative number
 * @throws {Error} If the argument "new product entry pointer" or any of the script-level variables are invalid
 */
function getAvailableSpaceForPropagation (newProductPointer) {
    // Check if the argument "new product entry pointer" is invalid
    if (
        !Number.isInteger(newProductPointer)
        || newProductPointer < 0
    ) {
        // Then, throw an Error
        throw new Error("Product Grid - getAvailableSpaceInProductGrid: The argument newProductPointer is invalid");
    }
    
    /** @type {number | null} */
    let availableSpaceForLastID = null;

    /** @type {number | null} */
    let availableSpaceForMaxNum = null;

    /** @type {number | null */
    let availableSpaceOnPage = null;

    // Before using the script-level lastAvailableProductID, check if it's valid
    if (
        // Check if the value is valid
        Number.isInteger(lastAvailableProductID)
        && lastAvailableProductID > 0

        // Check if the relation to the "prodcut entry pointer" is valid
        && newProductPointer <= lastAvailableProductID
    ) {
        // Then, calculate the remaining space from the "new product entry pointer" to the server-reported "last available product entry index"
        availableSpaceForLastID = lastAvailableProductID - newProductPointer;
    }

    // Otherwise, check if the argument newProductPointer has an invalid relation to the script-level variable lastAvailableProductID, which should be limiting the pointer
    else if (newProductPointer > lastAvailableProductID) {
        // Then, throw an error
        throw new Error("Product Grid - getAvailableSpaceInProductGrid: The argument newProductPointer is greater than the script-level variable lastAvailableProductID, which is an invalid relation");
    }
    
    // Before using the script-level maxProducts, check if it's valid
    if (
        // Check if the value is valid
        Number.isInteger(maxProducts)
        && maxProducts <= 0

        // Check if the relation to the "prodcut entry pointer" is valid
        && newProductPointer >= maxProducts
    ) {
        // Then, calculate the remaining space from the "new product entry pointer" to the client-side "max product entries"
        availableSpaceForMaxNum = maxProducts - 1 - newProductPointer;        
    }

    // Otherwise, check if the argument "new product entry pointer" has an invalid relation to the script-level variable maxProducts, which should be limiting the pointer
    else if (newProductPointer > maxProducts - 1) {
        // Then, throw an error
        throw new Error("Product Grid - getAvailableSpaceInProductGrid: The argument newProductPointer is greater than the script-level variable maxProducts, which is an invalid relation");
    }

    // Calculate the remaining space on this current "product grid page", if pages are enabled
    if (
        // Check if the script-level variable "are product grid pages enabled" has a truesy value
        arePagesEnabled

        // Check if the script-level variable "current page index" is valid
        && Number.isInteger(currentPageID)
        && currentPageID >= 0
    ) {
        // The "+1" and "-1" are for converting between 1-based and 0-based numbers. The result can potentially be negative
        availableSpaceOnPage = (currentPageID + 1) * pageSize - 1 - newProductPointer;
    }

    // Before using the in-built math.min() method, check if all the results are null to avoid an unexpected return value
    if (
        !Number.isInteger(availableSpaceForLastID)
        && !Number.isInteger(availableSpaceForMaxNum)
        && !Number.isInteger(availableSpaceOnPage)
    ) throw Error("All of the results availableSpaceForLastID, availableSpaceForLastID, availableSpaceForLastID are invalid. Therefore this function can't select the smallest value");

    // Return the minimum value of all three results. Since a null value coerces to 0 in the in-built method math.min(), the coalescing operator is used to replace any null values with Infinity.
    return Math.min(
        availableSpaceForLastID ?? Infinity,
        availableSpaceForMaxNum ?? Infinity,
        availableSpaceOnPage ?? Infinity
    );
}

/** Compares two "propagation request" objects for equality by iterating through every nested values inside nested objects and arrays, apart from the get-directives. For data structure details, please refer to the "propagationRequest" type.
 * @param {productGridRequest} request1
 * @param {productGridRequest} request2
 * @returns {boolean} True for equality, false for inequality
 * @throws {TypeError} If any of the "product grid request" objects in the argument are invalid
 */
function compareProductGridRequestForEquality (request1, request2) {
    // Check if any of the two properties startID and "length" of the requests are invalid
    if (
        // Check if the type of the properties are NOT number. This also indirectly checks if they are NOT undefined.
        typeof request1.startID !== "number"
        || typeof request2.startID !== "number"
        || typeof request1.length !== "number"
        || typeof request2.length !== "number"
        
        // Use an in-built method to check if the property values are NOT integers
        || !Number.isInteger(request1.startID)
        || !Number.isInteger(request2.startID)
        || !Number.isInteger(request1.length)
        || !Number.isInteger(request2.length)
        
        // Check if the property values are in an invalid value range
        || request1.startID < 0
        || request2.startID < 0
        || request1.length <= 0
        || request2.length <= 0
    ) {
        // Then, throw a TypeError
        throw new TypeError("Product Grid - compareProductGridRequestForEquality: Properties startID and/or 'length' are invalid");
    }

    // Check if any of the two properties startID and "length" are inequal
    if (
        request1.startID !== request2.startID
        || request1.length !== request2.length
    ) return false;

    // Now, only the "product query options" remains to be tested

    /** If true, the "product query options" are equal
     * @type {boolean} */
    let areQueryOptEqual = null;

    // The comparison function is designed to throw a TypeError if the property values are invalid
    try {
        // Destructure the properties from the "product grid request" objects into "product query options" objects
        /** @type {productQueryOptions} */
        const queryOpt1 = {
            searchStr: request1.searchStr,
            filters: request1.filters,
            sort: request1.sort
        }

        /** @type {productQueryOptions} */
        const queryOpt2 = {
            searchStr: request2.searchStr,
            filters: request2.filters,
            sort: request2.sort
        }

        // Get the result from the comparison-function
        areQueryOptEqual = compareProductQueryOptionsForEquality(queryOpt1, queryOpt2);
    }
    catch (e) { throw new TypeError(`Product Grid - compareProductGridRequestForEquality: Caught error: ${e}`) }

    // Check if the comparison resulted as NOT equal
    if (!areQueryOptEqual) return false;

    // When reaching this line, the entire "request 1" and "request 2" objects are considered equal for every nested value. Return true for equality.
    return true;
}

/** Compare two "Product Grid Requests" to check if they are equal in all of their nested property values
 * @param {productQueryOptions} queryOpt1
 * @param {productQueryOptions} queryOpt2
 * @returns {boolean} If equal, returns true. If inequal, returns false.
 */
function compareProductQueryOptionsForEquality (queryOpt1, queryOpt2) {
    // Check if any of the properties of the two "product query options" objects are invalid
    
    // The outer container object
    if (
        typeof queryOpt1 === "undefined"
        || typeof queryOpt2 === "undefined"
    ) {
        // Then, return null for error
        return null;
    }

    // The searchStr property
    if (
        typeof queryOpt1.searchStr === "undefined"
        || typeof queryOpt2.searchStr === "undefined"

        // If it's neither a string or null, it has an invalid value
        || typeof queryOpt1.searchStr !== "string"
        && queryOpt1.searchStr !== null
    
        // If it's neither a string or null, it has an invalid value
        || typeof queryOpt2.searchStr !== "string"
        && queryOpt2.searchStr !== null
    ) {
        // Then, return null for error
        return null;
    }

    // The "filters" property
    if (
        typeof queryOpt1.filters === "undefined"
        || typeof queryOpt2.filters === "undefined"

        // If it's neither an array or null, it has an invalid value
        || !Array.isArray(queryOpt1.filters)
        && queryOpt1.filters !== null

        // If it's neither an array or null, it has an invalid value
        || !Array.isArray(queryOpt2.filters)
        && queryOpt2.filters !== null
    ) {
        // Then, return null for error
        return null;
    }

    // The "sort" property
    if (
        typeof queryOpt1.sort === "undefined"
        || typeof queryOpt2.sort === "undefined"

        // If it's neither a string or null, it has an invalid value
        || typeof queryOpt1.sort !== "string"
        && queryOpt1.sort !== null

        // If it's neither a string or null, it has an invalid value
        || typeof queryOpt2.sort !== "string"
        && queryOpt2.sort !== null
    ) {
        // Then, return null for error
        return null;
    }

    // "Product query options" "search string" inequality
    if (queryOpt1.searchStr !== queryOpt2.searchStr) return false;

    // "Product query options" "filters" array length inequality
    if (queryOpt1.filters.length !== queryOpt2.filters.length) return false;

    // Now, the "product query filters" arrays have been concluded to have the same length 

    // Iterate through the "product query filters" arrays, knowing that they have the same length
    for (let i = 0; i < queryOpt1.filters.length; i++) {
        // "Category type" inequality
        if (request1.query.filters[i].categoryType !== request1.query.filters[i].categoryType) return false;

        // "Category identifier" inequality
        if (request1.query.filters[i].categoryID !== request1.query.filters[i].categoryID) return false;
    }

    // When reaching this line, the entire queryOpt1 and queryOpt2 objects are considered equal for every nested value
    // Return true for equality
    return true;
}

/** (TODO: How to get millisecond representations?) Checks if the appropriate amount of time has passed since the last "Product Grid Request" was approved on the client-side before it was sent to the server. It selects the appropriate time threshold based on whether the newProductGridRequest and pendingProductGridRequest are different from each other or not. The intention is to ensure that requests are being sent too rapidly and putting redundant load on the server.
 * @returns {boolean} If timeout returns true. If closed, returns false.
 */
function checkRequestTimeoutThresholdForApproval () {
    // There are two different time thresholds for the request timeouts, depending on if the new request is the same as the previous one that was approved. 

    /** If true, the requested data is the same as the data in the previous request. If false, the requested data is different from the previous request.
     * @type {boolean} */
    let isRepeatedRequest = null;

    // Compare the new "product grid request" with the pending one
    // The comparison function may throw an error
    try { isRepeatedRequest = comparePropagationRequestsForEquality(newProductGridRequest, pendingProductGridRequest); }
    catch (e) { console.error(`Product Grid - checkRequestTimeoutThresholdForApproval: Caught error while getting the result of the "product grid request" comparison before using it to select which time threshold to use: ${e}`) }

    /** The threshold of difference of the current time and the previously saved time. Expressed in milliseconds
     * @type {Number} */
    let dateDiffThreshold = null;

    // Set the threshold of difference based on whether the new request is repeated or new 
    if (isRepeatedRequest) {
        // Set difference threshold to 4000 ms
        dateDiffThreshold = 4000;
    }

    // Otherwise, this is a new request. This will also be the fallback behavior in case of an error
    else {
        // Set difference threshold to 2000 ms
        dateDiffThreshold = 2000;
    }

    /** The time difference of the current time and the previously saved time
     * @type {Date} */
    let dateDiff = null;

    /** The current date object of this function call */
    const nowDate = new Date();

    // Calculate how much time that has passed since the last time that a "product grid request" was approved on the client-side before it was sent to the server
    // Check if the script-level lastProductGridRequestDate variable is valid
    if (lastProductGridRequestDate instanceof Date) {
        dateDiff = nowDate - lastProductGridRequestDate;
    }

    // Otherwise, lastProductGridRequestDate is invalid. A fallback behavior is required
    else {
        // Attempt to fix the problem by assigning the current date to the lastProductGridRequestDate
        lastProductGridRequestDate = nowDate;

        // Then, do no more work and return true for approval
        return true;
    }

    // Check if it hasn't passed enough time since the last time that a "product grid request" was approved on the client-side before it was sent to the server, then return false for rejection
    if (dateDiff <= dateDiffThreshold) return false;

    // When reaching this line, the check of the current timeout is considered as approved
    return true;
}

/** Reset the "new product grid request" by replacing its object with a object with all properties set to null */
function nullifyNewProductGridRequest () {
        newProductGridRequest = {
        startID: null,
        length: null,
        searchStr: null,
        filters: null,
        sort: null,
        getBlockSize: null,
        getLastAvailableID: null,
        getProductFilterMenuTemplate: null
    };
}

/** Apply the current "Product Query Options" by changing to the first "Product Grid Page"
 * @param {productQueryOptions} newQueryOpt - The new "Product Query Options" 
 */
function applyProductQueryOptionsInProductGrid (newQueryOpt) {
    // Set the new options as the new one
    currentQueryOptions = newQueryOpt;

    // TODO: Can this null value cause errors?
    // Since the "Product Query Options" have changed, the current script-level variable "last available product index" value may be incorrect. Nullify it
    lastAvailableProductID = null;

    // Since the "Product Query Options" have changed, the new value for "last available product index" is needed. Set the get-directive for this property to true
    newProductGridRequest.getLastAvailableID = true;

    // For the rest of neccessary work, the routine of changing "product grid page" can be used to complement this function
    // Change to the first page, which is index zero
    changePageInProductGrid(0);
}

/** Intersection API */
function onIntersectionWithLastEntry () {
    // Do the general setup of creating a new "Product Grid Request" for changing page in the "product grid"
    generalSetupOfNewProductGridRequest();

    /** If true, the pre-requisites for fetching and propagating the "product grid" are met 
     * @type {Boolean} */
    let arePreRequisitesMet = null;

    try { arePreRequisitesMet = checkPreRequisitesToFetchAndPropagateGrid() }
    catch (e) {
        console.error(`Product Grid - onIntersectionWithLastEntry: Caught an error while checking if the general pre-requisites for fetching and propagating the "product grid" are met: ${e}`);
        
        // Then, nullify the new "product grid request" and return
        nullifyNewProductGridRequest();
        return;
    }

    // Check the results of the pre-requisites function. Check if the general pre-requisites to fetch and propagate the "product grid" are NOT met
    if (!arePreRequisitesMet) {
        // Then, nullify the new "product grid request" and return
        nullifyNewProductGridRequest();
        return;
    }

    // Use the general routine for manipulating the browsing history
    generalHistoryManipulation();

    fetchAndProcessProductGridResponse();
}

/** A general routine for manipulating the browsing history when  of the "product grid" changes
 * @throws {TypeError | Error} If an error occurs when validating the current "location" or when calling other functions
*/
function generalHistoryManipulation () {    
    // Before manipulating the browsing history state, attempt processing the URLs and check if any error is thrown
    // For the current "location URL", no processing is neccessary, as it will be pushed directly into the history
    
    // For the new URL, create a URL with the same "origin" and "path" URL segments
    /** @type {URL} */
    let newURLObj; 
    
    // Use the current "location URL" to create a new URL object
    try { newURLObj = new URL(window.location.href); }

    // Check if the in-built URL constructor throws a TypeError, indicating that the given URL-string was invalid
    catch (e) {
        // Then, nullify the new "product grid request"
        nullifyNewProductGridRequest();

        // And throw an error with different possible messages, depending on the type of error
        if (e instanceof TypeError) throw new TypeError("Product Grid - generalHistoryManipulation: The argument 'url' is an invalid string for creating a new URL object");
        else throw new Error(`Product Grid - generalHistoryManipulation: Caught an error while creating a new URL object: ${e}`);
    }

    // Clear the query string from current page, leaving the "origin" and "path" left
    newURLObj.search = "";

    // Add query string to the new URL
    try { newURLObj = appendProductGridStateToURL(newURLObj, currentQueryOptions, currentPageID); }

    // The custom function can potentially throw an error
    catch (e) {
        // Then, nullify the new "product grid request" and throw an error
        nullifyNewProductGridRequest();
        throw new Error(`Product Grid - generalHistoryManipulation: Caught an error while adding the new state of the "product grid" to the new URL: ${e}`);
    }

    // Check if the new URL is same as the previous one
    if (window.location.href === newURLObj.href) {
        // Then, nullify the new "product grid request" and return
        nullifyNewProductGridRequest();
        return;
    }

    // Now, it's considered appropriate to start manipulating the history state

    // Save the current state of the "product grid" and its sub-component "product filter menu" with History API. This approach effectively introduces a "one-page web application" design.
    history.pushState(null, "", window.location.href);

    // Replace the current browsing history state without triggering a refresh of the web page
    history.replaceState(null, "", newURLObj.href);
}