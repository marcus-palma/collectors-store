"use strict";

// Element references
const container = document.body.querySelector(".container");

// Wait for Product Entry script to evaluate before proceeding
import "/source/collectors-store/js/product_entry.js";

propagateGrid();

// Deprecated
function insertProductEntryJS() {
    fetch("/source/collectors-store/html/product_entry.js")
    .then((response) => {
        if (!response.ok) console.error("Product Grid - function insertProductEntryJS: Response HTTP status code is not OK");
        return response.text();
    })
    .then((JSText))
}

// Deprecated
function placeholderFunc () {
    return fetch("/source/collectors-store/html/product_entry.html", { cache:"default", mode:"same-origin" })
    .then((response) => {
        if (!response.ok) console.error("Response status not ok");
        return response.text();
    })
    .then((HTMLText) => {
        for (let i = 0; i < 12; i++) {
            // Take HTML Data
            // Create wrapper element
            const wrapper = document.createElement("div");
            // Insert html text
            wrapper.innerHTML = HTMLText;
            // Append wrapper to container
            container.appendChild(wrapper);
            // Create script element
            const script = document.createElement("script");
            script.src = "/source/collectors-store/js/product_entry.js";
            // Append script to wrapper
            wrapper.appendChild(script);
        }
    });
}

function propagateGrid() {
    fetch("/source/collectors-store/json/product_entry_data_chunk_sample.json")
    .then((response) => {
        if (!response.ok) console.error("Product Grid - function propagateGrid: Response HTTP status code is not OK");
        return response.text();
    })
    .then((JSONText) => {
        const arrayOfObjects = JSON.parse(JSONText);
        for (const entry of arrayOfObjects) {
            // TODO:
            // Get entry
            // Create Custom Element
            // Add Custom Element into grid "container"
            // Pass entry data as text into Custom Element attribute as "product-entry-data". JSON.stringify()

            const productEntry = document.createElement("product-entry");
            container.appendChild(productEntry);
            const attr = document.createAttribute("product-entry-data");
            attr.value = JSON.stringify(entry);
            productEntry.setAttributeNode(attr);
        }
    })
}