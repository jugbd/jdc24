// loader with some hacks
document.addEventListener('DOMContentLoaded', async () => {
    const body = document.querySelector("body")
    body.setAttribute("loading", "")
    const loader = document.createElement("div");
    loader.classList.add("loader");
    body.appendChild(loader);

    try {
        const url = "data/payload.json"
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const content = await response.json();
        console.log(content);

        // todo: populate page with content
    } catch (e) {
        console.error(e.message)
    } finally {
        body.removeChild(loader);
        body.removeAttribute("loading");
    }
});


// am i hungry?
const burger = document.querySelector(".burger");
const navContainer = document.querySelector("nav ul");

burger.addEventListener("click", () => {
    navContainer.toggleAttribute("active");
    burger.toggleAttribute("active");
})


// todo: do more stuff here
