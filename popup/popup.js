const RUPERT_URL = "http://www.cs.toronto.edu/~rupert/209/lec";
const BYPASS_CORS = "https://cors.zimjs.com/";

const getLectureLink = (lectureNumber) => {
    return RUPERT_URL + lectureNumber.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) + ".pdf";
}

/**
 * Recursively check if the lecture exists and add it to the DOM if it does
 * @param {number} lectureNumber the first lecture number to check
 * @returns {Promise<void>} a promise that resolves when the recursion is done
 */
async function getLectures(lectureNumber) {
    let e = document.createElement('a');
    e.setAttribute('target', '_blank');
    e.setAttribute('class', 'rupert');
    e.href = getLectureLink(lectureNumber);
    e.textContent = lectureNumber;
    e.style.visibility = "hidden";

    // base case for recursion (12 lectures in total)
    if (lectureNumber > 12) {
        return;
    }

    // check if the link exists and break the loop if it doesn't
    UrlExists(getLectureLink(lectureNumber)).then((exists) => {
        if (exists) {
            document.getElementById('lectures').appendChild(e);
            e.style.visibility = "visible";
            getLectures(lectureNumber + 1);
        } else {
            e.remove();
        }
    });
}

/**
 * Check if a url exists
 * @param {*} url the url to check
 * @returns {Promise<boolean>} a promise that resolves to true if the url exists
 */
async function UrlExists(url) {
    return fetch(BYPASS_CORS + url).then((response) => {
        return response.status === 200;
    });
}

/*
 * Add all the lecture links to the DOM
 * @param {number} lectureNumber current week number
 * @returns {Promise<void>} a promise that resolves when the recursion is done
 */
function addLectures(lectureNumber) {
    for (let i = 1; i < lectureNumber; i++) {
        let e = document.createElement('a');
        e.setAttribute('target', '_blank');
        e.setAttribute('class', 'rupert');
        e.href = getLectureLink(i);
        e.textContent = i;
        document.getElementById('lectures').appendChild(e);
    }

    getLectures(lectureNumber);
}

// get the week number relative to the start of the course (jan 9th 2022)
addLectures(Math.min(Math.floor((Date.now() - new Date(2023, 0, 9))/ 604800000), 12) - 1);
