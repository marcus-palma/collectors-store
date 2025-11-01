// The "Product Filter Menu" feature.
// Purpose: Provide an intuitive menu of refining shopping item results
// Dependency: The Product Filter Menu is a module, and is only used in the "Product Grid" feature when the corresponding use-option for this menu is activated.

"use strict";

/////////////////////////////
// Imports & Exports
/////////////////////////////

// import "Product Grid" module
/** @import {initialize} from "./product_grid" */
/** @import {requestToPropagate} from "./product_grid" */
import {
    initialize,
    requestToPropagate
} from "/source/collectors-store/client/js/product_grid.js";

export { applyProductFilterMenuTemplate };


/////////////////////////////
// Data Structures
/////////////////////////////

/** 
 * @typedef productFilterMenuTemplate
 * @property {Array.<productFilterCategoryTypeEntry>} categoryTypes
 */

/**
 * @typedef productFilterCategoryTypeEntry
 * @property {string} displayName 
 * @property {string} categoryType
 * @property {Array.<productFilterCategoryIDEntry>} categoryIDs
 */

/**
 * @typedef productFilterCategoryIDEntry
 * @property {string} displayName
 * @property {string} categoryID
 * @property {string} imgSrc
*/

/////////////////////////////
// Script-level Variables
/////////////////////////////

/** The "product filter settings object" that controls what "product filter settings" to display in the user interface. The values are fetched from the server. 
 * @type {productFilterMenuTemplate} */
let productFilterMenuTemplate;


/////////////////////////////
// Classes
/////////////////////////////

class ProductFilterGrid extends HTMLElement {
    constructor () {
        super();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Check if attribute is NOT category-type. Then, do nothing and return;
        if (name !== "category-type") return;

        // Match with settings
        for (const entry of productFilterMenuTemplate) {
            if (entry.categoryType === newValue) {

            } 
        }
    }
}


/////////////////////////////
// Main functionality
/////////////////////////////

initProductFilterMenu();

/** Initialize the "product filter menu" */
function initProductFilterMenu () {

    // Register the custom element "product filter grid"
    customElements.define("product-filter-grid", ProductFilterGrid);

    fetchMenuTemplate()
    
    .then(() => { applyProductFilterMenuTemplate(productFilterMenuTemplate); })

    .catch((error) => { console.error(`Product Filter Menu - initProductFilterMenu: Caught error in promise chain: ${error}`) });
}

/** Fetch the "product filter menu template" from the server */
function fetchMenuTemplate () {
    return fetch("source/collectors-store/client/json/product_filter_menu_template_sample.json")

    // Process server response
    .then((response) => {
        // Check if the "HTTP status code" is OK
        if (!response.ok) Promise.reject("Product Filter Menu - fetchMenuTemplate: Response HTTP status code was not OK.");
        
        // Convert the "HTTP response body" to text
        return response.text();
    })

    // Process the stringified text from the server response
    .then((JSONText) => {
        /** @type {productFilterMenuTemplate} */
        const newProductFilterMenuTemplate = JSON.parse(JSONText);

        // TODO: Check if the new object from parsing is invalid

        // Set the script-level variable "product filter menu template" with the new template from the server response
        productFilterMenuTemplate = newProductFilterMenuTemplate;
    })

    .catch((error) => { console.error(`Product Filter Menu - fetchMenuTemplate: Caught error in promise chain: ${error}`) });
}

/** Apply the "product filter menu template" by creating elements based on the structure and data in the given template object
 * @param {productFilterMenuTemplate} template 
*/
function applyProductFilterMenuTemplate (template) {
    // Check if the argument "product filter menu template" is undefined
    if (typeof template === "undefined") {
        console.error("Product Filter Menu - applyProductFilterMenuTemplate: The argument 'template' is undefined.");
        // Do nothing and return
        return;
    }

    for (const categoryType of template.categoryTypes) {
        const newProductFilterGrid = document.createElement("product-filter-grid");
        const newDataAttr = document.createAttribute("category-type-json");
        newProductFilterGrid.setAttributeNode(newDataAttr);
        newDataAttr.value = JSON.stringify(categoryType);
    }

    // TODO:
    // Iterate through the categoryTypes array
    //      Create Custom Element of class ProductFilterGrid with displayName, categoryType, categoryIDs
    //      Constructor in ProductFilterGrid:
    //          Iterate through the categoryIDs array
    //              Create Custom Element of class ProductFilterEntry with displayName, categoryID, imgSrc
    //              Constructor in productFilterEntry:
    //                  Use displayName
    //                  Use categoryID
    //                  Use imgSrc
    //                  Add eventListener handleClick, use CSS rule "pointer-events: none;"

}