// The "Product Grid" feature
// The purpose of this feature is to act as a dynamic, functional container for multiple instances of "Product Entries" feature, allowing the user to browse between the shopping items with 
// Two examples of usages are:
// - Present results of Product Entries in a 2D-grid on the entire device screen.
// - Showcase Product Entries inside of a one-dimensional segment of a document.
// Dependency: The Product Grid is a module and is used in web pages where shopping items needs to be presented in a concise manner, such as the "Home Page" and the "Query Results Body"
// Instructions:
// - Create an instance with the createElement() method from the DOM API
// - Set up the new ProductGrid instance with the initializeGrid() method from the ProductGrid class. Options are available.
// - Store the reference to the new ProductGrid instance for its entire lifecycle
// Options: The Product Grid allows to pass options to the initializeGrid function, opening up for multiple use cases. To see what options are available, please refer to "gridOptions".

"use strict";

////////////////////////////////////////
// Modules
////////////////////////////////////////

// Only export the class "ProductGrid", which is a "Web Components API - Custom Element" (inheriting from HTMLElement) with defined encapsulation for usage outside of this file
export { ProductGrid };

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

/** PLACEHOLDER
 * @typedef validProductFilterStringsStruct
 * @property {Set.<string>} categoryType
 * @property {Set.<string>} categoryID
 * @property {Set.<string>} form
 * @property {Set.<string>} culture
 * @property {Set.<string>} kind
 */

/** The data structure of a "history state object" that is retreived from parsing a "URL query string" in the method "#parseURLQueryString"
 * @typedef historyState
 * @property {productQueryOptions} query
 * @property {number} page          - Page number, 1-based
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

// Note: The variables have been moved to the class ProductGrid


////////////////////////////////////////
// Classes
////////////////////////////////////////

/** (TODO: inherit from HTMLElement and implement as Custom Element) The class containing all the inner workings of the "Product Grid" feature */
class ProductGrid extends HTMLElement {
    /** A set of allowed values for the option "growth direction"
    * @type {Set.<string>} */
    static #allowedGrowthDirectionValues = new Set(
        "horizontal",
        "vertical"
    )

    /** A static private field for storing the "Product Filter Menu Template" in this "Product Grid" script
     * @type {import("./product_filter_menu").productFilterMenuTemplate} */
    static #productFilterMenuTemplate = null;

    /** @type validProductFilterStringsStruct */
    static #validProductFilterStrings;

    /** (TODO: Extract the string sets from the "ProductFilterMenuTemplate") Initialize the object holding sets of valid strings for productFilter. Avoids namespace cluttering. A placeholder method in place of a server response. */
    static #initValidProductFilterStrings() {

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
        const categoryIDSet = formSet.union(cultureSet.union(kindSet));

        // Those objects created in this method will be kept alive from garbage collection for the life of this script, since their references are now being stored in an object in a private field
        ProductGrid.#validProductFilterStrings = {
            categoryType: validCategoryTypeSet,
            categoryID: categoryIDSet,
            form: formSet,
            culture: cultureSet,
            kind: kindSet
        }
    }

    /** Compares two "propagation request" objects for equality by iterating through every nested values inside nested objects and arrays, apart from the get-directives. For data structure details, please refer to the "propagationRequest" type.
     * @param {productGridRequest} request1
     * @param {productGridRequest} request2
     * @returns {boolean} True for equality, false for inequality
     * @throws {TypeError} If any of the "product grid request" objects in the argument are invalid
     */
    static #compareProductGridRequestForEquality(request1, request2) {
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
            throw new TypeError("File product_grid.js - class ProductGrid - method #compareProductGridRequestForEquality: Properties startID and/or 'length' are invalid");
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

        // The comparison method is designed to throw a TypeError if the property values are invalid
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

            // Get the result from the comparison-method
            areQueryOptEqual = ProductGrid.#compareProductQueryOptionsForEquality(queryOpt1, queryOpt2);
        }
        catch (e) { throw new TypeError(`File product_grid.js - class ProductGrid - method #compareProductGridRequestForEquality: Caught error: ${e}`) }

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
    static #compareProductQueryOptionsForEquality(queryOpt1, queryOpt2) {
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

    // A static initialization block for setting up static fields
    static {
        ProductGrid.#initValidProductFilterStrings();
    }

    /** The direction in which the grid grows in size, internally, and how it adapts externally. "vertical" mode wraps the content into new rows. The actual height depends on the number of rows. "horizontal" mode will overflow internally in horizontal direction, enabling scrolling. The actual height is always one row. Every mode has a width that fits 100% of the container.
    * @type {string} */
    #growthDirection;

    /** An option for the "Product Grid". If true, create and add a "Product Filter Menu" component on the top of the "Product Grid".
     * @type {string} */
    #isProductFilterMenuEnabled;

    /** The size of a block, expressed in number of data entries for the "Product Entry" feature. Assigned once with the value from the first response from the server.
     * @type {number} */
    #blockSize;

    /** The current "Product Entry Pointer". It points to a "Product Entry index" in the context of the "Product Grid container", used for pointing where to propagate new entries. 
     * @type {number} */
    #currentProductPointer = null;

    /** A option for the "Product Grid". If true, apply "page-by-page mode". Some of the effects involves creating and adding a "Page Bar" and a "Horizontal Bar" feature.
     * @type {boolean} */
    #arePagesEnabled;

    /** The size of one page of the "Product Grid", expressed in "number of products". Should to be a multiple of "block size", such as 1xblockSize, 2xblockSize, 3xblockSize, ...
     * @type {number} */
    #pageSize;

    /** The number of available pages that was reported from the server at the initialization of "Product Grid" with the current query
     * @type {number} */
    #numPages;

    /** The previous value of numPages
     * @type {number} */
    #lastNumPages = 0;

    /** The index of the active page of results in "Product Grid".
     * @type {number} */
    #currentPageID = 0;

    /** A private field for keeping track of the previous value for "current page index"
     * @type {number} */
    #lastPageID = null;

    /** The current number of products in "Product Grid"
     * @type {number} */
    #numProducts = 0;

    /** The server-reported last available index of "product entries" for the given "Product Query Options". A value of less than or equal to zero indicates that there are no available results from the server-side.
     * @type {number} */
    #lastAvailableProductID = null;

    /** (number ≤ 0 | number ≥ 1) The limit of number of products that can be propragated into the grid. May be used in places where page-by-page mode is inappropriate. A value less than or equal to zero indicates that there is no limit.
     * @type {number}
     * @memberof {gridOptions} */
    #maxProducts;

    /** (TODO: Now when moved to a class, there may be an opportunity to replace the method "#nullifyNewProductGridRequest" with a more automated reset) A private field for storing a new "product grid request object", that might become the next pending request.
     * @type {productGridRequest} */
    #newProductGridRequest = {
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
    #pendingProductGridRequest = {
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
    #fulfilledProductGridRequest = {
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
    #currentQueryOptions = {
        searchStr: null,
        filters: null,
        sort: null
    };

    /** Grid container that is to be propagated with "Product Entries"
     * @type {HTMLDivElement | null} */
    // TODO: There can be multiple instances available. Implement Shadow DOM?
    #grid = document.body.querySelector("product-grid.container");

    /** The "end of results text object" holding references to relevant elements  
     * @type {endOfResultsTextStruct}
     * @typedef endOfResultsTextStruct
     * @property {HTMLDivElement | null} container - The container for the text element
     * @property {HTMLSpanElement | null} element - The "end of results text element" that is to be placed beneath the grid element of the "product grid". It has three life cycle states: 1) Non-existing. 2) Placed in the DOM. 3) Removed from the DOM.
     */
    #endOfResultsText = {
        container: document.body.querySelector("end-of-results-text.container"),
        element: null
    };

    /** The "horizontal bar object" holding references to relevant elements  
     * @type {horizontalBarStruct}
     * @typedef horizontalBarStruct
     * @property {HTMLDivElement | null} container - The container for the bar element
     * @property {HTMLImageElement | null} element - The "horizontal bar element" that is to be placed beneath the grid element of the "product grid". It has three life cycle states: 1) Non-existing. 2) Placed in the DOM. 3) Removed from the DOM.
     */
    #horizontalBar = {
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
    #pageBar = {
        container: document.body.querySelector("page-bar.container"),
        page: undefined,
        pages: []
    }

    /** (TODO: Ensure that the date unit is expressed as milliseconds) The timestamp of the last time that a "Product Grid Request" was approved on the client-side before it was sent to the server
     * @type {Date} */
    #lastProductGridRequestDate = null;

    // NOTE: As long as this class is a "Web Component API - Custom Element" (for example, inheriting from HTMLElement), the method #initializeGrid should never be called in this constructor. It should be called after the element has been added to the DOM.
    ProductGrid() {
        super();
    }

    /** Initialize the "Product Grid". This method acts a constructor, and should be called manually once per instance after creating it as a "Web Component API - Custom Element" with "createElement()" and then adding it to the DOM (Reason: This class inherits from "HTMLElement", which doesn't allow setup in the constructor).
     * @param {string}              [growthDirectionParam]  - ("vertical" | "horizontal") Control which direction the grid grows in size, internally, and how it adapts externally. "vertical" mode wraps the content into new rows. The actual height depends on the number of rows. "horizontal" mode will overflow internally in horizontal direction, enabling scrolling. The actual height is always one row. Every mode has a width that fits 100% of the container.
     * @param {number}              [maxProductsParam]      - (number < 1 | number > 1) Limit the number of products that can be propragated into the grid. May be used in places where "page mode" is inappropriate.
     * @param {boolean}             [enablePages]           - (true | false) For vertical growth direction only. Display products page-by-page, adding a clickable page-bar. The capacity of pages is defined within "Product Grid".
     * @param {boolean}             [enableFilterMenu]      - (true | false) Add a "Product Filter Menu" component on top of the "Product Grid". It allows the client to change "Product Filters" for filtering results of "Product Entries".
     * @param {productQueryOptions} [initialQueryOptions]   - (Required) The initial query for requesting products from the server.
     * */
    initializeGrid (
        growthDirectionParam = "vertical",
        maxProductsParam = 0,
        enablePages = true,
        enableFilterMenu = true,
        initialQueryOptions = null
    ) {
        // Set up the CSS Grid based on the desired type of "Product Grid", determined by the direction of growth
        // Check if the argument is NOT valid
        if (typeof growthDirectionParam !== "string") {
            console.warn("File product_grid.js - class ProductGrid - method #initializeGrid: argument 'growthDirectionParam' is NOT a string, which is an invalid type. Defaulting to 'vertical'");

            // Default to "vertical" option value
            this.#growthDirection = "vertical";
        }

        // Otherwise, check if the argument value is NOT allowed
        else if (!ProductGrid.#allowedGrowthDirectionValues.has(growthDirectionParam)) {
            console.warn("File product_grid.js - class ProductGrid - method #initializeGrid: argument 'growthDirectionParam' does NOT have an allowed string value. Defaulting to 'vertical'");

            // Default to "vertical" option value
            this.#growthDirection = "vertical";
        }

        // Apply the option by using its value to assign the "class" attribute of the CSS Grid container, expecting the CSS Stylesheet to apply the corresponding ruleset
        this.#grid.setAttribute("class", "container " + this.#growthDirection);


        // Store the setting for limiting the number products
        if (typeof maxProductsParam === "number") {
            this.#maxProducts = maxProductsParam;
        }
        else console.error("File product_grid.js - class ProductGrid - method #initializeGrid: argument 'maxProductsParam' is invalid");

        // Store the setting for enabling page-mode
        // Check if the type is valid
        if (typeof enablePages === "boolean") {
            // Check if the vertical "growth direction" option is used. Reason: Pages are only available for vertical mode.
            if (growthDirectionParam === "vertical") {
                // Then, use the argument value to assign the private field
                this.#arePagesEnabled = enablePages;
            }
            else console.error("File product_grid.js - class ProductGrid - method #initializeGrid: option 'enablePages' is set to true, but the option 'growthDirectionParam' is NOT set to 'vertical', which is not allowed with the former option");
        }
        else console.error("File product_grid.js - class ProductGrid - method #initializeGrid: argument 'arePagesEnabled' is invalid");

        // Store the setting for enabling the "product filter menu"
        if (typeof enablePages === "boolean") {
            this.#isProductFilterMenuEnabled = enableFilterMenu;
        }
        else console.error("File product_grid.js - class ProductGrid - method #initializeGrid: argument 'enableFilterMenu' is invalid");

        // Set up the new "product grid request", before proceeding to fetch.

        // Start from index zero
        // NOTE: Length value has to be omitted, because of the "block size" remaining unknown until the first "product grid response" has been received
        // TODO: To compensate for this, apply field #maxProducts in method #fetchAndProcessProductGridResponse when using the property "productEntries"
        this.#newProductGridRequest.startID = 0;

        // Assign flags for get-directives to true
        this.#newProductGridRequest.getBlockSize = true;
        this.#newProductGridRequest.getLastAvailableID = true;

        // The get-directive for "product filter menu template" should only be enabled if the argument "enable product filter menu" is true
        // TODO: Add a new "product grid setting"
        if (enableFilterMenu) this.#newProductGridRequest.getProductFilterMenuTemplate = true;

        // Check if the argument "initial product query options" is valid with a specialized method
        if (this.#validateProductQueryOptionsObj(initialQueryOptions)) {
            // Assign the new "product grid request" with "product query options"
            this.#newProductGridRequest.searchStr = initialQueryOptions.searchStr;
            this.#newProductGridRequest.filters = initialQueryOptions.filters;
            this.#newProductGridRequest.sort = initialQueryOptions.sort;
        }

        // If not valid, check if it's NOT null before printing an error to console. Null is considered as an intended setting
        else if (initialQueryOptions !== null) console.error("File product_grid.js - class ProductGrid - method #initializeGrid: argument 'initialQuery' is invalid");

        // Skip the "pre-requisites to propagate the product grid", since this request is mandatory for the "product grid" to work as intended. Therefore, changes to the state of the "product grid" will be made

        // Set the new "product grid request" to pending state. NOTE: Structured cloning should not be neccessary
        this.#pendingProductGridRequest = this.#newProductGridRequest;

        // For timeout processing, save the current date as the "last product grid request date"
        this.#lastProductGridRequestDate = new Date();

        // Now, when the "product grid request" is complete, fetch and process the "product grid response", by using the new "product grid request"
        this.#fetchAndProcessProductGridResponse();

        // If pages are enabled, set up the "horizontal bar" component asynchronously
        if (this.#arePagesEnabled) {
            const horizontalBarPromise = Promise.resolve()
                .then(() => {
                    this.#setHorizontalBarVisibility(true);
                    return Promise.resolve();
                })
                .catch((error) => console.error(`File product_grid.js - class ProductGrid - method #initializeGrid: Caught an error in the promise chain of 'horizontalBarPromise': ${error}`));
        }
    }

    /** Checks if the current state of the "Product Grid" fulfills the general pre-requisites in the client to propagate the "Product Grid" container with "Product Entry" entries.
     * @returns {boolean} If the circumstances meets the pre-requisites, returns true. If not, returns false.
     * @throws {Error} If the private fields "product grid request" are invalid
     */
    #checkPreRequisitesToFetchAndPropagateGrid() {
        // Firstly, ensure that approved requests are not occuring too rapidly, putting redundant load on the server.
        // Check if it has NOT passed enough time since the last request, by checking if the corresponding timeout threshold for the new "product grid request" is NOT approved.
        if (!this.#checkRequestTimeoutThresholdForApproval()) {
            // Then, do nothing and return false for rejection
            return false;
        }

        /** If true, the requested data is the same as the data in the fulfilled request. If false, the requested data is different from the fulfilled request.
         * @type {boolean} */
        let isNewRequestEqualToFulfilled = null;

        // Compare the new request with the fullfilled request
        // The comparison method may throw an error
        try { isNewRequestEqualToFulfilled = ProductGrid.#compareProductGridRequestForEquality(this.#newProductGridRequest, this.#fulfilledProductGridRequest); }
        catch (e) { throw new Error(`File product_grid.js - class ProductGrid - method #checkPreRequisitesToFetchAndPropagateGrid: Caught error while getting the result of comparing the new "product grid request" with the fulfillled request, to determine which timeout-gate to use: ${e}`) }

        // Check the result from the comparison, to see if the new request is the same as the fulfilled request
        if (isNewRequestEqualToFulfilled) {
            // Then, return false for rejection
            return false;
        }

        // Check if the "start index" of the new "product grid request" has reached the end of the available results, by checking the private field "last available product entry index"
        if (
            // Check if #lastAvailableProductID is valid
            Number.isInteger(this.#lastAvailableProductID)
            && this.#lastAvailableProductID >= 0

            // AND check if the "start index" property value is NOT omitted by leaving it as null
            // AND check if the "start index" property is reaching or exceeding the "last available product entry index"
            && this.#newProductGridRequest.startID !== null
            && this.#newProductGridRequest.startID >= this.#lastAvailableProductID
        ) return false;

        // Check if the "start index" of the new "product grid request" has exceeded the client-side maximum limit, by checking the private field "max product entries"
        if (
            // Check if #maxProducts is valid
            Number.isInteger(this.#maxProducts)
            && this.#maxProducts > 0

            // AND check if the "start index" property value is NOT omitted by leaving it as null
            // AND check if the "start index" property, converted to a 1-based number, is exceeding the "max product entries"
            && this.#newProductGridRequest.startID !== null
            && this.#newProductGridRequest.startID + 1 > this.#maxProducts
        ) return false;

        // If pages are enabled, check if the "start index" property is within the range of the "current product grid page"
        if (
            // Check if "product grid pages" are enabled
            this.#arePagesEnabled

            // AND check if the "start index" property value is NOT omitted by leaving it as null
            && this.#newProductGridRequest.startID !== null

            // AND check if the "start index" property is outside the valid range of the "current product grid page"
            && (
                this.#newProductGridRequest.startID < this.#currentPageID * this.#pageSize
                || this.#newProductGridRequest.startID > (this.#currentPageID + 1) * this.#pageSize - 1
            )
        ) return false

        // When reaching this line, the new request is considered as accepted. Return true for approval
        return true;
    }

    /** Update the value of "pageSize" when the value of "blockSize" has been changed, which normally only happens during the initialization of the "product grid". */
    #updatePageSize() {
        // Firstly, check if pages are disabled. If true, return.
        if (!this.#arePagesEnabled) return;

        // Select desired products per page based on viewport width threshold
        const desiredProductsPerPage = MediaQueryListNarrow ? 20 : 28;

        // To set "page size", first get the closest whole number multiplier to achieve the following equation: blockSize * closestMultiplier ≈ desiredProductsPerPage
        const closestMultiplier = Math.round(desiredProductsPerPage / this.#blockSize);

        // Attempt to create a result that should be near to the value of desiredProductsPerPage
        const result = closestMultiplier * this.#blockSize;

        // Assign "page size" with the result if it is greater than 0. Otherwise, default to desiredProductsPerPage
        this.#pageSize = result > 0 ? result : desiredProductsPerPage;

        return;
    }

    /** Update the HTML elements of "Page Bar" that displays the clickable page numbers */
    #updatePageBar() {
        // Firstly, check if pages are disabled. If true, return.
        if (!this.#arePagesEnabled) return;

        // Check if the "Page" text element exists yet
        if (typeof this.#pageBar.page === "undefined") {
            // It doesn't exist. Create it
            this.#pageBar.page = document.createElement("span");
            this.#pageBar.page.textContent = "Page";
            this.#pageBar.page.setAttribute("class", "page-bar page");
            this.#pageBar.container.appendChild(this.#pageBar.page);
        }

        // Check if the private field for number of pages is a number OR has a falsy value.
        if (typeof this.#numPages !== "number") {
            // If true, this method call is considered failed
            console.error(`File product_grid.js - class ProductGrid - method #updatePageBar: the field '#numPages' has an invalid type that is not 'number': ${typeof this.#numPages}`);
            // Don't do any work and return
            return;
        }

        // Check for changes in the state of "page-by-page mode" 
        // Get the difference between the server-reported "available pages" and its previous value. Previous value could be 0.
        const pageDiff = this.#numPages - this.#lastNumPages;

        // Get the last index of the "page bar" element array, for validating range. Can result in -1, indicating empty
        const lastIDOfPageNumElems = this.#pageBar.pages.length - 1;

        // Zero difference indicates that there is a correct number of elements in the DOM. Do nothing and break the "else ... if" chain
        if (pageDiff === 0) { /* An empty block to break the "else ... if" chain */ }

        // The difference is not zero
        // A positive difference indicates that more elements need to be added to the DOM
        else if (pageDiff > 0) {
            // Iterate over page indices, 0-based
            for (let i = this.#lastNumPages - 1; i <= this.#numPages - 1; i++) {
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
                    numElem.addEventListener("click", this.#handlePageBarClick);

                    // Store the new "page number" element reference inside the #pageBar object field
                    this.#pageBar.pages[i] = numElem;
                }

                // Get the previously or newly created "page number" element
                const elemToAppend = this.#pageBar.pages[i];

                // Before using the returned element, check if it's invalid
                if (typeof elemToAppend === "undefined") {
                    console.error("File product_grid.js - class ProductGrid - method #updatePageBar: got an undefined return when accessing the array of stored 'page number' elements");
                    // Do nothing and continue for-statement
                    continue;
                }

                // Add the previously or newly created "page number" element to the "page bar" container 
                this.#pageBar.container.appendChild(elemToAppend);
            }
        }

        // The difference is not zero nor positive
        // A negative difference indicates that one or more "page number" elements need to be removed from the DOM
        else if (pageDiff < 0) {
            // Iterate over page indices, 0-based.
            for (let i = this.#lastNumPages - 1; i >= this.#numPages - 1; i--) {
                // Remove element from the DOM
                this.#pageBar.container.removeChild(this.#pageBar.pages[i]);
            }
        }

        // Now, all the appropriate "page number elements" are displayed


        // Highlight the "current page number element" in the "page bar"
        // Before adding a highlight, remove any previous highlights.
        const highlightedPageNumElems = this.#pageBar.container.querySelectorAll(".current");
        for (const highlighted of highlightedPageNumElems) {
            // Overwrite the value of attribute "class". This effectively removes the "current" class name, and stops the CSS stylesheet from applying rules on this element
            highlighted.setAttribute("class", "page-bar number");
        }

        // Now, when all previous highlights are removed, add a highlight to the "current page number element"
        // Get the "page number element" that corresponds to the "current page index"
        const currentPageNumElem = this.#pageBar.pages[this.#currentPageID];

        // Check if the accessed "page number element" is valid
        if (currentPageNumElem !== null && currentPageNumElem instanceof HTMLElement) {
            // Overwrite the value of attribute "class". This effectively adds the "current" class name. This allows the CSS stylesheet to apply rules on this element
            currentPageNumElem.setAttribute("class", "page-bar number current");
        }

        // Now:
        // - All the "available page number elements" are displayed
        // - The "current page number element" is the only instance with highlight

        // Lastly, update the "last number of product grid pages"
        this.#lastNumPages = this.#numPages;
    }

    /** Update the number of available pages that was reported from the server for the current query */
    #updateNumPages() {
        // Before proceeding, check if #lastAvailableProductID is null
        if (this.#lastAvailableProductID === null) {
            // Then, do nothing and return
            return;
        }

        // Otherwise, check if #lastAvailableProductID is NOT valid
        else if (
            // Check if the type is NOT a number
            typeof this.#lastAvailableProductID !== "number"

            // Check if the value is a positive integer
            || !Number.isInteger(this.#lastAvailableProductID)
            || this.#lastAvailableProductID < 0
        ) {
            console.error("File product_grid.js - class ProductGrid - method #updateNumPages: The private field '#lastAvailableProductID' is invalid.");
            // Then, do nothing and return
            return;
        }

        // Check if the private field "page size" is invalid 
        if (
            // Check if it's NOT an integer
            !Number.isInteger(this.#pageSize)

            // Check if page size is NOT positive and has a reasonable value
            || this.#pageSize < 8
        ) {
            console.error("File product_grid.js - class ProductGrid - method #updateNumPages: The private field 'pageSize' is invalid.");
            // Then, do nothing and return
            return;
        }

        /** The new "number of product grid pages"
         * @type {number} */
        let newNumPages = null;

        // TODO: Fix the case when field #lastAvailableProductID is null or invalid
        // TODO: Check if field #pageSize is valid
        // Calculate the number of pages by selecting the ceiling of the quotient between server-side "last available product entry index", converted to 1-based number, and the client-side "page size".
        // NOTE: field #pageSize is expressed as "number of products per page".
        newNumPages = Math.ceil((this.#lastAvailableProductID + 1) / this.#pageSize);

        // Check if the result is invalid. 
        if (
            // Check it's NOT an integer
            !Number.isInteger(newNumPages)

            // Check if it's a possible or non-zero value. There can't be zero pages, even if there are no results.
            || newNumPages <= 0
        ) {
            console.error("File product_grid.js - class ProductGrid - method #updateNumPages: Result 'newNumPages' from calculation is invalid, because it's not a positive integer.");

            // Then, do nothing and return
            return;
        }

        // When reaching this line, the new "number of product grid pages" result is considered valid

        // Use the new result to assign the private field "number of product grid pages"
        this.#numPages = newNumPages;
    }

    /** The event handler for "click" event for every "page number" element
     * @param {Event} event 
     */
    #handlePageBarClick(event) {
        // To identify which "page index" has been clicked, find the index of the event target inside the private field with "page number" elements.
        const clickedElementID = this.#pageBar.pages.indexOf(event.target);

        // Check if the array method 'indexOf' returned -1, indicating failure for finding the item
        if (clickedElementID === -1) {
            console.error("File product_grid.js - class ProductGrid - method #handlePageBarClick: Failed finding the index of the event target inside the array of 'page number' elements");
            // Do nothing and return
            return;
        }

        // Check if the "clicked element index" is the same as the "current page index". Then, do nothing and return
        if (clickedElementID === this.#currentPageID) return;

        // Now, the "clicked element index" value is considered as a valid "page index" that has been clicked on 

        // Change page to the "clicked element index"
        // This method may throw an error
        try { this.#changePageInProductGrid(clickedElementID) }
        catch (e) { console.error(`File product_grid.js - class ProductGrid - method #handlePageBarClick: Caught an error when trying to change the "product grid page": ${e}`) }
    }

    /** Change the "product results page" in the "product grid" to the given "page index"
     * @param {number} newPageID - The index, 0-based, of the new page to open 
    */
    #changePageInProductGrid(newPageID) {
        // Check if the arguement newPageID is invalid
        if (
            // Check if the type is NOT a number
            typeof newPageID !== "number"

            // Check if the value is NOT a positive integer
            || !Number.isInteger(newPageID)
            || newPageID < 0
        ) {
            // Then, do nothing and throw an error
            throw new Error("File product_grid.js - class ProductGrid - method #changePageInProductGrid: The argument 'newPageID' is invalid");
        }

        // Before making any changes to the state of the "product grid", do a custom set up of a new "product grid request", and test it against custom pre-requisites before it can be approved for being sent to the server.

        // For the "start index" of this "product grid request", set it to the first "product entry index" of the new "product grid page"
        this.#newProductGridRequest.startID = this.#getProductPointerForPageID(newPageID) + 1;

        // Do the general setup of creating a new "Product Grid Request" for changing page in the "product grid"
        this.#generalSetupOfNewProductGridRequest();

        // Skip checking the general pre-requisites to fetch and propagate the "product grid". This is because changing page in the "product grid" overrides the majority of the general pre-requisites.

        // Check if enough time has passed since the last request was approved to be sent to the server
        if (!this.#checkRequestTimeoutThresholdForApproval) {
            // Then, nullify the new "product grid request" and return
            this.#nullifyNewProductGridRequest();
            return;
        }

        // Now, the new request for changing "product grid" page is considered approved to be applied on the client-side and to be sent to the server. Therefore, the state of the "product grid" can be changed.

        // Use the general routine for manipulating the browsing history while changing the state of the "product grid"
        // The method can potentially throw errors
        try { this.#generalHistoryManipulation(newPageID) }
        catch (e) { console.error(`File product_grid.js - class ProductGrid - method #changePageInProductGrid: Caught an error while calling the general method for manipulating the browsing history: ${e}`) }

        // Before changing the value of "current page index", remember its current value as the "last page index"
        this.#lastPageID = this.#currentPageID;

        // Update the private field "current page index" with the argument "new page index"
        this.#currentPageID = newPageID;

        // Set up the current "product pointer" for a new "page index"
        this.#currentProductPointer = this.#getProductPointerForPageID(newPageID);

        // Update which "page bar number element" that should be highlighted as the current page
        this.#updatePageBar();

        // Clear out the "product grid" on all instances of "product entry"
        this.#clearProductGrid();

        // For timeout processing, save the current date as the "last product grid request date"
        this.#lastProductGridRequestDate = new Date();

        // Finally, fetch a "product grid response" with the new "product grid request" and process it
        // This method may throw an error
        try { this.#fetchAndProcessProductGridResponse() }
        catch (e) { throw new Error(`File product_grid.js - class ProductGrid - method #changePageInProductGrid: Caught an error when trying to fetch and process the "product grid response": ${e}`) }
    }

    /** Creates an "URL query string" from the given "Product Query Options" and adds it to the given "URL object", or to a new "URL object" created from the given string.
     * @param {string | URL} url - The "URL string" or "URL API object" that will be used as the base for appending the created "URL query string"
     * @param {productQueryOptions} query - The query to stringify and add to an URL query string
     * @param {number} pageID - The page index to stringify and add to an URL query string
     * @returns {URL} An "URL API object" containing the created "query string"
     * @throws {TypeError | Error} If "url" argument is invalid or omitted
     */
    #appendProductGridStateToURL(url, query, pageID) {
        // url invalid?
        if (
            typeof url === "undefined"
            || !url
            || (typeof url !== "string" && !(url instanceof URL))
        ) {
            // Do no more work and throw an Error
            throw new Error("File product_grid.js - class ProductGrid - method addQueryOptionsToURL: The mandatory argument 'url' is invalid");
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
                if (e instanceof TypeError) throw new TypeError("File product_grid.js - class ProductGrid - method addQueryOptionsToURL: The argument 'url' is an invalid string for creating a new URL object");
                else throw new Error(`File product_grid.js - class ProductGrid - method addQueryOptionsToURL: Caught an error while creating a new URL object: ${e}`);
            }
        }

        // Since "url" argument was not a string type, check if it's a "URL API object"
        else if (url instanceof URL) {
            // Then use the given "URL API object". Store it for further processing
            URLResult = url;
        }

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

        return URLResult;
    }

    /** (TODO: change to "parseProductGridStateURL" ) Parse a "URL query string" into a "productQuery" object and return it
     * @param {string} urlStr - The "URL string" containing the "query string". The "query string" will extracted and be parsed into a "productQuery" type object.
     * @returns {productQueryOptions}
    */
    #parseURLQueryString(urlStr) {

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
            console.error(`File product_grid.js - class ProductGrid - method #parseURLQueryString: The constructor of 'URL API' has thrown an error: ${e}`);
            // Do no more work and return null, indicating an empty query
            return null;
        }

        // Now, the "URL string" is considered valid and has been passed into a "URL API object"

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
                ProductGrid.#validProductFilterStrings.categoryType.has(key)
                && ProductGrid.#validProductFilterStrings.categoryID.has(value)
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

    /** (TODO: Is this needed or not? Then implement "sort" property) Validate a "product query options object" for its structure, keys and values
     * @param {productQueryOptions} query
     * @returns {boolean} a boolean for result
     */
    #validateProductQueryOptionsObj(query) {
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
                    !ProductGrid.#validProductFilterStrings.categoryType.has(key)
                    || !ProductGrid.#validProductFilterStrings.categoryID.has(value)
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

    /** Clear the "product grid" on all "product entry" instances and subtracts the product counter and pointer. This method may be used when the "product grid page" or "product query" have changed */
    #clearProductGrid() {

        /** All child elements of the "grid container"
         * @type {HTMLCollection} */
        const children = this.#grid.children;

        /** The number of removed "product entries" */
        let numRemoved = 0;

        // Iterate through every child element of the "grid container"
        for (const element of children) {
            // Check if the element is a valid "product entry" 
            if (
                // Check the internal "HTML tag" 
                element.localName === "product-entry"

                // AND check if the reference is an instance of class "ProductEntry"
                && element instanceof ProductEntry
            ) {
                // Remove from the DOM. The Custom Elements API lifecycle callback "disconnectedCallback" will be called on this instance and do internal work
                element.remove();

                // Count this as one removed "product entry"
                numRemoved++;
            }
            // If there are any other elements of any other type in this container, don't remove those unless there is a need for it.
        }

        // Update the private fields "number of product entries" and "current product entry index pointer" by subtracting with the same number of entries that were removed in this method call.
        this.#numProducts -= numRemoved;
        this.#currentProductPointer -= numRemoved;
    }

    /** Update the "End of results" text after the end of the grid */
    #updateEndOfResultsText() {
        // Check if pages are NOT enabled. Then, do nothing and return
        if (!this.#arePagesEnabled) return;

        // Check if the private field "current product entry pointer" is invalid
        if (
            typeof this.#currentProductPointer === "undefined"

            // Check if currentProductPointer NOT a positive integer number
            || !Number.isInteger(this.#currentProductPointer)
            || this.#currentProductPointer < 0
        ) {
            console.error("File product_grid.js - class ProductGrid - method #updateEndOfResultsText: the private field 'currentProductPointer' is invalid.");
            // Do nothing and return
            return;
        }

        // Check if the field #lastAvailableProductID is invalid
        if (
            typeof this.#lastAvailableProductID === "undefined"

            // Check if currentProductPointer NOT a positive integer number
            || !Number.isInteger(this.#lastAvailableProductID)
            || this.#lastAvailableProductID < 0
        ) {
            console.error("File product_grid.js - class ProductGrid - method #updateEndOfResultsText: the private field '#lastAvailableProductID' is invalid.");
            // Do nothing and return
            return;
        }

        // Check if the "current product entry index pointer" has reached or exceeded the "last available product entry index", reported by the server for the current query results
        if (this.#currentProductPointer >= this.#lastAvailableProductID) {
            // Show the "end of results text element"

            // Check if the element is NOT created yet?
            if (this.#endOfResultsText.element === null) {
                // The create it
                this.#endOfResultsText.element = document.createElement("span");

                // Set the "class" attribute to enable applying the CSS stylesheet
                this.#endOfResultsText.element.setAttribute("class", "end-of-results-text text");

                // Set the inner text of the element
                this.#endOfResultsText.element.innerText = "Bottom of results.";
            }

            // Add the element to the DOM
            this.#endOfResultsText.container.appendChild(this.#endOfResultsText.element);
        }

        // Otherwise, the "current product entry index pointer" has NOT reached or exceeded the "last available product entry index"
        else {
            // Hide the "end of results text element"
            // Check if the element is NOT created. Then, do nothing and return.
            if (this.#endOfResultsText.element === null) return;

            // Remove the element from the DOM, but keep its reference to allow re-usage
            this.#endOfResultsText.element.remove();
        }
    }

    /** (TODO: Is this method replaced by the similar method for "product query options"?) Checks if the given "product filter object" is valid.
     * @param {productFilter} filter
     * @returns {boolean} - Returns true for a valid filter, and false for an invalid filter.
     */
    #isProductFilterValid(filter) {
        // Is the argument "filter" undefined?
        if (typeof filter === "undefined") {
            console.error("File product_grid.js - class ProductGrid - method #isProductFilterValid: The argument 'filter' is undefined.");
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
            !ProductGrid.#validProductFilterStrings.categoryType.has(filter.categoryType)
            || !ProductGrid.#validProductFilterStrings.categoryID.has(filter.categoryID)
        ) return false;

        // When reaching this line, the "product filter object" is considered valid
        return true;
    }

    /** Show or hide the "horizontal bar element"
     * @param {boolean} doShow - Set to true to show the "horizontal bar element". Set to false hide it
     */
    #setHorizontalBarVisibility(doShow) {
        // Check if pages are NOT enabled? Then do nothing and return
        if (!this.#arePagesEnabled) return;

        // Check if the argument "do show" is set to show the element
        if (doShow) {
            // Check if the element is NOT created yet
            if (this.#horizontalBar.element === null) {
                // Create the "img" element
                this.#horizontalBar.element = document.createElement("img");

                // Set "class" attribute of the element
                this.#horizontalBar.element.setAttribute("class", "horizontal-bar bar");

                // Set "src" attribute of the "img" element
                this.#horizontalBar.element.src("/media/ornaments/golden-ornamental-frames_23-2147545654_upscaled_01.png");
            }

            // Add the element to the DOM by adding it to the corresponding container
            this.#horizontalBar.container.appendChild(this.#horizontalBar.element);
        }

        // Otherwise, the argument is set to hide the element
        else {
            // Check if the element is NOT created yet. Then do nothing and return
            if (this.#horizontalBar.element === null) return;

            // Remove the element from the DOM, but keep the reference to allow re-usage
            this.#horizontalBar.element.remove();
        }
    }

    /** Update the states of the "product grid page" feature. This method should be run when changes as been made to the "product query", "product entry block size", or "last available product entry index" */
    #updatePageState() {
        // "update page size" should always evaluate before every other routine for the "page state"
        this.#updatePageSize();

        // "update number of pages" should always evaluate before "update page bar"
        this.#updateNumPages();
        this.#updatePageBar();
    }

    /** (TODO: Update this description) Set up the "start index" property of the private field "fulfilled product grid request" for the given "page index". This ensures that the next "start index" of new and pending "product grid requests" becomes the starting index of the given "page index" 
     * @param {number} pageID - The "page index" to set up for
     * @returns {number | null} On success, returns a number. On failure, returns null.
     */
    #getProductPointerForPageID(pageID) {
        // Check if the argument "pageID" is invalid
        if (
            !Number.isInteger(pageID)
            || !pageID < 0
        ) {
            console.error("File product_grid.js - class ProductGrid - method #getProductPointerForPageID: The argument 'pageID' is invalid.");

            // Do nothing and return null for failure
            return null;
        }

        // Check if the private field pageSize is invalid
        if (
            !Number.isInteger(this.#pageSize)
            || !this.#pageSize < 0
        ) {
            console.error("File product_grid.js - class ProductGrid - method #getProductPointerForPageID: The private field pageSize is invalid.");

            // Do nothing and return null for failure
            return null;
        }

        // Desired sequence of numbers: (n-1)*pageSize-1, where n has a value of zero or greater. The intention is to ensure that the next "product entry pointer" is the starting index of the new "page index". This is achieved by setting the "product entry pointer" to one unit behind the new page.
        return (pageID - 1) * this.#pageSize - 1;
    }

    /** A general set up for the private field "new product grid request". Intended to evaluate before the method "pre-requisites to propagate the product grid" */
    #generalSetupOfNewProductGridRequest() {
        // TODO: Make sure that the #newProductGridRequest is nullified at every endpoint of this call hierarchy

        // Set up the "start index" of the new "product grid request"
        // First, check if the property is still null, indicating that is not already set earlier
        if (this.#newProductGridRequest.startID === null) {
            // Then, set "start index" to one step over the current "product entry pointer"
            this.#newProductGridRequest.startID = this.#currentProductPointer + 1;
        }

        // Determine the "length" property of the new "product grid request"
        lengthBlock: {
            // Calculate the available space from one step behind the "start index" of the "new product grid request"
            let availableSpaceResult;

            // The method may throw an error
            try { availableSpaceResult = this.#getAvailableSpaceForPropagation(this.#newProductGridRequest.startID - 1) }
            catch (e) {
                console.error(`File product_grid.js - class ProductGrid - method #generalSetupOfNewProductGridRequest: Caught an error while determining the the "length" property: ${e}`);

                // Then, skip processing this property. Break this labeled block
                break lengthBlock;
            }

            // Process the "available space result"
            if (
                // Check if the private field "block size" is valid
                Number.isInteger(this.#blockSize)
                && this.#blockSize > 0

                // AND check if the "available space result" is greater than or equal to the private field "block size"
                && availableSpaceResult >= this.#blockSize
            ) {
                // Then, omit assigning this property. Break this labeled block
                break lengthBlock;
            }

            // When reaching this line, it's considered appropriate to use the result of "available space" to assign the "length" property
            this.#newProductGridRequest.length = availableSpaceResult;
        }

        // For the "product query options", copy the values from the private field "current product query options"
        this.#newProductGridRequest.searchStr = this.#currentQueryOptions.searchStr;
        this.#newProductGridRequest.filters = this.#currentQueryOptions.filters;
        this.#newProductGridRequest.sort = this.#currentQueryOptions.sort;

        // Check if the private field "block size" has NOT been set to a valid integer yet
        if (
            !Number.isInteger(this.#blockSize)
            || this.#blockSize <= 0
        ) {
            // Then, set the get-directive for "block size" to true
            this.#newProductGridRequest.getBlockSize = true;
        }

        // Process the get-directive for "last available product entry index"
        if (
            // Check if the private field "last available product index" is invalid
            !Number.isInteger(this.#lastAvailableProductID)
            || this.#lastAvailableProductID < 0

            // OR if the corresponding property from the "pending product grid request" has a truesy value. The intention is to take-over the get-directive from the pending request
            || this.#pendingProductGridRequest.getLastAvailableID
        ) {
            this.#newProductGridRequest.getLastAvailableID = true;
        }

        // For the get-directive for "product filter menu template", check the private fields if the "product filter menu" is enabled and if the "product filter menu template" is still null
        if (
            this.#isProductFilterMenuEnabled
            && ProductGrid.#productFilterMenuTemplate === null
        ) {
            this.#newProductGridRequest.getProductFilterMenuTemplate = true;
        }
    }

    /** Use the private field "new product grid request" to fetch and then process the "product grid response" */
    #fetchAndProcessProductGridResponse() {
        /** The URL object with URLSearchParams for fetching from the "Product Grid API"
         * @type {URL} */
        let fetchURL = null;

        try { fetchURL = new URL("source/collectors-store/client/json/product_grid_response_sample.json"); }
        catch (e) {
            // Then, reset the new "product grid request" and throw an error
            this.#nullifyNewProductGridRequest();

            if (e instanceof TypeError) throw new TypeError("File product_grid.js - class ProductGrid - method #fetchAndProcessProductGridResponse: The URL constructor received an invalid URL address");
            else throw new Error(`File product_grid.js - class ProductGrid - method addQueryOptionsToURL: Caught an error while creating a new URL object: ${e}`);
        }

        // Insert the properties of the private field "new product grid request" into the "query" part of the URL 
        fetchURL.searchParams.set("start-id", this.#newProductGridRequest.startID);
        if (this.#newProductGridRequest.length !== null) fetchURL.searchParams.set("length", this.#newProductGridRequest.length);
        if (this.#newProductGridRequest.searchStr !== null) fetchURL.searchParams.set("search-str", this.#newProductGridRequest.searchStr);

        // The "filters" property is an array of structured objects that needs destructuring
        if (this.#newProductGridRequest.filters !== null) {
            // Iterate through the outer array container in the productFilter structure
            for (const filter of this.#newProductGridRequest.filters) {
                // Format: [categoryType]: [categoryID]
                // The maximum number of "URL query parameters" from the "filters" property should be equal to the total number of "category types" in the product_grid_response_sample.json file
                fetchURL.searchParams.set(filter.categoryType, filter.categoryID);
            }
        }

        if (this.#newProductGridRequest.getBlockSize) fetchURL.searchParams.set("get-block-size", "true");
        if (this.#newProductGridRequest.getLastAvailableID) fetchURL.searchParams.set("get-last-available-id", "true");
        if (this.#newProductGridRequest.getProductFilterMenuTemplate) fetchURL.searchParams.set("get-product-filter-menu-template", "true");

        // Now, the "query" part of the URL for fetching is completed

        /** The closure-scoped "product grid request" used for this instance of fetching and processing
         * @type {productGridRequest} */
        let thisFetchProductGridRequest = structuredClone(this.#newProductGridRequest);

        /** @type {Promise} */
        let fetchAndProcessPromise = fetch(fetchURL)

            // Process the "HTTP response"
            .then((response) => {
                // Check if the "HTTP status code" is NOT OK. Then, do nothing and reject this promise.
                if (!response.ok) return Promise.reject("File product_grid.js - class ProductGrid - method #fetchAndProcessProductGridResponse: The 'HTTP response status code' was not OK");

                // Convert the "HTTP response body" to text
                return response.text();
            })

            // Process the string from the "HTTP response body", which should be text in JSON-format
            .then((JSONText) => {
                // Check if the "JSON text" is invalid. Then, do nothing and reject this promise.
                if (
                    typeof JSONText === "undefined"
                    || typeof JSONText !== "string"
                ) return Promise.reject("File product_grid.js - class ProductGrid - method #fetchAndProcessProductGridResponse - Promise fetchAndProcessPromise: The argument 'JSONText', passed from the previous promise, is invalid.");

                // Parse the "JSON Text" into a "JavaScript object"
                /** The "product grid response" object that has been parsed from "JSON text" from the server
                 * @type {productGridResponse} */
                const productGridResponse = JSON.parse(JSONText);

                // Process the newly created object from parsing

                /** If true, update the state of the "product grid pages". If any of the two fields #blockSize and #lastAvailableProductID are updated on the client by the "product grid response", set this flag to true. */
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
                    hasProductGridRequestChangedWhileWaiting = !ProductGrid.#compareProductGridRequestForEquality(thisFetchProductGridRequest, this.#pendingProductGridRequest);
                    hasProductQueryOptChangedWhileWaiting = !ProductGrid.#compareProductQueryOptionsForEquality(thisFetchProductQueryOpt);
                }
                catch (e) { console.error(`File product_grid.js - class ProductGrid - method #fetchAndProcessProductGridResponse - Promise fetchAndProcessPromise: Caught an error while using functions for checking if the properties of the pending "Product Grid Request" have changed: ${e}`) };

                // Process the blockSize property of the "product grid response" in a labeled block
                blockSizeBlock: {
                    // Check if the client-side blockSize already is valid
                    if (
                        !Number.isInteger(this.#blockSize)
                        || this.#blockSize <= 0
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
                        console.error("File product_grid.js - class ProductGrid - method #fetchAndProcessProductGridResponse - Promise fetchAndProcessPromise: The blockSize property is missing from the response, even though the get-directive for this property was used");
                        // Then, don't process this property. Break this labeled block.
                        break blockSizeBlock;
                    }

                    // Check if blockSize in the response is invalid
                    if (
                        typeof productGridResponse.blockSize === "undefined"
                        || !Number.isInteger(productGridResponse.blockSize)
                        || productGridResponse.blockSize <= 0
                    ) {
                        console.error("File product_grid.js - class ProductGrid - method #fetchAndProcessProductGridResponse - Promise fetchAndProcessPromise: The blockSize property in the response is invalid.")
                        // Then, don't process this property. Break this labeled block
                        break blockSizeBlock;
                    }

                    // Now, it's considered appropriate to use the blockSize property of the response for assigning the private field blockSize
                    this.#blockSize = productGridResponse.blockSize;

                    // Now, when blockSize has been updated, set the do-directive flag for updating state of "product grid pages" later.
                    doUpdatePageState = true;

                    // Save this fulfilled get-directive property in the private field "fulfilled product grid request"
                    this.#fulfilledProductGridRequest.getBlockSize = true;
                }

                // Process the lastAvailableID property of the "product grid response" in a labeled block
                lastAvailableIDBlock: {
                    // Check if the lastAvailableID property is missing in the response, even though the get-directive for this property was used
                    if (
                        typeof productGridResponse.lastAvailableID === "undefined"
                        && thisFetchProductGridRequest.getLastAvailableID
                    ) {
                        console.error("File product_grid.js - class ProductGrid - method fetchAndProcessProductGridResponse - Promise fetchAndProcessPromise: The lastAvailableID property is missing from the response, even though the get-directive for this property was used");
                        // Then, don't process this property. Break this labeled block.
                        break lastAvailableIDBlock;
                    }

                    // Check if lastAvailableID in the response is invalid
                    if (
                        typeof productGridResponse.lastAvailableID === "undefined"
                        || !Number.isInteger(productGridResponse.lastAvailableID)
                        || productGridResponse.lastAvailableID < 0
                    ) {
                        console.error("File product_grid.js - class ProductGrid - method #fetchAndProcessProductGridResponse - Promise fetchAndProcessPromise: The lastAvailableID property in the response is invalid.")
                        // Then, don't process this property. Break this labeled block
                        break lastAvailableIDBlock;
                    }

                    // Since this request could have been replaced by another request while waiting, check if this property is still useful. It would only be useful if the "product queryt options" is still the same as in the most recent "pending product grid request"
                    if (hasProductQueryOptChangedWhileWaiting) {
                        // Then, this property is not useful anymore and won't be processed. Break this labeled block
                        break lastAvailableIDBlock;
                    }

                    // Now, it's considered appropriate to use the lastAvailableID property of the response for assigning the private field #lastAvailableProductID
                    this.#lastAvailableProductID = productGridResponse.lastAvailableID;

                    // Now, when #lastAvailableProductID has been updated, set the do-directive flag for updating state of "product grid pages" later.
                    doUpdatePageState = true;

                    // Save this fulfilled get-directive property in the private field "fulfilled product grid request"
                    this.#fulfilledProductGridRequest.getLastAvailableID = true;
                }

                // Now, after processing the two properties blockSize and lastAvailableID of the "product grid response", consider updating the state of "product grid pages", by checking if the function-scoped do-directive flag was set
                if (doUpdatePageState) this.#updatePageState();

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
                        console.error("File product_grid.js - class ProductGrid - method #fetchAndProcessProductGridResponse - Promise fetchAndProcessPromise:: The productEntries property in the response is invalid.")
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
                            // Check if #maxProducts valid and activated. A zero value means inactivated
                            Number.isInteger(this.#maxProducts)
                            && this.#maxProducts > 0

                            // AND check if the private field "number of product entries" has exceeded the client-side maximum limit, by checking the private field "max number of products"
                            && this.#numProducts >= this.#maxProducts
                        ) {
                            // Then don't continue propagating the "product grid" with "product entries". Break this for-statement
                            break;
                        }

                        /** The selected "product entry" element reference to use
                         * @type {ProductEntry} */
                        let newProductEntry = null;

                        // The method may throw an error
                        try { newProductEntry = ProductEntry.createEntry(productEntryData) }
                        catch (e) {
                            console.error(`File product_grid.js - class ProductGrid - method #fetchAndProcessProductGridResponse - Promise fetchAndProcessPromise:: Caught an error while creating an instance of class "ProductEntry": ${e}`);

                            // Then, skip this entry. Don't count this iteration as a "successful product entry". Continue this for-statement
                            continue;
                        }

                        // Add the instance of "product entry" to the DOM
                        this.#grid.appendChild(newProductEntry);

                        // When reaching this line, the "product entry insertion" has been successful.
                        // Count this as a "successful product entry"
                        // AND count this in the "current number of products in the product grid"
                        numSuccessfulProductEntries++;
                        this.#numProducts++;
                    }

                    // Check if any "product entries" were successfully added
                    if (numSuccessfulProductEntries <= 0) {
                        // Then, don't do any further work. Break this labeled block
                        break productEntriesBlock;
                    }

                    // Save the "product entry index range" in the private field "fulfilled product grid request"
                    this.#fulfilledProductGridRequest.startID = thisFetchProductGridRequest.startID;
                    this.#fulfilledProductGridRequest.length = thisFetchProductGridRequest.length;

                    // If the private field blockSize still is invalid, then consider using the length of the "product entry response array" as a fallback value
                    if (
                        // Check if the blockSize has NOT been set to an integer value yet
                        // OR if the value is in an invalid range
                        !Number.isInteger(this.#blockSize)
                        || this.#blockSize <= 0

                        // AND Check if a block-sized array was requested in this fetch, by checking if the length property was omitted OR less than zero
                        && (
                            thisFetchProductGridRequest.length === null
                            || thisFetchProductGridRequest.length <= 0
                        )

                        // AND Check if the length of the "product entry response array" is useful
                        && productGridResponse.productEntries.length >= 8
                    ) {
                        // Then, set the private field blockSize to the length of the "product entry response array" as a fallback value
                        this.#blockSize = productGridResponse.productEntries.length;

                        // After updating the blockSize value, the "product grid page state" also needs to be updated
                        this.#updatePageState();
                    }

                    // Since the "product grid" has been propagated with "product entries", update the state of "end of results text"
                    // Make an async method call, by adding a promise chain to the existing promise chain of fetchAndProcessPromise
                    fetchAndProcessPromise.then(() => {
                        try { this.#updateEndOfResultsText(); }
                        catch (e) { return Promise.reject(e) }
                        return Promise.resolve();
                    })
                        .catch((error) => { console.error(`File product_grid.js - class ProductGrid - method #fetchAndProcessProductGridResponse - Promise fetchAndProcessPromise: Caught an error in the promise that calls the method #updateEndOfResultsText: ${error}`) });
                }

                // Process the property "product filter menu template" in a labeled block
                productFilterMenuTemplateBlock: {
                    // Check if this property is undefined
                    if (typeof productGridResponse.productFilterMenuTemplate === "undefined") {
                        // Check if this property was expected, by checking the get-directive of this request
                        if (thisFetchProductGridRequest.getProductFilterMenuTemplate) console.error("File product_grid.js - class ProductGrid - method #fetchAndProcessProductGridResponse - Promise fetchAndProcessPromise: The property productFilterMenuTemplate is expected but is undefined");

                        // Then, don't process this property. Break this labeled block.
                        break productFilterMenuTemplateBlock;
                    }

                    // TODO: Develop this function in the product_filter_menu.js file
                    applyProductFilterMenuTemplate(thisFetchProductGridRequest.getProductFilterMenuTemplate);

                    // Save this fulfilled get-directive property in the private field "fulfilled product grid request"
                    this.#fulfilledProductGridRequest.getProductFilterMenuTemplate = true;
                }
            })

            // The error handler for the fetch-and-process promise chain
            .catch((error) => { console.error(`File product_grid.js - class ProductGrid - method #fetchAndProcessProductGridResponse - Promise fetchAndProcessPromise: Caught an error in the promise fetchAndProcessPromise: ${error}`) });

        // Lastly, after creating a promise chain, reset the "new product grid request" by replacing its object with a object with all properties set to null
        this.#nullifyNewProductGridRequest();
    }

    /** Calculate how much space there is left in the "Product Grid" for propagating more "Product Entries". Intended for checking pre-requisites for fetching and propagating the "Product Grid" and for setting the "length" property of the new "Product Grid Request".
     * @param {number} newProductPointer - The "product entry pointer" to be tested
     * @returns {number} If there is space left, returns a positive number. If there is no space left, returns a zero or negative number
     * @throws {Error} If the argument "new product entry pointer" or any of the private fields are invalid
     */
    #getAvailableSpaceForPropagation(newProductPointer) {
        // Check if the argument "new product entry pointer" is invalid
        if (
            !Number.isInteger(newProductPointer)
            || newProductPointer < 0
        ) {
            // Then, throw an Error
            throw new Error("File product_grid.js - class ProductGrid - method getAvailableSpaceInProductGrid: The argument newProductPointer is invalid");
        }

        /** @type {number | null} */
        let availableSpaceForLastID = null;

        /** @type {number | null} */
        let availableSpaceForMaxNum = null;

        /** @type {number | null} */
        let availableSpaceOnPage = null;

        // Before using the private field #lastAvailableProductID, check if it's null
        if (this.#lastAvailableProductID === null) {
            // Then, don't set the local variable availableSpaceForLastID by breaking this "if...else" chain
        }

        // Otherwise, check if the value is valid for use
        else if (
            // Check if the value is a positive integer
            Number.isInteger(this.#lastAvailableProductID)
            && this.#lastAvailableProductID > 0

            // Check if the relation to the "prodcut entry pointer" is valid
            && newProductPointer <= this.#lastAvailableProductID
        ) {
            // Then, calculate the remaining space from the "new product entry pointer" to the server-reported "last available product entry index"
            availableSpaceForLastID = this.#lastAvailableProductID - newProductPointer;
        }

        // Otherwise, check if the argument newProductPointer has an invalid relation to the private field #lastAvailableProductID, which should be limiting the pointer
        else if (newProductPointer > this.#lastAvailableProductID) {
            // Then, throw an error
            throw new Error("File product_grid.js - class ProductGrid - method getAvailableSpaceInProductGrid: The argument newProductPointer is greater than the private field #lastAvailableProductID, which is an invalid relation");
        }

        // Before using the private field #maxProducts, check if it's valid
        if (
            // Check if the value is valid
            Number.isInteger(this.#maxProducts)
            && this.#maxProducts <= 0

            // Check if the relation to the "prodcut entry pointer" is valid
            && newProductPointer >= this.#maxProducts
        ) {
            // Then, calculate the remaining space from the "new product entry pointer" to the client-side "max product entries"
            availableSpaceForMaxNum = this.#maxProducts - 1 - newProductPointer;
        }

        // Otherwise, check if the argument "new product entry pointer" has an invalid relation to the private field #maxProducts, which should be limiting the pointer
        else if (newProductPointer > this.#maxProducts - 1) {
            // Then, throw an error
            throw new Error("File product_grid.js - class ProductGrid - method getAvailableSpaceInProductGrid: The argument newProductPointer is greater than the private field #maxProducts, which is an invalid relation");
        }

        // Calculate the remaining space on this current "product grid page", if pages are enabled
        if (
            // Check if the private field "are product grid pages enabled" has a truesy value
            this.#arePagesEnabled

            // Check if the private field "current page index" is valid
            && Number.isInteger(this.#currentPageID)
            && this.#currentPageID >= 0
        ) {
            // The "+1" and "-1" are for converting between 1-based and 0-based numbers. The result can potentially be negative
            availableSpaceOnPage = (this.#currentPageID + 1) * this.#pageSize - 1 - newProductPointer;
        }

        // Before using the in-built math.min() method, check if all the results are null to avoid an unexpected return value
        if (
            !Number.isInteger(availableSpaceForLastID)
            && !Number.isInteger(availableSpaceForMaxNum)
            && !Number.isInteger(availableSpaceOnPage)
        ) throw Error("All of the results availableSpaceForLastID, availableSpaceForLastID, availableSpaceForLastID are invalid. Therefore this method can't select the smallest value");

        // Return the minimum value of all three results. Since a null value coerces to 0 in the in-built method math.min(), the coalescing operator is used to replace any null values with Infinity.
        return Math.min(
            availableSpaceForLastID ?? Infinity,
            availableSpaceForMaxNum ?? Infinity,
            availableSpaceOnPage ?? Infinity
        );
    }

    /** Checks if the appropriate amount of time has passed since the last "Product Grid Request" was approved on the client-side before it was sent to the server. It selects the appropriate time threshold based on whether the #newProductGridRequest and #pendingProductGridRequest are different from each other or not. The intention is to ensure that requests are being sent too rapidly and putting redundant load on the server.
     * @returns {boolean} If timeout is open, returns true. If closed, returns false.
     */
    #checkRequestTimeoutThresholdForApproval() {
        // There are two different time thresholds for the request timeouts, depending on if the new request is the same as the previous one that was approved. 

        /** If true, the requested data is the same as the data in the previous request. If false, the requested data is different from the previous request.
         * @type {boolean} */
        let isRepeatedRequest = null;

        // Compare the new "product grid request" with the pending one
        // The comparison method may throw an error
        try { isRepeatedRequest = comparePropagationRequestsForEquality(this.#newProductGridRequest, this.#pendingProductGridRequest); }
        catch (e) { console.error(`File product_grid.js - class ProductGrid - method #checkRequestTimeoutThresholdForApproval: Caught error while getting the result of the "product grid request" comparison before using it to select which time threshold to use: ${e}`) }

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

        /** The current date object of this method call */
        const nowDate = new Date();

        // TODO: Ensure that the millisecond representation for Date is used
        // Calculate how much time that has passed since the last time that a "product grid request" was approved on the client-side before it was sent to the server
        // Check if the private field #lastProductGridRequestDate is valid
        if (this.#lastProductGridRequestDate instanceof Date) {
            dateDiff = nowDate - this.#lastProductGridRequestDate;
        }

        // Otherwise, #lastProductGridRequestDate is invalid. A fallback behavior is required
        else {
            // Attempt to fix the problem by assigning the current date to the #lastProductGridRequestDate
            this.#lastProductGridRequestDate = nowDate;

            // Then, do no more work and return true for approval
            return true;
        }

        // Check if it hasn't passed enough time since the last time that a "product grid request" was approved on the client-side before it was sent to the server, then return false for rejection
        if (dateDiff <= dateDiffThreshold) return false;

        // When reaching this line, the check of the current timeout is considered as approved
        return true;
    }

    /** Reset the "new product grid request" by replacing its object with a object with all properties set to null */
    #nullifyNewProductGridRequest() {
        this.#newProductGridRequest = {
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
    #applyProductQueryOptionsInProductGrid(newQueryOpt) {
        // Set the new options as the new one
        this.#currentQueryOptions = newQueryOpt;

        // Since the "Product Query Options" have changed, the current private field "last available product index" value may be incorrect and needs to be reset. Nullify it.
        // NOTE: The following call hiearchy is expected to have an exception for this null value 
        this.#lastAvailableProductID = null;

        // Since the "Product Query Options" have changed, the new value for "last available product index" is needed. Set the get-directive for this property to true
        this.#newProductGridRequest.getLastAvailableID = true;

        // For the rest of neccessary work, the routine of changing "product grid page" can be used to complement this method and avoid repeated code
        // Change to the first page, which is index zero
        // This method may throw an error
        try { this.#changePageInProductGrid(0) }
        catch (e) {
            // Reset the new "product grid request"
            this.#nullifyNewProductGridRequest();
            throw new Error(`File product_grid.js - class ProductGrid - method #applyProductQueryOptionsInProductGrid: Caught error when re-using the method #changePageInProductGrid to change page to index zero to avoid repeated code: ${e}`)
        }
    }

    /** Intersection API */
    #onIntersectionWithLastEntry() {
        // Do the general setup of creating a new "Product Grid Request" for changing page in the "product grid"
        this.#generalSetupOfNewProductGridRequest();

        /** If true, the pre-requisites for fetching and propagating the "product grid" are met 
         * @type {Boolean} */
        let arePreRequisitesMet = null;

        try { arePreRequisitesMet = this.#checkPreRequisitesToFetchAndPropagateGrid() }
        catch (e) {
            console.error(`File product_grid.js - class ProductGrid - method #onIntersectionWithLastEntry: Caught an error while checking if the general pre-requisites for fetching and propagating the "product grid" are met: ${e}`);

            // Then, nullify the new "product grid request" and return
            this.#nullifyNewProductGridRequest();
            return;
        }

        // Check the results of the pre-requisites method. Check if the general pre-requisites to fetch and propagate the "product grid" are NOT met
        if (!arePreRequisitesMet) {
            // Then, nullify the new "product grid request" and return
            this.#nullifyNewProductGridRequest();
            return;
        }

        // Finally, fetch a "product grid response" with the new "product grid request" and process it
        // This method may throw an error
        try { this.#fetchAndProcessProductGridResponse() }
        catch (e) { throw new Error(`File product_grid.js - class ProductGrid - method #onIntersectionWithLastEntry: Caught an error when trying to fetch and process the "product grid response": ${e}`) }
    }

    /** A general routine for manipulating the browsing history when the state of the "product grid" changes
     * @param {number} newPageID The new "product grid page index" to use for the new history state
     * @throws {TypeError | Error} If an error occurs when validating the current "location" or when calling other functions
    */
    #generalHistoryManipulation(newPageID) {
        // Before proceeding, check if the argument "new page index" is invalid
        if (
            // Check if it's NOT a number type
            typeof newPageID !== "number"

            // Check if it's a positive integer value
            || !Number.isInteger(newPageID)
            || newPageID < 0
        ) {
            // Then, throw an error
            throw new TypeError("File product_grid.js - class ProductGrid - method #generalHistoryManipulation: The argument newPageID is invalid.");
        }

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
            this.#nullifyNewProductGridRequest();

            // And throw an error with different possible messages, depending on the type of error
            if (e instanceof TypeError) throw new TypeError("File product_grid.js - class ProductGrid - method #generalHistoryManipulation: The argument 'url' is an invalid string for creating a new URL object");
            else throw new Error(`File product_grid.js - class ProductGrid - method #generalHistoryManipulation: Caught an error while creating a new URL object: ${e}`);
        }

        // Clear the query string from current page, leaving the "origin" and "path" left
        newURLObj.search = "";

        // Add query string to the new URL
        try { newURLObj = this.#appendProductGridStateToURL(newURLObj, this.#currentQueryOptions, newPageID); }

        // The custom method can potentially throw an error
        catch (e) {
            // Then, nullify the new "product grid request" and throw an error
            this.#nullifyNewProductGridRequest();
            throw new Error(`File product_grid.js - class ProductGrid - method #generalHistoryManipulation: Caught an error while adding the new state of the "product grid" to the new URL: ${e}`);
        }

        // Check if the new URL is same as the previous one
        if (window.location.href === newURLObj.href) {
            // Then, nullify the new "product grid request" and return
            this.#nullifyNewProductGridRequest();
            return;
        }

        // Now, it's considered appropriate to start manipulating the history state

        // Save the current state of the "product grid" and its sub-component "product filter menu" with History API. This approach effectively introduces a "one-page web application" design.
        history.pushState(null, "", window.location.href);

        // Replace the current browsing history state without triggering a refresh of the web page
        history.replaceState(null, "", newURLObj.href);
    }
}


////////////////////////////////////////
// Main functionality
////////////////////////////////////////

// One-time initializations for former script-scoped variables has been moved to a static initialization block in the class "ProductGrid", now initializing static fields

// TODO: Register the Custom Element of class "ProductGrid" here