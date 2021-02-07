
const customAlert = (function () {

    let currentFileName = "utility"

    currentFileName = currentFileName.split(".")[0]; // in case I put utility.js in hurry
    const requestQueue = new Queue();

    let primaryElement = null, popupTracker = null;

    onHTMLLoad()

    function onHTMLLoad() {
        document.addEventListener("DOMContentLoaded", () => {
            // intializationAfterDomIsLoaded()();
            setTimeout(intializationAfterDomIsLoaded(), 2000);
        });
    }


    function intializationAfterDomIsLoaded() {
        return () => {

            initialization();

            primaryElement = document.querySelector(".textContent");

            popupTracker = document.querySelector(".popup");

            document.addEventListener("click", (event) => {
                console.log("------------utility detected the click");
                const { target } = event;
                console.log(target);
                console.log("----------------------running in utility");
                if (!target.customMatches(".box")) {
                    console.log("target matched other than content class");
                    if (popupTracker.classList.contains("active")) {
                        console.log("toggling");
                        togglePop(popupTracker);
                        updateRequest();
                        return;
                    }
                }

                /*  if (target.customMatches("#button")) {
                      console.log("target matched button");
                      togglePop(popupTracker);
                  }*/

                if (target.customMatches(".contentManager .close")) {
                    console.log("close button clicked");
                    togglePop(popupTracker);
                    updateRequest();
                    return;
                }
            });
        }
    }

    function togglePop(popupTracker) {

        popupTracker.classList.toggle("active");
        console.log(popupTracker.classList.toString());
    }


    Element.prototype.customMatches = function (elementSelector) {

        let element = this;

        while (element) {
            if (element.matches(elementSelector)) {
                break;
            }
            element = element.parentElement;
        }
        return element;
    }


    function createRequiredElement() {

        //language=HTML
        return `
            <div class="popup">
                <div class="overlay">
                    <div class="boxWrapper">
                        <div class="box">
                            <div class="contentManager">
                                <div class="textContainer">
                                    <div class="textContent">
                                    </div>
                                </div>
                                <div class="close">Close</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }


    /* function updateExtension(filename, expectedExtension) {

        if(!filename) {
            throw new Error("filename is undefined passed to updateExtension");
        }

        const requiredIndex = filename.lastIndexOf(".");

        if(requiredIndex === 0) {
            throw new Error("no filename specified");
        }

        if(requiredIndex && requiredIndex < filename.length - 1) {
            const actualExtension = filename.substring(requiredIndex + 1, filename.length);
            if(actualExtension === expectedExtension) {
                return filename;
            }
        }

        return `${filename}.${expectedExtension}`;
    } */

    function initializeCSSFile() {
        const htmlHeadElement = document.querySelector("head");
        const documentFragmentElement = document.createDocumentFragment();
        const linkElement = document.createElement("link");
        linkElement.setAttribute("rel", "stylesheet");
        linkElement.setAttribute("type", "text/css");
        const cssFile = `${getcurrentFilePathWithNameWithoutExtension()}.css`;
        linkElement.setAttribute("href", cssFile);
        console.log("-----------------------------------------appending file", cssFile);
        // linkElement.setAttribute("href", `./utility/${cssFile}`);
        documentFragmentElement.appendChild(linkElement);

        htmlHeadElement.insertBefore(documentFragmentElement, null);
        cssElement = htmlHeadElement.children[0];
        console.log("appended css element is: ", cssElement);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!after appending");
        console.log(htmlHeadElement);
    }


    function getcurrentFilePathWithNameWithoutExtension() {
        // since it is loaded into the dom, it should be present, not that we are not taking last
        //element because it is observed that both dom parsing and this javascritp running happens parallely
        // so maybe when this function runs, a new dom element in the script has already been added
        // so if we try to get the last element, we may get wrong script elements, so for surity, we are doing this
        // beside Scripts can be deferred, async, modules, workers so taking just last element will be wrong in many scenario
        const scripts = document.getElementsByTagName("script");
        const n = scripts.length;
        for (let i = 0; i < n; ++i) {
            const path = scripts[i].src;
            const names = path.split("/");
            const nameOfFile = names[names.length - 1].split(".");
            if (nameOfFile[0] === currentFileName) {
                const extensionLength = nameOfFile[1].length;
                const nn = path.length;
                // substring(starting index inclusive, ending index exlusive)
                currentScriptElement = scripts[i];
                return path.substring(0, nn - (extensionLength + 1));
            }
        }
        throw new Error("current filename not found");
    }

/*     function initializeCSSFile (filenames) {
        const htmlHeadElement = document.querySelector("head");

        // const templateElement = document.createElement("template");
        const documentFragmentElement = document.createDocumentFragment();
        filenames.forEach((cssFilename) => {
            let cssFile = cssFilename;

            cssFile = updateExtension(cssFile, "css");
            console.log("-----------------------------------------appending file", cssFile);

            const linkElement = document.createElement("link");
            linkElement.setAttribute("rel", "stylesheet");
            linkElement.setAttribute("type", "text/css");
            linkElement.setAttribute("href", `./utility/${cssFile}`);

            documentFragmentElement.appendChild(linkElement);
        });

        // templateElement.appendChild(documentFragmentElement);
    //    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!template element");
    //     console.log(templateElement);

    //     console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!content of template element");
    //     console.log(templateElement.content);
    //     console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!last element of head");
    //     console.log(htmlHeadElement.lastElementChild);
    //     console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!before appending");
    //     console.log(htmlHeadElement);

        //   TODO check why template.content is not working here as it also returns documentFragment =

        htmlHeadElement.insertBefore(documentFragmentElement, null);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!after appending");
        console.log(htmlHeadElement);
    }
 */


    /**
     * The HTML Content Template (<template>) element is a mechanism for holding HTML that
     * is not to be rendered immediately when a page is loaded but may be instantiated subsequently
     * during runtime using JavaScript.
     *
     * the HTMLTemplateElement has a content property, which is a read-only DocumentFragment containing
     * the DOM subtree which the template represents. Note that directly using the value of the content
     * could lead to unexpected behavior, see Avoiding DocumentFragment pitfall
     * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template}
     * basically tempElement.content is a DocumentFragment instance, which holds all the original element and append it
     * to the required DOM element leaving itself out
     * @type {HTMLTemplateElement}
     */
    function initialization() {
        const htmlBodyElement = document.querySelector('body');
        const requiredElement = createRequiredElement();


        const tempElement = document.createElement("template");
        tempElement.innerHTML = requiredElement;

        // const cssFileNames = ["utility"];
        initializeCSSFile();// css file of same name is inserted in the head tag
        htmlBodyElement.insertBefore(tempElement.content, htmlBodyElement.firstElementChild);
    }





    function render(element, htmlView) {
        element.innerHTML = htmlView;
    }


    return requestEntryManager;


    function updateRequest() {
        requestQueue.remove();
        console.log("updating queue");
        if (requestQueue.isEmpty()) {
            console.log("no further request is there");
            return;
        }
        console.log("serving further request");
        setTimeout(() => {
            console.log("set timeout is called");
            displayPopUp(requestQueue.peek());
        }, 300);

    }


    function requestEntryManager (textContent) {
        console.log("adding to the queue");
        requestQueue.add(textContent);
        if(requestQueue.size() === 1) {
            console.log("queue is empty, so executing");
            displayPopUp(requestQueue.peek());
        }
    }



    function displayPopUp(textContent) {
        console.log("------- this time text content is: ", textContent);

        if (primaryElement === null) {
            alert("please wait for the page to be completely loaded")
        } else {
            console.log("rendering in text Content");
            render(primaryElement, textContent);
            togglePop(popupTracker);
            console.log("popped");
        }
    }

})();


function Queue() {
    // way to make a private variable as "this" is not used for this variable in this constructor function, let , var also can be used
    const stack1 = [];
    const stack2 = [];

    this.add = function(value) {
        stack1.push(value);
    }

    this.remove = function() {
        if(stack2.length === 0) {

            if(stack1.length === 0) {
                throw new Error("Queue is alreay empty");
            }

            while(stack1.length > 0) {
                stack2.push(stack1.pop());
            }
        }

        return stack2.pop();
    }

    this.peek = function() {
        if(stack2.length === 0) {

            if(stack1.length === 0) {
                return null;
            }

            while(stack1.length > 0) {
                stack2.push(stack1.pop());
            }
        }

        return stack2[stack2.length - 1];
    }

    this.size = function() {
        return stack1.length + stack2.length;
    }

    this.isEmpty = function() {
        return this.size() === 0;
    }

}
