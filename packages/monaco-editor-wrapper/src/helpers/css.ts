export const getMonacoEditorCss = async (baseUrl?: string, relativeStyleLocation?: string) => {
    const realBaseUrl = baseUrl ?? window.location.href;
    const cssFile = relativeStyleLocation ?? '../../bundle/assets/style.css';
    const res = await fetch(new URL(cssFile, realBaseUrl).href);
    return res.text();
};

export const addMonacoStyles = async (idOfStyleElement: string, baseUrl?: string, relativeStyleLocation?: string) => {
    const style = document.createElement('style');
    style.id = idOfStyleElement;
    style.innerHTML = await getMonacoEditorCss(baseUrl, relativeStyleLocation);
    document.head.appendChild(style);
};
