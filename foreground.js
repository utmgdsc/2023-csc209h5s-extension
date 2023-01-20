"use strict";
/*
 * This script gets injected into any opened page
 * whose URL matches the pattern defined in the manifest
 * (see "content_script" key).
 * Several foreground scripts can be declared
 * and injected into the same or different pages.
 */

const DARK_MODE = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (document.location.href.split("/").pop().split(".").pop() === "shtml") {
    /*
     * Nav bar improvements
     */
    document.querySelectorAll("nav .links li").forEach(function (e) {
        // fix the link to piazza
        if (e.innerHTML.includes("Piazza")) {
            e.setAttribute("href", "https://piazza.com/class/lcnmbsmgyth7fa");
            e.innerHTML = "<a href=\"https://piazza.com/class/lcnmbsmgyth7fa\" target='_blank'>Piazza</a>";
        }

        // bold current link
        if (e.querySelector("a").href === document.location.href) {
            e.querySelector("a").setAttribute("style", "font-weight: bold; color: var(--text-color) !important;");
        }
    });

    /*
     * Links
     */
    // open external links in new tab
    document.querySelectorAll("a").forEach(function (e) {
        if (e.host != document.location.host) {
            e.setAttribute("target", "_blank");
        }
    });

    // reverse order of table rows (so that newest is at the top)
    function reverseChildren(elem) {
        // converts the elem's children into an array, reverses it, then appends to the elem
        Array.from(elem.children).reverse().forEach(function (e) { elem.appendChild(e) })
    }

    // changes for lectures.shtml
    if (document.location.pathname.split("/").pop() === "lectures.shtml") {
        // move notes links into main lectures page
        document.querySelectorAll("table a").forEach(function (e) {
            if (e.innerHTML === "notes" && e.href.split(".").pop() === "html") {
                // directory of the notes url
                const directory = e.href.replace("/index.html", "");

                fetch(e.href)
                    .then(function (response) {
                        // The API call was successful!
                        return response.text();
                    })
                    .then(function (html) {
                        // Initialize the DOM parser
                        const parser = new DOMParser();

                        // Parse the text
                        var doc = parser.parseFromString(html, "text/html");

                        // make links absolute instead of relative
                        doc.querySelectorAll("a").forEach(function (r) {
                            // file name of each individual note
                            const fileName = directory + "/" + r.getAttribute("href");
                            r.setAttribute("href", fileName);
                        });

                        // append the content of the notes link
                        e.closest("td").innerHTML += (doc.querySelector("body").innerHTML);
                    })
                    .catch(function (err) {
                        // There was an error
                        console.warn("Something went wrong.", err);
                    });
            }
        });

        // reverse table row order (such that the lectures are now in reverse-chronological order)
        reverseChildren(document.querySelector("tbody"));
    }
}
