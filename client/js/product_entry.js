// The "Product Entry" feature
// Purpose: Present a shopping item within a small two-dimensional portion of the screen, by displaying an image and short information of the given item.
// The Product Entry is intended to be placed together with other entries within a functional 2D-grid container, called "Product Grid".
// Dependency: This feature is a module, and is mandatory for the "Product Grid" feature

"use strict";

////////////////////////////////////////
// Data Structures
////////////////////////////////////////

/** The data structure of server response for data of one instance of "Product Entry".
 * @typedef productEntryDataResponse
 * @property {string} imgSrc        - Product preview image URL
 * @property {string} name          - Product display name
 * @property {string} culture       - Culture display name
 * @property {number} priceCents    - Price in cents (1/100)
 * @property {string} productURL    - Product view page URL
 */

/** The data structure of server response for data of one or more instances of "Product Entry"
 * @typedef {Array.<productEntryDataResponse>} productEntryDataResponses
 */


////////////////////////////////////////
// Classes
////////////////////////////////////////

// Declare and define an Autonomous Custom Element
class productEntry extends HTMLElement {
    // DEPRECATED: attributeChangedCallback is replaced by a direct function call
    // Observe for attribute change, expecting incoming data needed for setting up this product entry object 
    // static observedAttributes =  ["product-entry-data"];

    /** A pool of free, deactivated "product entries". Allows re-using old instances
     * @type {Array.<productEntry>} */
    static #productEntryPool = new Array();

    #shadowDOM = null;

    /** The pending data of "product entry" that should be used after the HTML text has been inserted and parsed into HTML elements
     * @type {productEntryDataResponse} */
    #pendingProductEntryData = null;

    /** The number of times that this instance has been waiting for the HTML text to parse into HTML elements */
    #numWaitsForHTMLParsing = 0;

    /** If true, this instance of "product entry" is activated. If false, it is deactivated. The intention is to stop promises from doing actions that are no longer needed.
     * @type {boolean} */
    #isActivated = true;

    /** Gate-keeping boolean for #setEntryHTML function */ 
    #HTMLIsInserted = false;

    // Element references
    /** @type {HTMLAnchorElement} */
    #container = null;
    
    /** @type {HTMLImageElement} */
    #imgElem = null;
    
    /** @type {HTMLElement} */
    #nameElem = null;

    /** @type {HTMLElement} */
    #cultureElem = null;

    /** @type {HTMLElement} */
    #priceElem = null;

    /** Product price in 1/100 parts
     * @type {number} */ 
    #price = null;

    constructor() {
        super();
    }

    /** Set data and return a complete instance of "product entry" 
     * @param {productEntryDataResponse} productEntryData 
     * @returns {productEntry}
     * @throws {TypeError | Error} If the argument "product entry data" is invalid, or if the method #setProductData throws an error
     */
    static createEntry (productEntryData) {
        // Check if the "product entry data response object" is valid, by usinga specialized function
        if (!productEntry.isProductEntryDataResponseValid) {
            // Then, throw a TypeError
            throw new TypeError("Product Entry - static createEntry: The argument 'productEntryData' is invalid");
        }

        // To get an instance of "product entry" check the "product entry pool" first before creating a new instance

        /** The selected "product entry" element reference to use
         * @type {productEntry} */
        let selectedProductEntry = null;

        // Does the "product entry pool" have any instances?
        if (productEntry.#productEntryPool.length > 0) {
            // Then re-use one instance. It doesn't matter which instance is picked, as they are all reset since earlier
            selectedProductEntry = productEntry.#productEntryPool.pop();
        }

        // Otherwise, the "product entry pool" is empty
        else {
            // Create new "product entry" custom element
            selectedProductEntry = document.createElement("product-entry");
        }

        // Now, the target instance of "product entry" is selected

        // Set the activation flag of the selected instance
        selectedProductEntry.#isActivated = true;

        // Set the "pending data of product entry" of the selected instance. The intention is to stop outdated promises to use outdated data during potential race-conditions
        selectedProductEntry.#pendingProductEntryData = productEntryData;

        // Before setting any "product entry data", the inner DOM structure needs to be set up.
        // Check if HTML structure is NOT inserted yet
        if (!selectedProductEntry.#HTMLIsInserted) {
            // Then, create a promise to fetch and insert HTML. This function returns a promise consisting of a promise chain
            const HTMLInsertionPromise = selectedProductEntry.#setEntryHTML()
            
            // DEPRECATED: Moved to MutationObserver callback
            //
            // // After the HTML has been set
            // .then(() => {
            //     // Before setting the data of the selected instance of "product entry", check it has been deactivated since the promise was queued
            //     if (!selectedProductEntry.#isActivated) {
            //         // Then, stop this promise and resolve it
            //         return Promise.resolve();
            //     }
            //
            //     // Set the data of "product entry", but use the value of a member variable. This allows another function call of this instance to overwrite the data to use when the promise settles
            //     try { selectedProductEntry.#setProductData(selectedProductEntry.#pendingProductEntryData); }
            //     catch (e) { return Promise.reject(`Product Entry - static createEntry: Caught an error while setting data of the selected "product entry" in the promise "HTMLInsertionPromise": ${e}`) }
            //
            //     // When reaching this line, this promise is considered successful. Resolve this promise.
            //     return Promise.resolve();
            // })
            // 
            // // Catch any potential, residual errors in the promise chain
            // .catch((error) => console.error(`Product Entry - static createEntry: Caught an error in the promise "HTMLInsertionPromise": ${error}`));
        }

        // Otherwise, the HTML is already inserted
        else {
            // Set the data of "product entry" into the selected instance
            // The method can potentially throw an error
            try { selectedProductEntry.#setProductData(productEntryData); }
            catch (e) { throw new Error(`Product Entry - static createEntry: Caught an error while setting data of the selected "product entry": ${e}`) }
        }

        // Finally, return the selected instance of "product entry". The HTML may not be inserted yet when the instance is returned, but in that case, a promise has been queued to insert it.
        return selectedProductEntry;
    }

    /** Check if the given "product entry data response object" is valid or not
     * @param {productEntryDataResponse} productEntryData - The "product entry data response" object to validate
     * @returns {boolean} - Returns true for a valid object, and false for an invalid object. 
     */
    static isProductEntryDataResponseValid (productEntryData) {
        // Is undefined?
        if (
            typeof productEntryData !== "object"
            || productEntryData === null
        ) {
            console.error("Product Entry - static isProductEntryDataResponseValid: The argument 'product entry data response' is invalid");
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

    // DEPRECATED: attributeChangedCallback is replaced by a direct function call
    // DEPRECATED: To avoid a race condition, only let attributeChangedCallback to call #setEntryHTML
    //connectedCallback() {
    //    if (!this.#isWaitingForHTMLInsert) {
    //        this.#setEntryHTML()
    //        .catch((error) => console.error(`class productEntry - method connectedCallback: Caught an error when calling #setEntryHTML: ${error}`));
    //    }
    //}

    /** (DEPRECATED: attributeChangedCallback is replaced by a direct function call) Get the changed attribute is expected to contain a string of a serialized "product entry data object" in "json" format */
    attributeChangedCallback(name, oldValue, newValue) {
        // Before setting any "product entry data", the inner DOM structure needs to be set up.
        // An "immediately invoked function expression", that returns one or more promises based on conditions, effectively creating a modular promise chain.
        (function () {
            // Check if HTML structure is NOT inserted yet
            if (!this.#HTMLIsInserted) {
                // Then fetch and insert HTML. This function returns a promise chain
                return this.#setEntryHTML();
            }
            
            // Otherwise, only return a resolved promise to continue the outer promise chain
            else return promise.resolve();
        })()

        .then(() => {
            // Now, the DOM structure is set up

            // Set "product entry data" with error-handling using a "try ... catch" statement
            try { this.#setProductDataJSON(name, oldValue, newValue); }
            catch (e) { return Promise.reject(`Product Entry - attributeChangedCallback: Caught an error when calling function 'setProductData': ${e}`); }

            // When reaching this line, this promise is considered successful
            return Promise.resolve();
        })

        .catch((error) => console.error(`class productEntry - method attributeChangedCallback: Caught an error in Promise chain: ${error} `));
    }

    /** The Custom Elements API lifecycle callback when the custom element has been removed from the DOM */
    disconnectedCallback () {
        // Deactivate this instance
        this.#deactivate();
    }

    /** Set inner HTML of the entry, by fetching and then inserting the HTML text. One-time execution only, unless failed. */ 
    #setEntryHTML() {
        // Encapsulate this and the descending nodes with the Shadow DOM feature
        if (this.#shadowDOM === null) {
            this.#shadowDOM = this.attachShadow({ mode: "open" });
        }
      
        // Fetch resources for product entry. These resources are expected to be cached at this point with <link rel="preload"> feature
        return fetch("/source/collectors-store/client/html/product_entry.html", { cache:"default", mode:"cors" })

        // Process the "HTTP Response"
        .then((response) => {
            // Check if the "HTTP status code" is NOT ok
            if(!response.ok) Promise.reject("Product Entry - class productEntry - method #setEntryHTML: fetch response HTTP status code is NOT ok");
            
            // Convert the HTTP body into text
            return response.text();
        })

        // Process the HTTP body text, which is expected to be HTML text
        .then((HTMLData) => {
            // Use MutationObserver to wait until the inserted HTML text is parsed into referable objects
            const HTMLInsertionObserver = new MutationObserver(() => {
                // This method may throw an error
                try { this.#HTMLInsertionObserverCallback(); }
                catch (e) { return Promise.reject(`Product Entry - #setEntryHTML: Caught an error in the MutationObserver "HTMLInsertionObserver" while calling the callback method: ${e}`) }
            });
            
            // Create a wrapper container for inserting the HTML text into
            const wrapper = document.createElement("div");

            // Activate the observer for this wrapper container
            HTMLInsertionObserver.observe(wrapper, {
                subtree: true,
                childList: true
            });

            // Insert the HTML text into the wrapper element
            wrapper.innerHTML = HTMLData;
            this.shadowRoot.appendChild(wrapper)

            // Set the flag for the HTML being inserted into this instance
            this.#HTMLIsInserted = true;

            // When reaching this line, this promise is considered successful. Resolve it.
            return Promise.resolve();
        })
    }

    /** (DEPRECATED: attributeChangedCallback is replaced by a direct function call) Set "product entry data" in this "product entry" instance
     * @param {string} name - The name of the changed attribute
     * @param {string} oldValue - A string of a serialized "product entry data object" in "JSON" format is expected, but may also be an empty string
     * @param {string} newValue - A string of a serialized "product entry data object" in "JSON" format is expected, but may also be an empty string
     */ 
    #setProductDataJSON(name, oldValue, newValue) {
        // Expect attribute "product-entry-data"
        if (name !== "product-entry-data") return;

        // Firstly, check if an empty string as been passed in this attribute, indicating a request to deactivate this "product entry"
        if (newValue === "") {
            // Deactivate this instance
            this.#deactivateOld();

            // After deactivating, do no more work and return
            return;
        }

        // Parse the "JSON" string into a JS object
        /** The parsed "product entry data response object"
         * @type {productEntryDataResponse}
        */
        const productEntryData = JSON.parse(newValue);

        // Proceed to process each passed property according to the data structure
        // Process the passed "imgSrc" data, which will be inserted as an "src" attribute for <img> element
        imgSrcBlock: {
            // Validate the passed property
            if (typeof productEntryData.imgSrc === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.imgSrc but it's undefined");
                // Then do no more work and break this labeled block
                break imgSrcBlock;
            }
            
            // Validate the class-level reference variable to the "img" element
            if (this.#imgElem === null) {
                console.error("class productEntry - method #setData: member #img is null");
                // Then do no more work and break this labeled block
                break imgSrcBlock;
            }

            // Insert passed data as an attribute
            this.#imgElem.setAttribute("src", productEntryData.imgSrc);
        };

        // Process the passed "name" data, which will be inserted as "textContent" property value for the ".name" text element
        nameBlock: {
            // Validate the passed property
            if (typeof productEntryData.name === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.name but it's undefined");
                // Then do no more work and break this labeled block
                break nameBlock;
            }
            
            // Validate the reference to element
            if (this.#nameElem === null) {
                console.error("class productEntry - method #setData: member #name is null");
                // Then do no more work and break this labeled block
                break nameBlock;
            }

            // Insert passed data as text content
            this.#nameElem.textContent = productEntryData.name;
        };
        
        // Process the passed "culture" data, which will be inserted as "textContent" property value for the ".culture" text element
        cultureBlock: {
            // Validate the passed property
            if (typeof productEntryData.culture === "undefined") {
                console.error("class productEntry - method #setData: Expected property 'culture' but it's undefined");
                // Then do no more work and break this labeled block
                break cultureBlock;
            }
            
            // Validate the reference to element
            if (this.#cultureElem === null) {
                console.error("class productEntry - method #setData: member #culture is null");
                // Then do no more work and break this labeled block
                break cultureBlock;
            }

            // Insert passed data as text content
            this.#cultureElem.textContent = productEntryData.culture;
        };

        // Process the passed "price" data, which will be inserted as "textContent" property value for the ".price" text element
        priceBlock: {
            // Validate the passed property
            if (typeof productEntryData.price === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.price but it's undefined");
                // Then do no more work and break this labeled block
                break priceBlock;
            }
            
            // Validate the reference to element
            if (this.#priceElem === null) {
                console.error("class productEntry - method #setData: member #priceElem is null");
                // Then do no more work and break this labeled block
                break priceBlock;
            }

            // Store passed data for later use
            this.#price = productEntryData.price;

            // Insert passed data as text content
            const priceStr = productEntryData.price.toString();  // nnn... 1/100 parts
            const wholeCurrencyUnits = priceStr.substring(0, priceStr.length - 3); // length-1 for last index, lastIndex-2 for whole units
            const fractionCurrencyUnits = priceStr.substring (priceStr.length - 3, priceStr.length - 1);  // From last substring to last index
            this.#priceElem.textContent = `${wholeCurrencyUnits}.${fractionCurrencyUnits} USD`;  // Displaying whole units with 2 fraction decimals
        };

        // Process the passed "productURL" data, which is expected to link a "product view URL" from this "product entry"
        prodURLBlock: {
            // Check if the "product URL" property is undefined
            if (typeof productEntryData.productURL === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.productURL but it's undefined");
                // Then do no more work and break this labeled block
                break prodURLBlock;
            }
            
            // Enable the "hypertext link" of the container, which would make this "product entry" a clickable link.
            // Set the "href" attribute of the container, which is an HTML <a> anchor element
            this.#container.href = productEntryData.productURL;
        };
    }

    /** Set the data of this "Product Entry" by setting each respective element
     * @param {productEntryDataResponse} productEntryData
     * @throws If the argument productEntryData is invalid
     */
    #setProductData (productEntryData) {
        // Before setting the data of this instance of "product entry", check it has been deactivated since the promise was queued and the MutationObserver has been triggered asynchronously
        if (!this.#isActivated) {
            // Then, don't do anyting and return
            return;
        }
        
        // Check if the parameter "product entry data" is invalid
        if (
            typeof productEntryData !== "object"
            || productEntryData === null
        ) {
            // Then, throw a TypeError
            throw new TypeError("Product Entry - #setProductData: The argument productEntryData is invalid");
        }
        
        // Proceed to process each passed property according to the data structure
        // Process the passed "imgSrc" data, which will be inserted as an "src" attribute for <img> element
        imgSrcBlock: {
            // Validate the passed property
            if (typeof productEntryData.imgSrc === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.imgSrc but it's undefined");
                // Then do no more work and break this labeled block
                break imgSrcBlock;
            }
            
            // Validate the class-level reference variable to the "img" element
            if (this.#imgElem === null) {
                console.error("class productEntry - method #setData: member #img is null");
                // Then do no more work and break this labeled block
                break imgSrcBlock;
            }

            // Insert passed data as an attribute
            this.#imgElem.setAttribute("src", productEntryData.imgSrc);
        }

        // Process the passed "name" data, which will be inserted as "textContent" property value for the ".name" text element
        nameBlock: {
            // Validate the passed property
            if (typeof productEntryData.name === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.name but it's undefined");
                // Then do no more work and break this labeled block
                break nameBlock;
            }
            
            // Validate the reference to element
            if (this.#nameElem === null) {
                console.error("class productEntry - method #setData: member #name is null");
                // Then do no more work and break this labeled block
                break nameBlock;
            }

            // Insert passed data as text content
            this.#nameElem.textContent = productEntryData.name;
        }
        
        // Process the passed "culture" data, which will be inserted as "textContent" property value for the ".culture" text element
        cultureBlock: {
            // Validate the passed property
            if (typeof productEntryData.culture === "undefined") {
                console.error("class productEntry - method #setData: Expected property 'culture' but it's undefined");
                // Then do no more work and break this labeled block
                break cultureBlock;
            }
            
            // Validate the reference to element
            if (this.#cultureElem === null) {
                console.error("class productEntry - method #setData: member #culture is null");
                // Then do no more work and break this labeled block
                break cultureBlock;
            }

            // Insert passed data as text content
            this.#cultureElem.textContent = productEntryData.culture;
        }

        // Process the passed "price" data, which will be inserted as "textContent" property value for the ".price" text element
        priceBlock: {
            // Validate the passed property
            if (typeof productEntryData.price === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.price but it's undefined");
                // Then do no more work and break this labeled block
                break priceBlock;
            }
            
            // Validate the reference to element
            if (this.#priceElem === null) {
                console.error("class productEntry - method #setData: member #priceElem is null");
                // Then do no more work and break this labeled block
                break priceBlock;
            }

            // Store passed data for later use
            this.#price = productEntryData.price;

            // Insert passed data as text content
            const priceStr = productEntryData.price.toString();  // nnn... 1/100 parts
            const wholeCurrencyUnits = priceStr.substring(0, priceStr.length - 3); // length-1 for last index, lastIndex-2 for whole units
            const fractionCurrencyUnits = priceStr.substring (priceStr.length - 3, priceStr.length - 1);  // From last substring to last index
            this.#priceElem.textContent = `${wholeCurrencyUnits}.${fractionCurrencyUnits} USD`;  // Displaying whole units with 2 fraction decimals
        }

        // Process the passed "productURL" data, which is expected to link a "product view URL" from this "product entry"
        prodURLBlock: {
            // Check if the "product URL" property is undefined
            if (typeof productEntryData.productURL === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.productURL but it's undefined");
                // Then do no more work and break this labeled block
                break prodURLBlock;
            }
            
            // Enable the "hypertext link" of the container, which would make this "product entry" a clickable link.
            // Set the "href" attribute of the container, which is an HTML <a> anchor element
            this.#container.href = productEntryData.productURL;
        }
    }

    /** (DEPRECATED: Replaced by the public method) Deactivate the "this" instance of "product entry", for stashing it in the "product entry pool" and making it available for re-use. The deactivation is done by simply clearing all data */
    #deactivateOld () {
        // Clear data internally and in HTML elements
        // Data that should be preserved and will not be cleared:
        // - The inner DOM
        // - The private property #HTMLIsInserted
        
        this.#nameElem.textContent = "";
        this.#cultureElem.textContent = "";
        this.#imgElem.src = "";
        this.#price = null;
        this.#priceElem.textContent = "";
        this.#container.href = "";
    }

    /** Deactivate the "this" instance of "product entry", for stashing it in the "product entry pool" and making it available for re-use. The deactivation is done by simply clearing all data */
    #deactivate () {
        // Set the flag for activation state, to stop any promises from doing work that is no longer needed
        this.#isActivated = false;

        // Clear data internally and in HTML elements
        // Data that should be preserved and will not be cleared:
        // - The inner DOM
        // - The private property #HTMLIsInserted
        
        this.#pendingProductEntryData = null;
        this.#nameElem.textContent = "";
        this.#cultureElem.textContent = "";
        this.#imgElem.src = "";
        this.#price = null;
        this.#priceElem.textContent = "";
        this.#container.href = "";

        // Add this deactivated instance to the pool of free instances of "product entries"
        productEntry.#productEntryPool.push(this);
    }

    /** A callback method for when the MutationObserver has triggered on the wrapper for HTML insertion. This method may initiate a limited recursive loop */
    #HTMLInsertionObserverCallback () {
        this.#container = this.#shadowDOM.querySelector(".container");
        this.#imgElem = this.#shadowDOM.querySelector(".image");
        this.#nameElem = this.#shadowDOM.querySelector(".name");
        this.#cultureElem = this.#shadowDOM.querySelector(".culture");
        this.#priceElem = this.#shadowDOM.querySelector(".price");

        // Check if any of the "query selectors" returned null
        if (
            this.#container == null
            || this.#imgElem == null
            || this.#nameElem == null
            || this.#cultureElem == null
            || this.#priceElem == null
        ) {
            console.warn("Product Entry - class productEntry - method #setEntryHTML: After observing mutations in the wrapper container after inserting HTML text, the inserted HTML has not been completely parsed into HTML elements yet");

            // Only wait for maximum of 5 times
            if (this.#numWaitsForHTMLParsing <= 5) {
                // Wait for two animation frames
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        // Count this evaluation as an attempt of waiting for the HTML text to parse
                        this.#numWaitsForHTMLParsing++;

                        // Recursively call this function
                        this.#HTMLInsertionObserverCallback();
                    })
                })
            }
        }

        // Otherwise, all the HTML text has been parsed successfully
        else {
            // Once succeeded, disconnect the observer
            HTMLInsertionObserver.disconnect(); 

            this.#setProductData(this.#pendingProductEntryData);

            // Set the data of "product entry", but use the value of a member variable. This allows another function call of this instance to overwrite the data to use when the promise settles
            try { this.#setProductData(this.#pendingProductEntryData); }
            catch (e) { throw new Error(`Product Entry - #HTMLInsertionObserverCallback: Caught an error while setting data of this instance of "product entry": ${e}`) }

            // Temporary fix: remove the attributes for fixed width and height from the <img> element
            this.#imgElem.removeAttribute("width");
            this.#imgElem.removeAttribute("height");
        }
    }
}


////////////////////////////////////////
// Main functionality
////////////////////////////////////////

// // DEPRECATED: Replaced by using a fetch for a JSON file
// function placeholderFunc () {
//     const img = document.body.querySelector(".image");
//     const name = document.body.querySelector(".name");
//     const culture = document.body.querySelector(".culture");
//     const price = document.body.querySelector(".price");
// 
//     img.src = "media/icons/centaur_placeholder_512x.png"
//     name.textContent = "Centaur";
//     culture.textContent = "Greek Mythology";
//     price.textContent = "12.00 USD";
// }

window.customElements.define("product-entry", productEntry);