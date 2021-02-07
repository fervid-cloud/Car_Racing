
const customAlert = (function () {

    let currentFileName = "utility"

    currentFileName = currentFileName.split(".")[0]; // in case I put utility.js in hurry
    const requestQueue = new Queue();


    let primaryElement = null, popupTracker = null, closeTextTracker = null;

    onHTMLLoad()

    function onHTMLLoad() {
        document.addEventListener("DOMContentLoaded", () => {
        intializationAfterDomIsLoaded()();
        // setTimeout(intializationAfterDomIsLoaded());
    }


    function intializationAfterDomIsLoaded() {
        return () => {

            initialization();

            primaryElement = document.querySelector(".textContent");

            popupTracker = document.querySelector(".popup");


            closeTextTracker = document.querySelector(".contentManager .close");

            console.debug("------------------closeTextTracer is : ", closeTextTracker)

            document.addEventListener("click", (event) => {
                console.debug("------------utility detected the click");
                const { target } = event;
                console.debug(target);
                console.debug("----------------------running in utility");
                if (!target.customMatches(".box")) {
                    console.debug("target matched other than content class");
                    if (popupTracker.classList.contains("active")) {
                        console.debug("toggling");
                        togglePop(popupTracker);
                        updateRequest();
                        return;
                    }
                }

                /*  if (target.customMatches("#button")) {

                      console.debug("target matched button");

                      togglePop(popupTracker);
                  }*/

                if (target.customMatches(".contentManager .close")) {

                    console.debug("close button clicked");

                    togglePop(popupTracker);
                    updateRequest();
                    return;
                }
            });
        }
    }

    function togglePop(popupTracker) {

        popupTracker.classList.toggle("active");
        console.debug(popupTracker.classList.toString());
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
        console.debug("-----------------------------------------appending file", cssFile);
        // linkElement.setAttribute("href", `./utility/${cssFile}`);
        documentFragmentElement.appendChild(linkElement);

        htmlHeadElement.insertBefore(documentFragmentElement, null);
        cssElement = htmlHeadElement.children[0];
        console.debug("appended css element is: ", cssElement);
        console.debug("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!after appending");
        console.debug(htmlHeadElement);
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
            console.debug("-----------------------------------------appending file", cssFile);

            const linkElement = document.createElement("link");
            linkElement.setAttribute("rel", "stylesheet");
            linkElement.setAttribute("type", "text/css");
            linkElement.setAttribute("href", `./utility/${cssFile}`);

            documentFragmentElement.appendChild(linkElement);
        });

        // templateElement.appendChild(documentFragmentElement);
    //    console.debug("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!template element");
    //     console.debug(templateElement);

    //     console.debug("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!content of template element");
    //     console.debug(templateElement.content);
    //     console.debug("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!last element of head");
    //     console.debug(htmlHeadElement.lastElementChild);
    //     console.debug("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!before appending");
    //     console.debug(htmlHeadElement);

        //   TODO check why template.content is not working here as it also returns documentFragment =

        htmlHeadElement.insertBefore(documentFragmentElement, null);
        console.debug("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!after appending");
        console.debug(htmlHeadElement);
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

        initializeCSSFile();// css file of same name is inserted in the head tag

        const htmlBodyElement = document.querySelector('body');
        const requiredElement = createRequiredElement();
        const tempElement = document.createElement("template");
        tempElement.innerHTML = requiredElement;
        htmlBodyElement.insertBefore(tempElement.content, htmlBodyElement.firstElementChild);
    }





    function render(element, htmlView) {
        element.innerHTML = htmlView;
    }


    return requestEntryManager;


    function updateRequest() {
        requestQueue.remove();
        console.debug("updating queue");
        if (requestQueue.isEmpty()) {
            console.debug("no further request is there");
            return;
        }
        console.debug("serving further request");
        setTimeout(() => {
            console.debug("set timeout is called");
            displayPopUp(requestQueue.peek());
        }, 300);

    }


    function requestEntryManager (textContent) {
        console.debug("adding to the queue");
        requestQueue.add(textContent);
        if(requestQueue.size() === 1) {
            console.debug("queue is empty, so executing");
            displayPopUp(requestQueue.peek());
        }
    }



    function displayPopUp(textContent) {
        console.debug("------- this time text content is: ", textContent);

        if (primaryElement === null) {
            alert("please wait for the page to be completely loaded")
        } else {
            console.debug("rendering in text Content");
            render(primaryElement, textContent);
            togglePop(popupTracker);
            console.debug("popped");
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
