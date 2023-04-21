export const getMonacoEditoCss = async () => {
    const res = await fetch(new URL('../../bundle/assets/style.css', window.location.href).href);
    return res.text();
};

export const addMonacoStyles = async (idOfStyleElement: string) => {
    const style = document.createElement('style');
    style.id = idOfStyleElement;
    style.innerHTML = await getMonacoEditoCss();
    document.head.appendChild(style);
};
