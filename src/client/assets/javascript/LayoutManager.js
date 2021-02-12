
class LayOutManager {

    opts = {
        bigPercentage : 0.75
    }

    layoutContainer;
    bigContainer;
    smallContainer
    readyStatus = false;

    isReady() {
        return this.readyStatus;
    }

    initialize() {
        this.layoutContainer = document.querySelector("#display_panel");
        this.bigContainer = document.querySelector("#leaderBoard");
        this.smallContainer = document.querySelector("#accelerate");

        this.readyStatus = true;
/*         console.debug("The layoutContainer is : ", this.layoutContainer);
        console.debug("The bigContainer is : ", this.bigContainer);
        console.debug("The smallContainer is : ", this.smallContainer); */
    }

    constructor() {

    }


    updateLayout() {
        this.arrangeBigAndSmall();
    }


    arrangeBigAndSmall() {

        const HEIGHT =
            this.getHeight(this.layoutContainer) -
            this.getCSSNumber(this.layoutContainer, 'borderTop') -
            this.getCSSNumber(this.layoutContainer, 'borderBottom');
        const WIDTH =
            this.getWidth(this.layoutContainer) -
            this.getCSSNumber(this.layoutContainer, 'borderLeft') -
            this.getCSSNumber(this.layoutContainer, 'borderRight');
        const availableRatio = HEIGHT / WIDTH;

        let offsetLeft = 0;
        let offsetTop = 0;
        let bigOffsetTop = 0;
        let bigOffsetLeft = 0;
        let bigWidth, bigHeight;

        // console.debug("The available ratio is : ", availableRatio);

        if (availableRatio > 3/4) {
            // We are tall, going to take up the whole width and arrange small
            // guys at the bottom
            bigWidth = WIDTH;
            bigHeight = Math.floor(HEIGHT * this.opts.bigPercentage);
            offsetTop = bigHeight;
            // bigOffsetTop = HEIGHT - offsetTop;
        } else {
            // We are wide, going to take up the whole height and arrange the small
            // guys on the right
            bigHeight = HEIGHT;
            bigWidth = Math.floor(WIDTH * this.opts.bigPercentage);
            offsetLeft = bigWidth;
            // bigOffsetLeft = WIDTH - offsetLeft;
        }

        this.updateElement(this.bigContainer, bigOffsetTop, bigOffsetLeft, bigWidth, bigHeight);
        this.updateElement(this.smallContainer, offsetTop, offsetLeft, WIDTH - offsetLeft, HEIGHT - offsetTop);
    }


    updateElement(htmlElement, offsetTop, offsetLeft, width, height) {
        htmlElement.style.top = offsetTop + 'px';
        htmlElement.style.left = offsetLeft + 'px';
        htmlElement.style.width = width + 'px';
        htmlElement.style.height = height + 'px';
    }


    getHeight(elem) {
        const heightStr = window.getComputedStyle(elem)['height'];
        return heightStr ? parseInt(heightStr, 10) : 0;
    }


    getWidth(elem) {
        const widthStr = window.getComputedStyle(elem)['width'];
        return widthStr ? parseInt(widthStr, 10) : 0;
    }


    getCSSNumber(elem, prop) {
        const cssStr = window.getComputedStyle(elem)[prop];
        return cssStr ? parseInt(cssStr, 10) : 0;
    }


    getScrollBarWidth() {

        // Creating invisible container
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll'; // forcing scrollbar to appear
        document.body.appendChild(outer);

        // Creating inner element and placing it in the container
        const inner = document.createElement('div');
        outer.appendChild(inner);

        // Calculating difference between container's full width and the child width
        const scrollBarWidth = (outer.offsetWidth - inner.offsetWidth);

        // Removing temporary elements from the DOM
        outer.parentNode.removeChild(outer);

        return scrollBarWidth;

    }

}

const layoutManager = new LayOutManager();
