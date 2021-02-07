
let fileName = "loader";
fileName = fileName.split(".")[0];
let bothCssAndJsElement = [];
function removeItself() {
    const childrens = document.head.children;
    let counter = 2;
    let n = childrens.length;
    for (let i = 0; i < n; ++i) {
        console.debug("current element is : ", childrens[i]);
        const pathSource = childrens[i].href || childrens[i].src;
        if (!pathSource) {
            continue;
        }
        const paths = pathSource.split("/");
        const nn = paths.length;
        const currentFileName = paths[nn - 1].split(".")[0];
        if (fileName == currentFileName) {
            bothCssAndJsElement.push(childrens[i]);
            console.debug("removing");
            --counter;
            if (counter == 0) {
                break;
            }
        }
    }

    let nn = bothCssAndJsElement.length;
    for (let i = 0; i < nn; ++i) {
        bothCssAndJsElement[i].remove();
    }
}

window.onload = () => {
    setTimeout(() => {
        document.querySelector(".screenLoader")?.remove();
        removeItself();
    }, 2000);
}
