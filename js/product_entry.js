"use strict";

// Deprecated
function placeholderFunc () {
    const img = document.body.querySelector(".image");
    const name = document.body.querySelector(".name");
    const myth = document.body.querySelector(".mythology");
    const price = document.body.querySelector(".price");

    img.src = "/icons/centaur_placeholder_512x.png"
    name.textContent = "Centaur";
    myth.textContent = "Greek Mythology";
    price.textContent = "12.00 USD";
}

// Declare and define an Autonomous Custom Element
class productEntry extends HTMLElement {
    // Observe for attribute change, expecting incoming data needed for setting up this product entry object 
    static observedAttributes =  ["product-entry-data"];

    #shadowDOM = null;

    // Gate-keeping boolean for #setEntryHTML function
    #HTMLIsInserted = false;

    // Element references
    #container = null;
    #img = null;
    #name = null;
    #myth = null;
    #priceElem = null;

    // Product price in 1/100 parts
    #price = null;

    // Product URL for opening a product view page
    #productURL = null;

    constructor() {
        super();
    }

    // To avoid race condition, only let attributeChangedCallback to call #setEntryHTML
    //connectedCallback() {
    //    if (!this.#isWaitingForHTMLInsert) {
    //        this.#setEntryHTML()
    //        .catch((error) => console.error(`class productEntry - method connectedCallback: Caught an error when calling #setEntryHTML: ${error}`));
    //    }
    //}

    attributeChangedCallback(name, oldValue, newValue) {
        const promise = new Promise((resolve, reject) => {
            if (!this.#HTMLIsInserted) {
                //console.warn("class productEntry - method attributeChangedCallback: member #HTMLIsSet is false, which means that the function setHTML has not been run yet. However, the function will be called now to mitigate the issue");
                resolve(this.#setEntryHTML());
            }
            else return resolve();
        })
        .then(() => {
            this.#setProductData(name, oldValue, newValue); // TODO: error handling
            return Promise.resolve();
        })
        .catch((error) => console.error(`class productEntry - method attributeChangedCallback: Caught an error in Promise chain: ${error} `));
    }

    // Set inner HTML of the entry. One-time execution only unless failed
    #setEntryHTML() {
        // Encapsulate this and the descending nodes with the Shadow DOM feature
        if (this.#shadowDOM === null) {
            this.#shadowDOM = this.attachShadow({ mode: "open" });
        }
      
        // Fetch resources for product entry. These resources are expected to be cached at this point with <link rel="preload"> feature
        return fetch("/source/collectors-store/html/product_entry.html", { cache:"default", mode:"cors" }) // { cache:"default", mode:"same-origin" }
        .then((response) => {
            if(!response.ok) Promise.reject("class productEntry - method connectedCallback: fetch response HTTP status is not ok");
            return response.text();
        })
        .then((HTMLData) => {
            // Use MutationObserver to wait until the inserted HTML text is parsed into referable objects
            const observer = new MutationObserver(() => {
                this.#container = this.#shadowDOM.querySelector(".container");
                this.#img = this.#shadowDOM.querySelector(".image");
                this.#name = this.#shadowDOM.querySelector(".name");
                this.#myth = this.#shadowDOM.querySelector(".mythology");
                this.#priceElem = this.#shadowDOM.querySelector(".price");

                if (this.#container == null ||
                    this.#img == null ||
                    this.#name == null ||
                    this.#myth == null ||
                    this.#priceElem == null) {
                        console.warn("class productEntry - method #setEntryHTML: After observing mutations in ProductEntry after inserting HTML text, the inserted HTML has not yet been parsed into element objects")
                    }
                else {
                    // Once succeeded, disconnect the observer
                    observer.disconnect(); 

                    // Temporary fix: remove attributes from img element
                    this.#img.removeAttribute("width");
                    this.#img.removeAttribute("height");
                }
            })
            
            const div = document.createElement("div");
            observer.observe(div, {
                subtree: true,
                childList: true
            });

            //this.shadowRoot.innerHTML = HTMLData;
            div.innerHTML = HTMLData;
            this.shadowRoot.appendChild(div)

            this.#HTMLIsInserted = true;
            return Promise.resolve();
        })
    }

    // Set product data into the created 
    #setProductData(name, oldValue, newValue) {
        // productGridDataStructure
        // imgSrc: <string ASCII>
        // name: <string UTF-8>
        // mythology: <string UTF-8>
        // price: <uint32>
        // productURL: <string ASCII>
        
        // Expect attribute "product-entry-data"
        if (name !== "product-entry-data") return;

        // Expect value type "application/json"
        // Parse the JSON string into a JS object
        const data = JSON.parse(newValue);

        // Proceed to process each passed property according to the data structure
        // Process the passed "imgSrc" data, which will be inserted as an "src" attribute for <img> element
        imgSrcBlock: {
            // Validate the passed property
            if (typeof data.imgSrc === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.imgSrc but it's undefined");
                break imgSrcBlock;
            }
            
            // Validate the reference to element
            if (this.#img === null) {
                console.error("class productEntry - method #setData: member #img is null");
                break imgSrcBlock;
            }

            // Insert passed data as an attribute
            this.#img.setAttribute("src", data.imgSrc);
        };

        // Process the passed "name" data, which will be inserted as "textContent" property value for the ".name" text element
        nameBlock: {
            // Validate the passed property
            if (typeof data.name === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.name but it's undefined");
                break nameBlock;
            }
            
            // Validate the reference to element
            if (this.#name === null) {
                console.error("class productEntry - method #setData: member #name is null");
                break nameBlock;
            }

            // Insert passed data as text content
            this.#name.textContent = data.name;
        };
        
        // Process the passed "mythology" data, which will be inserted as "textContent" property value for the ".mythology" text element
        mythBlock: {
            // Validate the passed property
            if (typeof data.mythology === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.mythology but it's undefined");
                break mythBlock;
            }
            
            // Validate the reference to element
            if (this.#myth === null) {
                console.error("class productEntry - method #setData: member #myth is null");
                break mythBlock;
            }

            // Insert passed data as text content
            this.#myth.textContent = data.mythology;
        };

        // Process the passed "price" data, which will be inserted as "textContent" property value for the ".price" text element
        priceBlock: {
            // Validate the passed property
            if (typeof data.price === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.price but it's undefined");
                break priceBlock;
            }
            
            // Validate the reference to element
            if (this.#priceElem === null) {
                console.error("class productEntry - method #setData: member #priceElem is null");
                break priceBlock;
            }

            // Store passed data for later use
            this.#price = data.price;

            // Insert passed data as text content
            const priceStr = data.price.toString();  // nnn... 1/100 parts
            const wholeCurrencyUnits = priceStr.substring(0, priceStr.length - 3); // length-1 for last index, lastIndex-2 for whole units
            const fractionCurrencyUnits = priceStr.substring (priceStr.length - 3, priceStr.length - 1);  // From last substring to last index
            this.#priceElem.textContent = `${wholeCurrencyUnits}.${fractionCurrencyUnits} USD`;  // Displaying whole units with 2 fraction decimals
        };

        // Process the passed "productURL" data, which will be stored for later use
        prodURLBlock: {
            // Validate the passed property
            if (typeof data.productURL === "undefined") {
                console.error("class productEntry - method #setData: Expected property data.productURL but it's undefined");
                break prodURLBlock;
            }
            
            // Store the passed data for later use
            this.#productURL = data.productURL;
        };
    }
}

window.customElements.define("product-entry", productEntry);