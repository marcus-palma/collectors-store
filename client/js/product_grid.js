"use strict";

////////////////////////////////////////
// Modules
////////////////////////////////////////

// Wait for Product Entry script to evaluate before proceeding. It will define a Custom Element in the registry, register Event Listeners and load its dependencies
import "/source/collectors-store/client/js/product_entry.js";


////////////////////////////////////////
// Script-level variables
////////////////////////////////////////

/** Flag for when the server responds with the last chunk of Product Entries for a given query
 *  @type {Boolean} */
let isLastChunk;

// Grid container that will hold Product Entries
const grid = document.body.querySelector(".container");


////////////////////////////////////////
// Main functionality
////////////////////////////////////////

// Ready to run one iteration of propagating the grid
propagateGrid();


// Propagate the grid container with one or more instances of "Product Entry" feature. Can be called multiple times for increasing the number of entries
function propagateGrid() {
    return fetch("/source/collectors-store/client/json/product_grid_response_sample.json")
    .then((response) => {
        if (!response.ok) console.error("Product Grid - function propagateGrid: Response HTTP status code is not OK");
        return response.text();
    })
    .then((JSONText) => {
        // Expect "Product Grid Response" structure:
        // "isLastChunk": <boolean>. The server is expected to inform the client when the last products has been send for the given query
        // "productEntryArray": <array: <productEntryResponse>>. An array with one or more objects containing data for the Product Entry feature 

        // Parse the JSON text into JS objects
        const productGridResponse = JSON.parse(JSONText);

        // TODO Validate properties from structure above
        if (typeof productGridResponse.isLastChunk === "undefined" || typeof productGridResponse.productEntryArray === "undefined") return Promise.reject("Product Grid - function propagateGrid: Product Grid Response is invalid");

        isLastChunk = productGridResponse.isLastChunk;  // TODO: If true, display a hint "End of results" on screen

        // Loop through the Product Entry Array (size is determined by server)
        for (const entry of productGridResponse.productEntryArray) {
            // Create and add a Custom Element to the grid container
            const productEntry = document.createElement("product-entry");
            grid.appendChild(productEntry);

            // Create and add an attribute node for passing one "Product Entry Data Structure" as string type to the "Product Entry". This is expected to fire the "attributeChangedCallback" function on the Custom Element
            const attr = document.createAttribute("product-entry-data");
            attr.value = JSON.stringify(entry);
            productEntry.setAttributeNode(attr);
        }
    })
}