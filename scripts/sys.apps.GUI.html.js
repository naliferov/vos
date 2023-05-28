async () => {

    return `

<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>ra</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>">
    <style>
        :root {
            --bg-color: white;
            --keyword-color: #0033B3;
            --name-color: #248F8F;
            --op-color: black;
            --string-color: #067D17;
            --number-color: #1750EB;
            --prop-name-color: #971796;
            --function-color: #A77C43;
            --bracket-color: black;
            --standart-line-height: 1.55em;
            --shift: 1.2em;
        }
        :root .prose {
            --tw-prose-body: hsla(var(--bc)/.8);
            --tw-prose-headings: hsl(var(--bc));
            --tw-prose-lead: hsl(var(--bc));
            --tw-prose-links: hsl(var(--bc));
            --tw-prose-bold: hsl(var(--bc));
            --tw-prose-counters: hsl(var(--bc));
            --tw-prose-bullets: hsla(var(--bc)/.5);
            --tw-prose-hr: hsla(var(--bc)/.2);
            --tw-prose-quotes: hsl(var(--bc));
            --tw-prose-quote-borders: hsla(var(--bc)/.2);
            --tw-prose-captions: hsla(var(--bc)/.5);
            --tw-prose-code: hsl(var(--bc));
            --tw-prose-pre-code: hsl(var(--nc));
            --tw-prose-pre-bg: hsl(var(--n));
            --tw-prose-th-borders: hsla(var(--bc)/.5);
            --tw-prose-td-borders: hsla(var(--bc)/.2)
        }
        [data-theme=light] {
            color-scheme: light;
            --bg-color: hsl(var(--b2, var(--b1)));
            --pf: 258.89 94.378% 40.941%;
            --sf: 314 100% 37.647%;
            --af: 174 60% 40.784%;
            --nf: 219 14.085% 22.275%;
            --in: 198 93% 60%;
            --su: 158 64% 52%;
            --wa: 43 96% 56%;
            --er: 0 91% 71%;
            --inc: 198 100% 12%;
            --suc: 158 100% 10%;
            --wac: 43 100% 11%;
            --erc: 0 100% 14%;
            --rounded-box: 1rem;
            --rounded-btn: .5rem;
            --rounded-badge: 1.9rem;
            --animation-btn: .25s;
            --animation-input: .2s;
            --btn-text-case: uppercase;
            --btn-focus-scale: .95;
            --border-btn: 1px;
            --tab-border: 1px;
            --tab-radius: .5rem;
            --p: 258.89 94.378% 51.176%;
            --pc: 0 0% 100%;
            --s: 314 100% 47.059%;
            --sc: 0 0% 100%;
            --a: 174 60% 50.98%;
            --ac: 174.71 43.59% 15.294%;
            --n: 219 14.085% 27.843%;
            --nc: 0 0% 100%;
            --b1: 0 0% 100%;
            --b2: 0 0% 94.902%;
            --b3: 180 1.9608% 90%;
            --bc: 215 27.907% 16.863%;
        }
        html { overflow: hidden; }
        body {
            overflow: hidden;
            margin: 0;
            position: relative;
            color: hsl(var(--bc));
            font-family: Helvetica, Tahoma, Arial, sans-serif;
            font-size: 15px;
            /* background: var(--bg-color); */
            -webkit-text-size-adjust: 100%;
        }
        .popup {
            position: absolute;
            opacity: 0.97;
            z-index: 5;
            box-shadow: rgba(0, 0, 0, 0.50) 0px 2px 8px;
        }
        .popup .btn.contextMenu {
            color: hsl(var(--bc));
            padding-right: 30px;
        }
        /*.pageSign {*/
        /*    display: flex;*/
        /*    justify-content: center;*/
        /*    justify-self: center;*/
        /*}*/
        /*.signContainer {*/
        /*    display: flex;*/
        /*    justify-content: center;*/
        /*    width: 15em;*/
        /*    margin-top: 5em;*/
        /*    padding: 25px;*/
        /*    background: #dcdde1;*/
        /*}*/
        /*.signBlock input { width: 15em; }*/

        .runBtn {
            width: 1.3em;
            height: 0.8em;
            background: rgba(18,199,5,0.99);
        }
        .dataBrowser {
            background: #ededed;
            padding: 0 7px;
            height: 100%;
            overflow: scroll;
        }
        .dataBrowser > .node > .nodeContainer > .openClose { display: none; }
        .nodeContainer .quote { color: #AA1011; }

        .authApp {
            background: #ededed;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: start;
            gap: 0.5em;
            padding-top: 1em;
        }

        .dataValue.string {
            min-height: 10px;
            min-width: 2px;
        }

        .appFrame {
            position: absolute;
            top: 30px;
            box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2);
            overflow: hidden;
        }

        /* this create small glitches when after start and drag window */
        .appFrame.drag {
            -webkit-touch-callout: none; /* iOS Safari */
            -webkit-user-select: none;   /* Chrome/Safari/Opera */
            -khtml-user-select: none;    /* Konqueror */
            -moz-user-select: none;      /* Firefox */
            -ms-user-select: none;       /* Internet Explorer/Edge*/
            user-select: none;
        }
        .appTopBar {
            width: 100%;
            display: flex;
            align-items: center;
            padding: 5px 0;
            background: lightgray;
            cursor: pointer;
            box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2);
        }
        .appFrame.drag .appTopBar {
            cursor: move;
        }
        .appTitle {
            font-weight: bold;
            white-space: nowrap;
            margin-left: 5px;
        }
        .resizer {
            position: absolute;
            min-width: 1em;
            min-height: 1em;
        }
        .resizeTop {
            left: 0.5em;
            right: 0.5em;
            top: -0.5em;
            cursor: ns-resize;
        }
        .resizeBottom {
            left: 0.5em;
            right: 0.5em;
            bottom: -0.5em;
            cursor: ns-resize;
        }
        .resizeLeft {
            top: 0.5em;
            bottom: 0.5em;
            left: -0.5em;
            cursor: ew-resize;
        }
        .resizeRight {
            top: 0.5em;
            bottom: 0.5em;
            right: -0.5em;
            cursor: ew-resize;
        }
        .resizeTopLeft {
            top: -0.5em;
            left: -0.5em;
            cursor: nwse-resize;
        }
        .resizeTopRight {
            top: -0.5em;
            right: -0.5em;
            cursor: nesw-resize;
        }
        .resizeBottomLeft {
            bottom: -0.5em;
            left: -0.5em;
            cursor: nesw-resize;
        }
        .resizeBottomRight {
            bottom: -0.5em;
            right: -0.5em;
            cursor: nwse-resize;
        }

        .openClose {
            display: flex;
            align-items: center;
            margin-right: 5px;
            line-height: 10px;
            color: #656565;
            cursor: pointer;
        }
        .openClose > .openCloseArrow {
            width: 10px;
            height: 10px;
            background-image: url("data:image/svg+xml,%3Csvg fill='%23000000' width='100%' height='100%' version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 407.36 407.36' xml:space='preserve'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpolygon points='112.814,0 91.566,21.178 273.512,203.718 91.566,386.258 112.814,407.436 315.869,203.718 '%3E%3C/polygon%3E%3C/g%3E%3C/svg%3E");
            background-repeat: no-repeat;
        }
        .openClose.opened { transform: rotate(90deg); }
        .opsBtn {
            cursor: pointer;
            color: black;
        }

        .tabs {
            display: flex;
            min-height: 30px;
            background: var(--bg-color);
            border-bottom: 1px solid lightgray;
        }
        .tab {
            display: flex;
            justify-content: space-between;
            align-items: center;
            column-gap: 5px;
            padding: 5px 10px;
            cursor: pointer;
        }
        .tab.active { background: #FFFFFF; }
        .tab.error { background: lightcoral; }
        .tabHeader {
            color: black;
            cursor: pointer;
            padding: 5px 5px;
            background: rgb(236, 236, 236);
            font-weight: bold;
            gap: 5px;
        }
        .tabHeader.active {
            background: white;
            color: black;
        }
        .tabCloseBtn {
            margin-left: 5px;
            width: 0.8em;
            height: 0.8em;
            border-radius: 100px;
            background: rgb(221 131 131 / 99%);
        }

        .terminal {
            height: 100%;
            background: hsl(var(--b2));
            overflow: scroll;
            -webkit-overflow-scrolling: touch;
        }
        .terminal .scrollBlock {
            white-space: nowrap;
        }
        .terminal .consoleCmd {
            outline: none;
            border: 1px solid #969696;
            color: black;
        }
        .terminal pre {
            margin: 0;
            white-space: -moz-pre-wrap; /* Mozilla, supported since 1999 */
            white-space: -pre-wrap; /* Opera */
            white-space: -o-pre-wrap; /* Opera */
            white-space: pre-wrap; /* CSS3 - Text module (Candidate Recommendation) http://www.w3.org/TR/css3-text/#white-space */
            word-wrap: break-word; /* IE 5.5+ */
        }
        .terminal .consoleHeader {
            display: flex;
            position: sticky;
            top: 0;
            background: #B3E5BE;
            gap: 10px;
        }
        [contenteditable] {outline: 0; }
        [contenteditable]:focus {}

        .shift { margin-left: calc( var(--shift) * 1 ); }
        .shift1 { margin-left: calc( var(--shift) * 1 ); }
        .shift2 { margin-left: calc( var(--shift) * 2 ); }
        .shift3 { margin-left: calc( var(--shift) * 3 ); }
        .shift4 { margin-left: calc( var(--shift) * 4 ); }
        .shift5 { margin-left: calc( var(--shift) * 5 ); }
        .shift6 { margin-left: calc( var(--shift) * 6 ); }
        .shift7 { margin-left: calc( var(--shift) * 7 ); }
        .shift8 { margin-left: calc( var(--shift) * 8 ); }
        .shift9 { margin-left: calc( var(--shift) * 9 ); }
        .shift10 { margin-left: calc( var(--shift) * 10 ); }

        .monacoEditor {
            /*position: absolute;*/
            height: 100%;
            font-family: 'JetBrains Mono', sans-serif;
            line-height: 1.55em;
            font-size: 13.7px;
            /*min-height: 100vh;*/
            /*min-width: 50vh;*/
        }
        /*.monacoEditor * { font-variant-ligatures : none; }*/

        input {
            font-family: 'Roboto', sans-serif;
            font-size: 15px;
        }
        input.scriptName {
            border: 1px solid black;
            color: black;
            padding: 3.5px;
            background: rgb(170 191 222);
        }

        .hidden { display: none !important; }
        .visibilityHidden { visibility: hidden; }
        .grid { display: grid; }
        .flex { display: flex; }
        .inlineBlock { display: inline-block; }
        .gap { gap: 10px; }
        .alignCenter { align-items: center; }
        .margin10 { margin-left: 10px; }
        .cursorPointer { cursor: pointer; }

        .btn {
            padding: 2px 4px;
            --tw-bg-opacity: 1;
            background: hsl(var(--n)/var(--tw-bg-opacity));
            --tw-text-opacity: 1;
            color: hsl(var(--nc)/var(--tw-text-opacity));
            cursor: pointer;
            text-decoration: none;
            font-weight: normal;
            white-space: nowrap;
        }
        .btn.white {
            background: white;
        }
        .btn:active {
            transform: scale(var(--btn-focus-scale,.95));
        }
        .btn.hoverGray:hover {
            background: #d9d9d9;
        }
        .burger-btn {
            position: absolute;
            display: flex;
            flex-direction: column;
            width: 21px;
            height: 19px;
            gap: 3px;
            border: none;
            cursor: pointer;
        }
        .burger-line {
            height: 3px;
            background: #000;
        }
        .btnsBar {
            display: flex;
            align-items: center;
            background: #F3F3F3;
        }
        .rotate180 { transform: rotate(180deg); }
    </style>
</head>
<body>


<div id="app">

</div>
<script type="text/javascript" src="/node_modules/monaco-editor/min/vs/loader.js"></script>
<script>${s['js']}</script>
</body>
</html>
`

}