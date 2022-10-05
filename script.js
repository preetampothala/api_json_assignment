const countryInputElem = document.querySelector("#countryinput");
const searchbtnElem = document.querySelector("#searchbtn");
const countriesContainer = document.querySelector(".countries");
const neighboursContainer = document.querySelector(".neighbours");
const clearbtnElem = document.querySelector("#clearbtn");

clearbtnElem.addEventListener("click", clear);
countryInputElem.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchbtnElem.addEventListener("click", onEvent(e));
  }
});
let neighPromises = [];
let prevCountry;
clear();

//function to render the data on the webpage
function html(data, classname) {
  let count = "country";
  // `${classname === "neighbour" ? "<p>Neighbour:</p>" : ``}
  let html = `<article class="${
    classname === "neighbour" ? classname + " " + count : classname
  }">
          <img class="countryimg" src="${data.flag}" />
          <div class="countrydata">
            <h3 class="countryname">${data.name}</h3>
            <h4 class="countryregion">${data.subregion}</h4>
            <p class="countryrow"><span>🏞</span>${data.area + ` sq km`}</p>
            <p class="countryrow"><span>🌆</span>${data.capital}</p>
            <p class="countryrow"><span>👫</span>${
              data.population > 1000000
                ? (+data.population / 1000000).toFixed(2) + ` Million`
                : +data.population
            }</p>
            <p class="countryrow"><span>🗣️</span>${data.languages[0].name}</p>
            <p class="countryrow"><span>💰</span>${
              data.currencies[0].name + ": " + data.currencies[0].symbol
            }</p>
            
          </div>
        </article>`;
  // <p class="countryrow"><span>🕛</span>${data.timezones[0]}</p>
  if (classname === "country") {
    countriesContainer.insertAdjacentHTML("beforeend", html);
    countriesContainer.style.opacity = 1;
  } else if (classname === "neighbour") {
    neighboursContainer.insertAdjacentHTML("beforeend", html);
    neighboursContainer.style.opacity = 1;
  }
}

searchbtnElem.addEventListener("click", onEvent);

function onEvent(event) {
  event.preventDefault();
  // clear();
  const countryName = countryInputElem.value;

  if (countryName != prevCountry) {
    prevCountry = countryName;
    clear();
    fetch(`https://restcountries.com/v2/name/${countryName}`)
      // returns a promise that resolves to a response object
      .then((response) => {
        console.log(response);
        //if the response.ok is false, throw an error country not found
        if (!response.ok)
          throw new Error(`Country not found ${response.status}`);
        return response.json();
        // returns a promise that resolves to the data as json object
      })
      .then((data) => {
        console.log(data);
        // call the html function to render the data on the webpage
        html(data[0], "country");
        let neighbours = data[0].borders;
        // if the country doesnt have neighbours throw an error and return
        if (!neighbours) {
          throw new Error(`Country has no neighbours`);
          return;
        }
        console.log(neighbours);
        // neighbours is an array of 3 letter country codes
        // loop through the neighbours array, fetch the api data and push the each resolved promise to the neighPromises array
        neighbours.forEach((neighbour) => {
          neighPromises.push(
            fetch(`https://restcountries.com/v2/alpha/${neighbour}`).then(
              (response) => response.json()
            )
          );
        });
        console.log(neighPromises);
        // Promise.all takes an array of promises and returns a single promise that resolves to an array of the results of the promises in the array
        return Promise.all(neighPromises);
      })
      .then((response) => {
        console.log(response);
        // loop through the response array and call the html function to render the neighbour data on the webpage
        response.forEach((neighbour) => {
          html(neighbour, "neighbour");
        });
      })
      //catch any errors propogated down the chain and log them to the console
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }
}

//clear the countries and neighbours container and form input
function clear() {
  neighPromises = [];
  neighboursContainer.classList.add("no-before");
  countryInputElem.value = "";
  countriesContainer.innerHTML = "";
  neighboursContainer.innerHTML = "";
  countriesContainer.style.opacity = 0;
  neighboursContainer.style.opacity = 0;
}
