document.querySelector('.year').textContent = new Date().getFullYear();

function getSortBy() {
    return localStorage.getItem('sortBy') || 'latest';
}
function setSortBy(value) {
    localStorage.setItem('sortBy', value);
    sortProjects();
}
function getFilterBy() {
    return localStorage.getItem('filterBy') || 'all';
}
function setFilterBy(value) {
    localStorage.setItem('filterBy', value);
    filterProjects();
}
function getFavoriteProjects() {
    const favorites = localStorage.getItem('favoriteProjects');
    return favorites ? JSON.parse(favorites) : ['minstrel-shows', 'number-wars', 'gamblecore', 'to-kill-a-mockingbird-introduction', 'slots-city-mockup', 'slots-tycoon', 'cee-da-tings', 'paper-co'];
}
function toggleFavoriteProject(projectKey) {
    let favorites = getFavoriteProjects();
    if (favorites.includes(projectKey)) {
        favorites = favorites.filter(key => key !== projectKey);
    } else {
        favorites.push(projectKey);
    }
    localStorage.setItem('favoriteProjects', JSON.stringify(favorites));
}
function getTabOpenPreference() {
    const value = localStorage.getItem('openInTab');
    return value === null ? true : value === 'true';
}
function toggleTabOpenPreference() {
    const current = getTabOpenPreference();
    localStorage.setItem('openInTab', !current);
    sortProjects();
}
async function loadWebsites() {
    const response = await fetch('./projects.json');
    if (!response.ok) throw new Error('Failed to load projects.json');
    websites = await response.json();

    sortProjects();
}


const sortSelector = document.querySelector(".sort-by");
const filterSelector = document.querySelector(".filter");
const searchInput = document.querySelector('.search');
const websiteList = document.querySelector('ul');
const openInTabCheckbox = document.querySelector('.open-in-tab');
let websites;
let currentwebsites;

openInTabCheckbox.checked = getTabOpenPreference();
openInTabCheckbox.addEventListener('change', () => {
    toggleTabOpenPreference();
});
sortSelector.value = getSortBy();
sortSelector.addEventListener('change', (e) => {
    setSortBy(e.target.value);
    sortProjects();
});
filterSelector.value = getFilterBy();
filterSelector.addEventListener('change', (e) => {
    setFilterBy(e.target.value);
    sortProjects();
});
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterProjects(searchTerm);
});

function sortProjects() {
    const sortBy = getSortBy();
    const filterBy = getFilterBy();
    websiteList.innerHTML = '';
    currentwebsites = {};

    if (filterBy !== 'all') {
        for (const [key, project] of Object.entries(websites)) {
            if (filterBy === project.type) {
                currentwebsites[key] = project;
            }
            if (filterBy === 'favorite' && getFavoriteProjects().includes(key)) {
                currentwebsites[key] = project;
            }
        }
    } else {
        currentwebsites = websites;
    }

    if (sortBy === 'newest' || sortBy == 'oldest') {
        if (sortBy == 'oldest') {
            currentwebsites = Object.fromEntries(Object.entries(currentwebsites).reverse());
        }
        for (const [key, project] of Object.entries(currentwebsites)) {
            appendListItem(project, key);
        }
    } else if (sortBy == 'latest' || sortBy == 'earliest') {
        const modifiedDates = Object.values(currentwebsites).map(p => p.modified);
        modifiedDates.sort();
        if (sortBy == 'latest') modifiedDates.reverse();
        for (const modified of modifiedDates) {
            for (const [key, project] of Object.entries(currentwebsites)) {
                if (project.modified === modified) {
                    appendListItem(project, key);
                }
            }
        }
    } else if (sortBy == 'a-z' || sortBy == 'z-a') {
        const names = Object.values(currentwebsites).map(p => p.name.toLowerCase());
        names.sort();
        if (sortBy == 'z-a') names.reverse();
        for (const name of names) {
            for (const [key, project] of Object.entries(currentwebsites)) {
                if (project.name.toLowerCase() === name) {
                    appendListItem(project, key);
                }
            }
        }
    }
}
function filterProjects(searchTerm = '') {
    websiteList.innerHTML = '';
    for (const [key, project] of Object.entries(currentwebsites)) {
        if (project.name.toLowerCase().includes(searchTerm)) {
            appendListItem(project, key);
        }
    }
}
function appendListItem(project, key) {
    let li = document.createElement('li');
    li.innerHTML = `
        <abbr title="${project.name}">
            <p class="favorite-btn">${getFavoriteProjects().includes(key) ? '★' : '☆'}</p>
            <a class="${project.type} ${key}" ${getTabOpenPreference() ? `target="_blank"` : ''} href="${project.url}">
                <p class="project-name">${project.name}</p>
            </a>
        </abbr>
    `;
    websiteList.appendChild(li);
    const favoriteBtn = websiteList.querySelector(`abbr:has(a.${key}) p.favorite-btn`);
    favoriteBtn.addEventListener('click', () => {
        toggleFavoriteProject(key);
        favoriteBtn.textContent = getFavoriteProjects().includes(key) ? '★' : '☆';
    });
}

loadWebsites().catch(console.error);
