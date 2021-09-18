let titlebar: HTMLDivElement;
let dragregion: HTMLDivElement;
let menubar: HTMLDivElement;
let title: HTMLDivElement;
let controls: HTMLDivElement;
let minimizeWindow: HTMLDivElement;
let maximizeWindow: HTMLDivElement;
let restoreWindow: HTMLDivElement;
let closeWindow: HTMLDivElement;
let menu: Record<string,any>;
let menuSize = 0;
let menuCondensed = false;
let forceCondensed = false;
let subMenuOpened = false;
let activeMenu: Array<number> = [-1];

export default class Titlebar {
    constructor(TitleBarOptions?: Record<string,any>) {
        // Create titlebar
        titlebar = document.createElement("div");
        titlebar.id = "electron-titlebar";

        // Create drag region
        dragregion = document.createElement("div");
        dragregion.id = "dragregion";
        titlebar.append(dragregion);

        // Create menubar
        menubar = document.createElement("div");
        menubar.id = "menubar";
        titlebar.append(menubar);

        // Create title
        title = document.createElement("div");
        title.id = "title";
        this.updateTitle(window.document.title);
        titlebar.append(title);

        // Create controls
        controls = document.createElement("div");
        controls.id = "controls";
        minimizeWindow = document.createElement("div");
        minimizeWindow.id = "minimize";
        minimizeWindow.classList.add("button")
        minimizeWindow.innerHTML='<svg x="0px" y="0px" viewBox="0 0 10.2 1"><rect x="0" y="50%" width="10.2" height="1" /></svg>';
        controls.append(minimizeWindow);
        maximizeWindow = document.createElement("div");
        maximizeWindow.id = "maximize";
        maximizeWindow.classList.add("button")
        maximizeWindow.innerHTML='<svg viewBox="0 0 10 10"><path d="M0,0v10h10V0H0z M9,9H1V1h8V9z" /></svg>';
        controls.append(maximizeWindow);
        restoreWindow = document.createElement("div");
        restoreWindow.id = "restore";
        restoreWindow.classList.add("button")
        restoreWindow.innerHTML='<svg viewBox="0 0 10.2 10.1"><path d="M2.1,0v2H0v8.1h8.2v-2h2V0H2.1z M7.2,9.2H1.1V3h6.1V9.2z M9.2,7.1h-1V2H3.1V1h6.1V7.1z" /></svg>';
        controls.append(restoreWindow);
        closeWindow = document.createElement("div");
        closeWindow.id = "close";
        closeWindow.classList.add("button")
        closeWindow.innerHTML='<svg viewBox="0 0 10 10"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1" /></svg>';
        controls.append(closeWindow);
        titlebar.append(controls);

        // Insert style
        const style = document.createElement('style');
        document.head.appendChild(style);
        style.appendChild(document.createTextNode(css));

        // Create container
        const container = document.createElement("div");
        container.id = "electron-container";
        document.body.append(container);

        // Move app inside a container
        container.appendChild(document.getElementById('app'));

        // Insert titlebar
        document.body.insertBefore(titlebar, container);

        // Apply options
        if(TitleBarOptions){
            if(TitleBarOptions.backgroundColor){
                this.updateBackground(TitleBarOptions.backgroundColor);
            }
            if(TitleBarOptions.title){
                this.updateTitle(TitleBarOptions.title);
            }
            if(TitleBarOptions.onMinimize){
                minimizeWindow.onclick = TitleBarOptions.onMinimize;
            }
            if(TitleBarOptions.onMaximize){
                maximizeWindow.onclick = TitleBarOptions.onMaximize;
                restoreWindow.onclick = TitleBarOptions.onMaximize;
            }
            if(TitleBarOptions.onClose){
                closeWindow.onclick = TitleBarOptions.onClose;
            }
            if(TitleBarOptions.isMaximized){
                titlebar.classList.toggle("maximized", TitleBarOptions.isMaximized());
            }
            if(TitleBarOptions.condensed){
                menuCondensed=TitleBarOptions.condensed;
                forceCondensed=TitleBarOptions.condensed
            }
            if(TitleBarOptions.menu){
                this.updateMenu(TitleBarOptions.menu);
            }
        }

        // Event listeners
        window.addEventListener("blur", () => {
            titlebar.classList.add("inactive");
            closeSubMenu();
        })

        window.addEventListener("focus", () => {
            titlebar.classList.remove("inactive");
        })

        window.addEventListener("resize", () => {
            titlebar.classList.toggle("maximized", (TitleBarOptions && TitleBarOptions.isMaximized()));
            updateMenuSize();
        })

        window.addEventListener("click", () => {
            closeSubMenu();
        })
    }

    updateBackground(color: string): void {
        const brightness = hexToRgb(color).reduce((a, b) => a + b, 0);
        titlebar.classList.toggle("dark",brightness<=382);
        titlebar.style.backgroundColor = color;
    }

    updateTitle(newTitle: string): void {
        title.innerText = newTitle;
    }

    updateMenu(newMenu: Record<string,any>): void {
        menu = newMenu;
        buildMenu(menuCondensed);
        updateMenuSize();
    }
}

// Check if the menu need to be condensed
const updateMenuSize = () => {
    if((menuSize + title.clientWidth + controls.clientWidth + 1)>titlebar.clientWidth){
        if(!menuCondensed){
            buildMenu(true);
        }
    }
    else {
        if(menuCondensed && !forceCondensed){
            buildMenu(false);
        }
    }
}

const buildMenu = (condensed: boolean=false): void => {
    menuCondensed=condensed;
    let menuItems: Array<HTMLDivElement>=[];
    if(!condensed){
        for (let i = 0; i < menu.items.length; i++) {
            menuItems.push(buildMenuItem(menu.items[i], i, menubar))
        }
    }
    else {
        const item = {
            role: 'mainMenu',
            type: 'submenu',
            submenu: {
                items:menu.items
            }
        }
        menuItems.push(buildMenuItem(item, 0, menubar))
    }

    menubar.innerHTML = "";
    menuItems.forEach((menuItem) => {
        menubar.append(menuItem);
    });
    if(!condensed){
        menuSize = menubar.clientWidth;
    }
}

const buildMenuItem = (menuItem: Record<string,any>, index: number, parent: HTMLDivElement, deep: number=0): HTMLDivElement => {
    const item = document.createElement("div");
    item.classList.add("button");
    if(menuItem.role=="mainMenu"){
        item.innerHTML = '<svg width="10" height="10" viewBox="0 0 384 384"><rect x="0" y="277.333" width="384" height="42.667"/><rect x="0" y="170.667" width="384" height="42.667"/><rect x="0" y="64" width="384" height="42.667"/></svg>'
    }
    if(menuItem.label){
        const label = document.createElement("div");
        label.classList.add("title");
        label.innerText = menuItem.label;
        item.append(label);
    }
    if(menuItem.accelerator){
        const accelerator = document.createElement("div");
        accelerator.classList.add("accelerator");
        accelerator.innerText = menuItem.accelerator.replace("CmdOrCtrl","Ctrl").replace("CommandOrControl","Control");
        item.append(accelerator);
    }
    switch (menuItem.type) {
        case "normal":
            item.onclick = (e) => {
                e.stopPropagation();
                closeSubMenu();
                menuItem.click();
            };
            item.onmouseenter = () => {
                closeSubMenu(parent, deep);
            }
            break;
        case "submenu":
            item.innerHTML += '<svg class="arrow" version="1.1" width="20px" height="20px" viewBox="0 0 24 24"><path d="M9.29,6.71L9.29,6.71c-0.39,0.39-0.39,1.02,0,1.41L13.17,12l-3.88,3.88c-0.39,0.39-0.39,1.02,0,1.41l0,0c0.39,0.39,1.02,0.39,1.41,0l4.59-4.59c0.39-0.39,0.39-1.02,0-1.41l-4.59-4.59C10.32,6.32,9.68,6.32,9.29,6.71z" /></svg>'

            item.onclick = (e) => {
                e.stopPropagation();
                if(deep==0){
                    if(subMenuOpened && activeMenu[deep]==index){
                        closeSubMenu(parent, deep);
                    }
                    else {
                        openSubMenu(menuItem.submenu, index, parent, deep);
                    }
                }
            };
            item.onmouseenter = () => {
                if(subMenuOpened){
                    openSubMenu(menuItem.submenu, index, parent, deep);
                }
            }
            item.onmouseleave = () => {
                if(subMenuOpened && parent!=menubar){
                    closeSubMenu(parent, deep)
                }
            }
            break;
        case "separator":
            item.classList.add("separator");
        default:
            break;
    }
    return item;
}

const openSubMenu = (submenu: Array<any>, index: number, parent: HTMLDivElement, deep: number): void => {
    if(deep==0 && activeMenu[deep]==index) return
    closeSubMenu(parent, deep);
    activeMenu[deep] = index;
    subMenuOpened = true;
    const menuItem = parent.children[index];
    const subMenu = buildSubMenu(submenu, deep+1);
    menuItem.classList.add("active");
    menuItem.appendChild(subMenu);
}

const closeSubMenu = (parent?: HTMLDivElement, deep: number=0) => {
    if(activeMenu[deep]>=0){
        const menuItem = parent ? parent.children[activeMenu[deep]] : menubar.children[activeMenu[deep]];
        if(menuItem){
            menuItem.classList.remove("active");
            menuItem.querySelector('.submenu')?.remove();
            if(deep===0){
                subMenuOpened=false;
            }
            activeMenu = activeMenu.slice(0, deep)
            activeMenu[deep]=-1;
        }
    }
    
}

const buildSubMenu = (submenu: Record<string,any>, deep: number): HTMLDivElement => {
    const subMenu = document.createElement("div");
    subMenu.classList.add("submenu");
    for (let i = 0; i < submenu.items.length; i++) {
        const menuItem = buildMenuItem(submenu.items[i], i, subMenu, deep)
        subMenu.append(menuItem);
    }
    return subMenu;
}

const hexToRgb = (hex: string): Array<number> =>
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        ,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16))

const css = `
#electron-container {
    position: relative;
    height: calc(100% - 30px);
}

#electron-titlebar #dragregion {
    top: 0;
    left: 0;
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-app-region: drag;
}

#electron-titlebar {
    font-family: Segoe WPC,Segoe UI,sans-serif;
    font-size: 13px;
    background-color: #fff;
    color: rgb(0, 0, 0);
    width: 100%;
    height: 30px;
    position:relative;
    user-select: none;
    display: flex;
    line-height: 30px;
    justify-content: left;
    align-items: center;
    flex-shrink: 0;
    overflow: visible;
}

#electron-titlebar.dark {
    color: rgb(204, 204, 204);
}

#electron-titlebar #menubar {
    height: 30px;
    display: flex;
    flex-shrink: 1;
    height: 30px;
    flex-wrap: nowrap;
    z-index: 2500;
}

#electron-titlebar #menubar .button {
    position: relative;
    align-items: center;
    box-sizing: border-box;
    padding: 0 8px;
    cursor: default;
    -webkit-app-region: no-drag;
    zoom: 1;
    white-space: nowrap;
    outline: 0;
}

#electron-titlebar #menubar .button:hover,
#electron-titlebar #menubar .button.active {
    background-color: rgba(0, 0, 0, 0.1);
}

#electron-titlebar.dark #menubar .button:hover,
#electron-titlebar.dark #menubar .button.active {
    background-color: rgba(255, 255, 255, 0.1);
}

#electron-titlebar #menubar .button .arrow,
#electron-titlebar #menubar .button.separator,
#electron-titlebar #menubar .button .accelerator {
    display:none;
}

#electron-titlebar #menubar .button .submenu {
    position:absolute;
    left: 0;
    opacity: 1;
	z-index: 2000;
    background-color: #dadada;
    padding:8px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,.4);
}

#electron-titlebar.dark #menubar .button .submenu {
    background-color: #252526;
}

#electron-titlebar #menubar .button .submenu .button:not(.separator) {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    position: relative;
    padding: 0px 28px;
    margin: 1px 0px;
    height: 23px;
    line-height: 23px;
}

#electron-titlebar #menubar .button .submenu .button .accelerator,
#electron-titlebar #menubar .button .submenu .button .title {
    display:inline-block;
}

#electron-titlebar #menubar .button .submenu .button .accelerator {
    padding-left:36px;
}

#electron-titlebar #menubar .button .submenu .button .arrow {
    position: absolute;
    display:block;
    right: 8px;
}

#electron-titlebar #menubar .button .submenu .button .title {
    margin-right:auto;
}

#electron-titlebar #menubar .button .submenu .button.separator {
    display: block;
    margin: 8px 10px;
    height: 1px;
    background-color: #000;
    pointer-events:none;
    opacity:.3;
}

#electron-titlebar.dark #menubar .button .submenu .button.separator {
    background-color: #fff;
}

#electron-titlebar #menubar .button .submenu .submenu {
    left: unset;
    right: 0px;
    transform: translateX(100%);
    top:-9px;
}

#electron-titlebar #title {
    flex: 0 1 auto;
    font-size: 12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-left: auto;
    margin-right: auto;
    zoom: 1;
}

#electron-titlebar.inactive #title,
#electron-titlebar.inactive #menubar .button:not(:hover) .title,
#electron-titlebar.inactive #menubar .button:not(:hover) .accelerator {
    opacity:.5;
}

#electron-titlebar #controls {
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    text-align: center;
    position: relative;
    z-index: 3000;
    -webkit-app-region: no-drag;
    height: 100%;
    width: 138px;
}

#electron-titlebar #controls .button {
    display: inline-block;
    line-height: 30px;
    width: 46px;
    height: 100%;
}

#electron-titlebar #controls .button:hover {
    background-color: hsla(0,0%,0%,.1);
}

#electron-titlebar.dark #controls .button:hover {
    background-color: hsla(0,0%,100%,.1);
}

#electron-titlebar #controls #close:hover {
    background-color: rgba(232,17,35,.9);
}

#electron-titlebar #controls .button:active {
    background-color: hsla(0,0%,0%,.2);
}

#electron-titlebar.dark #controls .button:active {
    background-color: hsla(0,0%,100%,.2);
}

#electron-titlebar:not(.maximized) #controls #restore {
    display:none;
}

#electron-titlebar.maximized #controls #maximize {
    display:none;
}

#electron-titlebar #controls .button svg {
    width: 10px;
    height: 10px;
}

#electron-titlebar .button svg > * {
	fill: rgb(0, 0, 0);
}

#electron-titlebar.dark .button svg > * {
	fill: rgb(204, 204, 204);
}

#electron-titlebar.inactive .button:not(:hover) svg > * {
	fill: rgba(0, 0, 0, 0.5);
}

#electron-titlebar.dark.inactive .button:not(:hover) svg > * {
	fill: rgba(204, 204, 204, 0.5);
}

#electron-titlebar:not(.dark) #close:hover svg > * {
    fill: rgb(255, 255, 255);
}
`;