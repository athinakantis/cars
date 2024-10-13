'use strict'
const ownerInput = document.querySelector("#customerName");
const licenseInput = document.querySelector("#licensePlate");
const makerInput = document.querySelector("#maker");
const modelInput = document.querySelector("#model");
const colorInput = document.querySelector("#color");
const yearInput = document.querySelector("#year");
const priceInput = document.querySelector("#price");

const reply = document.querySelector("#reply");
const tableBody = document.querySelector("#listingsTable tbody");

const licensePlateRegex = new RegExp(/^[A-Za-z]{3}\d{3}$/);
const thisYear = new Date().getFullYear();
yearInput.setAttribute("max", thisYear);
let currentTimeout;
let cars = [];

// Car class
// And cars array
class Car {
    constructor(licensePlate, maker, model, owner, year, color, price) {
        this.licensePlate = licensePlate;
        this.maker = maker;
        this.model = model;
        this.owner = owner;
        this.year = year;
        this.color = color;
        this.price = price;
    }

    overTenYears() {
        return thisYear - this.year > 10;
    }

    getDiscount() {
        const discountRate = 0.15;
        return +this.price * (1 - discountRate);
    }
}

let storedCars = localStorage.getItem("cars");
if (storedCars) {
    const parsedCars = JSON.parse(storedCars);
    parsedCars.forEach((car) => {
        cars.push(Object.assign(new Car(), car));
    });
    loadListings(cars);
}


function validateName() {
    if (ownerInput.value.trim() < 1) {
        throw new Error("Invalid name, please try again");
    }
}



function showMessage(message, type = "success") {
    reply.textContent = message;
    reply.className = type;

    if (currentTimeout) {
        clearTimeout(currentTimeout);
    }

    setTimeout(() => {
        reply.className = "";
    }, 5000);
}

function loadListings(arr) {
    tableBody.innerHTML = "";
    arr.forEach((car) => updateListings(car));
    listenRemove()
}

//
// Show only models of the chosen maker
//
makerInput.addEventListener("change", filterModel);
const optgroups = document.querySelectorAll("optgroup");

let modelFilter;
function filterModel() {
    const modeldropdown = Array.from(optgroups);
    if (modelFilter) {
        modelFilter.classList.toggle("hidden");
    }

    modelFilter = modeldropdown.find((model) => model.label === makerInput.value);
    modelFilter.classList.toggle("hidden");
}

//
// Listen for any new listings
//
const newListingForm = document.querySelector("#newListing");
newListingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
        if (
            cars.find((car) => car.licensePlate === licenseInput.value.toUpperCase())
        ) {
            throw new Error(
                `A car with this license plate already exists in our system. Make sure you've entered the correct license.`
            );
        } else if (!licensePlateRegex.test(licenseInput.value)) {
            throw new Error(
                "Please enter a license plate in the following format: ABC123"
            );
        }

        const newCar = new Car(
            licenseInput.value.toUpperCase().trim(),
            makerInput.value.trim(),
            modelInput.value,
            ownerInput.value,
            +yearInput.value,
            colorInput.value.trim(),
            +priceInput.value
        );

        cars.push(newCar);
        localStorage.setItem("cars", JSON.stringify(cars));
        loadListings(cars);
        resetListingsForm();

        showMessage(`Your new listing has been created!`);
    } catch (error) {
        showMessage(`Error: ${error.message}`, "error");
    }
});

function resetListingsForm() {
    modelFilter.classList.toggle("hidden");
    modelFilter = undefined;
    ownerInput.value = "";
    licenseInput.value = "";
    makerInput.value = ''
    modelInput.value = ''
    colorInput.value = "";
    yearInput.value = "";
    priceInput.value = "";
}

function updateListings(car, highlight = false) {
    const tr = tableBody.insertRow(-1);
    const discountTd = hasDiscount(car);
    const priceTd = document.createElement("td");
    priceTd.textContent = `$${car.price}`;

    if (highlight) {
        tr.classList.add("highlight");
    }

    for (let i = 0; i < Object.values(car).length - 1; i++) {
        let td = document.createElement("td");
        td.textContent = Object.values(car)[i];
        tr.appendChild(td);
    }

    const rmTd = document.createElement("td");
    const rmBtn = document.createElement("button");
    rmBtn.textContent = "Delete";

    tr.appendChild(priceTd);
    tr.appendChild(discountTd);
    rmTd.appendChild(rmBtn);
    tr.appendChild(rmTd);
    tableBody.appendChild(tr);

}

function listenRemove() {
    const deleteBtn = document.querySelectorAll("td > button");
    deleteBtn.forEach((button, index) => {
        button.addEventListener('click', () => deleteListing(index))
    })

}

function hasDiscount(car) {
    const discountTd = document.createElement("td");
    const div = document.createElement("div");

    if (thisYear - car.year > 10) {
        const price = car.getDiscount();
        div.textContent = `$${price}`;
        discountTd.classList.add("hasDiscount");
        discountTd.appendChild(div);
    } else {
        discountTd.textContent = "---";
        discountTd.classList.add("noDiscount");
    }
    return discountTd;
}

//
//  Search functionality.
//  Filter by discounted cars or search license plates
//
const searchBar = document.querySelector("#searchBar");
const filterDiscount = document.querySelector("#filterDiscount");

document.querySelector("#search").addEventListener("click", search);

function search() {
    const foundCar = cars.find(
        (car) => car.licensePlate === searchBar.value.toUpperCase().trim()
    );

    if (foundCar) {
        showMessage("Success: Car found");
        tableBody.innerHTML = "";
        return updateListings(foundCar, true);
    } else {
        showMessage(
            `No car with license plate ${searchBar.value.toUpperCase()} found. Check spelling and try again`,
            "error"
        );
    }
}

filterDiscount.addEventListener("change", () => {
    filterDiscount.checked ? searchDiscounts() : loadListings(cars);
});

function searchDiscounts() {
    const filteredCars = cars.filter((car) => car.overTenYears());
    loadListings(filteredCars);
}

//
// Toggle between Search listings and All listings
//
document
    .querySelector("#redirectSearch")
    .addEventListener("click", () => {
        togglePage(searchPage);
        loadListings(cars)
    });
document.querySelector("#redirectBrowse").addEventListener("click", () => togglePage(browsePage));


function deleteListing(rmIndex) {
    cars.splice(rmIndex, 1)
    loadListings(cars);
    localStorage.setItem("cars", JSON.stringify(cars));

    showMessage(`Success: Listing was deleted`);
}

// Animate Prompts on load
const prompts = document.querySelectorAll('.promptContainer > div')
window.addEventListener('load', () => {
    prompts.forEach((prompt, index) => {
        prompt.animate(fadeInEffect, {
            duration: 1000,
            fill: 'forwards',
            delay: index * 300,
            easing: 'ease-out'
        })
    })
})

const fadeInEffect = [{
    transform: 'translateY(0)',
    opacity: 1
}]


/* Page Functionality */
const [homePage, browsePage, searchPage, createPage] = document.querySelectorAll('.home, .browse, .search, .create')
let currentPage = homePage
const [browsePrompt, searchPrompt, createPrompt] = prompts;
browsePrompt.addEventListener('click', () => togglePage(browsePage))
searchPrompt.addEventListener('click', () => togglePage(searchPage))
createPrompt.addEventListener('click', () => togglePage(createPage))
document.querySelector('.logo').addEventListener('click', () => togglePage(homePage))

function togglePage(page) {
    currentPage.classList.toggle('active');
    page.classList.toggle('active');
    page.animate(fadeInEffect, {
        duration: 1000,
        fill: 'forwards',
        easing: 'ease-out'
    })
    currentPage = page;
}