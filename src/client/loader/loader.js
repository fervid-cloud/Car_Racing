const currentFileName = "loader";
let cssElement;
let currentScriptElement;
/**
any tags have access to any element which appears before them in the HTML(i.e parsed by browser);
 */
let headElement = document.querySelector("head");

/* while (!cssElement) {
    console.log("searching headElement");
    // headElement = document.querySelector("head");
    const cssFileNames = ["loader.css"];
    initializeCSSFile();
} */

const currentFilePath = getcurrentFilePathWithNameWithoutExtension();
const imagePath = currentFilePath + ".svg";
console.log("image path is : ", imagePath);


function createLoadingElement() {
    const loadingHtmlElement = `<section class="screenLoader">
                                    <section class="loaderWrapper">
                                        <img src="${imagePath}" alt="loading...">
                                    </section>
                                </section>`;
    return loadingHtmlElement;
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


window.onbeforeunload = () => {
    // document.body.remove();
}


window.onload = () => {
    setTimeout(() => {
        const childElements = document.querySelector("head").children;
        console.log("current loading css element is : ", childElements[0]);
        childElements[0].remove(); // removing the link element (used for refering to css)

        document.querySelector(".screenLoader")?.remove();
        console.log("current loading script element is : ", childElements[0]);
        // childElements[0].remove(); // removing the js file after css file refering link element is removed
    }, 1500);
}


//currently not in use, useful when body element is empty by default(not already static content), i.e it will
//work only if html element are added to body element dynamically
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


function initialization() {
    const htmlBodyElement = document.querySelector('body');
    const requiredElement = createLoadingElement();
    const tempElement = document.createElement("template");
    tempElement.innerHTML = requiredElement;
    htmlBodyElement.insertBefore(tempElement.content, htmlBodyElement.firstElementChild);
}


document.addEventListener("DOMContentLoaded", initialization);