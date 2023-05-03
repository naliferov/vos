async () => {
    return class Input {
        constructor() { this.win = window; }
        disableHandlers() {
            this.win.onkeydown = null;
            this.win.onkeyup = null;
            this.win.onclick = null;
            this.win.ondblclick = null;
            this.win.onpointermove = null;
            this.win.onpointerup = null;
            this.win.onresize = null;
            this.win.oncontextmenu = null;
        }
        onKeyDown(fn) { this.win.onkeydown = fn; }
        onKeyUp(fn) { this.win.onkeyup = fn; }
        onClick(fn) { this.win.onclick = fn; }
        onDblClick(fn) { this.win.ondblclick = fn; }
        onMouseMove(fn) { this.win.onpointermove = fn; }
        onMouseUp(fn) { this.win.onpointerup = fn; }
        onResize(f) { this.win.onresize = f; }
        onContextMenu(f) { this.win.oncontextmenu = f; }
    }
    
}