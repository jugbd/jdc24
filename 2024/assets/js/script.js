// loader with some hacks
document.addEventListener('DOMContentLoaded', async () => {
    const body = document.querySelector("body");
    body.setAttribute("loading", "")
    const loader = document.createElement("div");
    loader.classList.add("loader");
    body.appendChild(loader);

    try {
        const url = "assets/data/payload.json"
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const content = await response.json();

        // data population
        populateHero(content.hero);

        // todo: populate page with content
    } catch (e) {
        console.error(e.message)
    } finally {
        body.removeChild(loader);
        body.removeAttribute("loading");
    }
});

const populateHero = (heroContent) => {
    const hero = document.getElementById("hero");
    const title = document.createElement("h1");
    title.innerText = heroContent.title;

    const edition = document.createElement("h3");
    edition.innerText = heroContent.edition;

    const cta = document.createElement("a");
    cta.innerText = heroContent.cta.text;
    cta.setAttribute("href", heroContent.cta.link);

    hero.appendChild(title);
    hero.appendChild(edition);
    hero.appendChild(cta);
}


// am i hungry?
const burger = document.querySelector(".burger");
const navContainer = document.querySelector("nav ul");

burger.addEventListener("click", () => {
    navContainer.toggleAttribute("active");
    burger.toggleAttribute("active");
})


// todo: do more stuff here
