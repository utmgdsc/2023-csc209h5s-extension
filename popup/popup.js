const RUPERT_URL = "http://www.cs.toronto.edu/~rupert/209/lec";
const BYPASS_CORS = "https://cors.zimjs.com/";

const getLectureLink = (lectureNumber) => {
    return RUPERT_URL + lectureNumber.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) + ".pdf";
}

async function getLectures(lectureNumber) {
    let e = document.createElement('a');
    e.setAttribute('target', '_blank');
    e.setAttribute('class', 'rupert');
    e.href = getLectureLink(lectureNumber);
    e.innerHTML = lectureNumber;
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

async function UrlExists(url) {
    return fetch(BYPASS_CORS + url).then((response) => {
        return response.status === 200;
    });
}

getLectures(1);
