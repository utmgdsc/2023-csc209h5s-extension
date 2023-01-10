// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

"use strict";
(function() {
    if (document.location.href.split("/").pop().split(".").pop() === "shtml") {
        /*
         * Nav bar improvements
         */
        // add link to utorsubmit to main nav
        document.querySelector(".links").innerHTML += "<li><a href=\"https:\/\/submit.utm.utoronto.ca\/utorsubmit\/student\/ViewDashboard.action\">UTORSubmit</a></li>"

        // fix the link to piazza
        document.querySelectorAll("nav li a").forEach(function(e) {
            if (e.text == "Piazza") {
                e.setAttribute("href", "https://piazza.com/class/l84kln0j7ft1p4");
            }
        });

        /*
         * Links
         */
        // open external links in new tab
        document.querySelectorAll("a").forEach(function(e) {
            if (e.host != document.location.host) {
                e.setAttribute("target", "_blank");
            }
        }); // rof

        // reverse order of table rows (so that newest is at the top)
        function reverseChildren(elem) {
            // converts the elem's children into an array, reverses it, then appends to the elem
            Array.from(elem.children).reverse().forEach(function(e){elem.appendChild(e)})
        }

        // changes for lectures.shtml
        if (document.location.pathname.split("/").pop() === "lectures.shtml") {
            // move notes links into main lectures page
            document.querySelectorAll("table a").forEach(function(e) {
                if (e.innerHTML === "notes" && e.href.split(".").pop() === "html") {
                    // directory of the notes url
                    const directory = e.href.replace("/index.html", "");

                    fetch(e.href)
                        .then(function(response) {
                            // The API call was successful!
                            return response.text();
                        })
                        .then(function(html) {
                            // Initialize the DOM parser
                            const parser = new DOMParser();

                            // Parse the text
                            var doc = parser.parseFromString(html, "text/html");

                            // make links absolute insread of relative
                            doc.querySelectorAll("a").forEach(function(r) {
                                // file name of each individual note
                                const fileName = directory + "/" + r.getAttribute("href");
                                r.setAttribute("href", fileName);
                            });

                            // append the content of the notes link
                            e.closest("td").innerHTML += (doc.querySelector("body").innerHTML);
                        })
                        .catch(function(err) {
                            // There was an error
                            console.warn("Something went wrong.", err);
                        });
                }
            });

            // reverse table row order (such that the lectures are now in reverse-chronological order)
            reverseChildren(document.querySelector("tbody"));

        } // fi
    }

    /*
     * syntax highlighting (experimental)
     * credit: https://codepen.io/maxwell_alexius/pen/oeVxod
     */
    // python files only
    else if (document.location.href.split("/").pop().split(".").pop() === "py" | document.querySelector("pre").innerHTML.split("\n")[0] === "#!/usr/bin/python3") {
        Array.prototype.includes = function(value) {
            return this.indexOf(value) !== -1;
        };
        String.prototype.characterize = function(callback) {
            var characters = this.split("");
            var options = {};

            for (var i = 0; i < this.length; i++) {
                options = callback(characters[i]);
            }
        }

        var $textarea;
        var $highlight;

        var $keywords = ["False", "None", "True", "and", "as", "assert", "break", "class", "continue", "def", "del", "elif", "else", "except", "finally", "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise", "return", "try", "while", "with", "yield"];
        var $functions = ["abs", "dict", "help", "min", "setattr", "all", "dir", "hex", "next", "slice", "any", "divmod", "id", "object", "sorted", "ascii", "enumerate", "input", "oct", "staticmethod", "bin", "eval", "int", "open", "str", "bool", "exec", "isinstance", "ord", "sum", "bytearray", "filter", "issubclass", "pow", "super", "bytes", "float", "iter", "print", "tuple", "callable", "format", "len", "property", "type", "chr", "frozenset", "list", "range", "vars", "classmethod", "getattr", "locals", "repr", "zip", "compile", "globals", "map", "reversed", "_import_", "complex", "hasattr", "max", "round", "delattr", "hash", "memoryview", "set"];

        var code = document.querySelector("pre").innerHTML;

        $textarea = document.querySelector("pre");
        $highlight = document.querySelector("pre");

        var triggerHighlight = function() {
            var tokens = tokenize($textarea.innerHTML);
            $highlight.innerHTML = "";
            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                var span = document.createElement("span");
                span.className = "highlight-" + token.type;
                span.innerText = token.value;
                $highlight.appendChild(span);
            }
            var lines = $textarea.innerHTML.split("\n");
            if (lines[lines.length - 1] === "") {
                var br = document.createElement("br");
                $highlight.appendChild(br);
            }
        };

        var tabCode = 9;
        var leftParenthesisCode = 40;
        $textarea.addEventListener("keydown", function(event) {
            switch (event.keyCode) {
                case tabCode:
                    event.preventDefault();
                    this.value += "    ";
                    break;
            }
        });

        $textarea.textContent = code;
        $highlight.textContent = code;
        triggerHighlight()

        function tokenize(inputString) {
            var tokens = [];
            var lexedValue = "";
            var currentToken = null;

            function newSpaceToken() {
                currentToken = {
                    type: "space",
                    value: " "
                };
                lexedValue = "";
            }

            function parseLexedValueToToken() {
                if (lexedValue) {
                    if ($keywords.includes(lexedValue)) {
                        tokens.push({
                            type: "keyword",
                            value: lexedValue
                        })
                    } else if ($functions.includes(lexedValue)) {
                        tokens.push({
                            type: "function",
                            value: lexedValue
                        })
                    } else if (lexedValue !== "") {
                        if (isNaN(lexedValue)) {
                            tokens.push({
                                type: "default",
                                value: lexedValue
                            })
                        } else {
                            tokens.push({
                                type: "number",
                                value: lexedValue
                            })
                        }
                    }
                    lexedValue = "";
                }
            }

            function lex(char) {
                if (char !== " " && currentToken && currentToken.type === "space") {
                    tokens.push(currentToken);
                    lexedValue = "";
                    currentToken = null;
                }

                switch (char) {
                    case " ":
                        if ($keywords.includes(lexedValue)) {
                            tokens.push({
                                type: "keyword",
                                value: lexedValue
                            })
                            newSpaceToken();
                        } else if ($functions.includes(lexedValue)) {
                            tokens.push({
                                type: "function",
                                value: lexedValue
                            })
                            newSpaceToken();
                        } else if (lexedValue !== "") {
                            if (isNaN(lexedValue)) {
                                tokens.push({
                                    type: "default",
                                    value: lexedValue
                                })
                            } else {
                                tokens.push({
                                    type: "number",
                                    value: lexedValue
                                })
                            }
                            newSpaceToken();
                        } else if (currentToken) {
                            currentToken.value += " ";
                        } else {
                            newSpaceToken();
                        }
                        break;

                    case "\"":
                    case "'":
                        if (currentToken) {
                            if (currentToken.type === "string") {
                                if (currentToken.value[0] === char) {
                                    currentToken.value += char
                                    tokens.push(currentToken)
                                    currentToken = null;
                                } else {
                                    currentToken.value += char
                                }
                            } else if (currentToken.type === "comment") {
                                currentToken.value += char
                            }
                        } else {
                            if (lexedValue) {
                                tokens.push({
                                    type: "default",
                                    value: lexedValue
                                });
                                lexedValue = "";
                            }
                            currentToken = {
                                type: "string",
                                value: char
                            }
                        }
                        break;

                    case "=":
                    case "+":
                    case "-":
                    case "*":
                    case "/":
                    case "%":
                    case "&":
                    case "|":
                    case ">":
                    case "<":
                    case "!":
                        if (currentToken) {
                            currentToken.value += char;
                        } else {
                            parseLexedValueToToken();
                            tokens.push({
                                type: "operator",
                                value: char
                            })
                        }
                        break;

                    case "#":
                        if (currentToken) {
                            currentToken.value += char;
                        } else {
                            parseLexedValueToToken();
                            currentToken = {
                                type: "comment",
                                value: char
                            }
                        }
                        break;

                    case ":":
                        if (currentToken) {
                            currentToken.value += char;
                        } else {
                            parseLexedValueToToken();
                            tokens.push({
                                type: "colon",
                                value: char
                            });
                        }
                        break;

                    case "(":
                        if (currentToken) {
                            currentToken.value += char;
                        } else {
                            parseLexedValueToToken();
                            tokens.push({
                                type: "left-parentheses",
                                value: char
                            });
                        }
                        break;

                    case ")":
                        if (currentToken) {
                            currentToken.value += char;
                        } else {
                            parseLexedValueToToken();
                            tokens.push({
                                type: "right-parentheses",
                                value: char
                            });
                        }
                        break;

                    case "[":
                        if (currentToken) {
                            currentToken.value += char;
                        } else {
                            parseLexedValueToToken();
                            tokens.push({
                                type: "left-bracket",
                                value: char
                            });
                        }
                        break;

                    case "]":
                        if (currentToken) {
                            currentToken.value += char;
                        } else {
                            parseLexedValueToToken();
                            tokens.push({
                                type: "right-bracket",
                                value: char
                            });
                        }
                        break;

                    case ",":
                        if (currentToken) {
                            currentToken.value += char;
                        } else {
                            parseLexedValueToToken();
                            tokens.push({
                                type: "comma",
                                value: char
                            });
                        }
                        break;

                    case "\n":
                        if (currentToken) {
                            switch (currentToken.type) {
                                case "string":
                                case "comment":
                                    tokens.push(currentToken)
                                    currentToken = null;
                                    break;
                                default:
                            }
                        } else {
                            parseLexedValueToToken();
                            lexedValue = "";
                        }
                        tokens.push({
                            type: "newline",
                            value: "\n"
                        });
                        break;

                    case ";":
                        if (currentToken) {
                            currentToken.value += char;
                        } else {
                            parseLexedValueToToken();
                            tokens.push({
                                type: "semicolon",
                                value: char
                            });
                        }
                        break;

                    default:
                        if (currentToken) {
                            currentToken.value += char;
                        } else {
                            lexedValue += char
                        }

                        break;
                }
            }

            /* Lexing the input codes */
            inputString.characterize(lex);

            /* Rest of the lexed value or token which is unfinished */
            parseLexedValueToToken();

            if (currentToken) tokens.push(currentToken)

            /* Secondary Parse to Match Some Patterns */
            var isFunctionArgumentScope = false;
            var tokenCount = tokens.length;
            for (var i = 0; i < tokenCount; i++) {
                var token = tokens[i];
                if (token.type === "keyword" && (token.value === "def" || token.value === "class")) {
                    var peekToken = tokens[i + 2]
                    if (peekToken && peekToken.type === "default") peekToken.type = "function-name";
                } else if (token.type === "default" && isFunctionArgumentScope) {
                    token.type = "argument";
                } else if (token.type === "left-parentheses") {
                    var peekToken = tokens[i - 1]
                    if (peekToken && peekToken.type === "function-name") isFunctionArgumentScope = true;
                } else if (token.type === "right-parentheses") {
                    isFunctionArgumentScope = false;
                }
            }

            return tokens
        }
    }
})();
