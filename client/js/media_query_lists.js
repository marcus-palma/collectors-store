// Use shared Media Query List objects for a unified definition of media breakpoints across the application 

"use strict";

export { mediaQueryListNarrow };

// MediaQueryList object for narrow screens
const mediaQueryListNarrow = matchMedia(
    "(width <= 1080px) and (max-aspect-ratio: 6/7)"
);