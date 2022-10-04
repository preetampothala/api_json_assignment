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
      .then((response) => {
        console.log(response);
        if (!response.ok)
          throw new Error(`Country not found ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log(data);
        html(data[0], "country");
        let neighbours = data[0].borders;
        if (!neighbours) {
          throw new Error(`Country has no neighbours`);
          return;
        }
        neighbours.forEach((neighbour) => {
          neighPromises.push(
            fetch(`https://restcountries.com/v2/alpha/${neighbour}`).then(
              (response) => response.json()
            )
          );
        });
        console.log(neighPromises);
        return Promise.all(neighPromises);
      })
      .then((response) => {
        console.log(response);
        response.forEach((neighbour) => {
          html(neighbour, "neighbour");
        });
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }
}

function clear() {
  neighPromises = [];
  neighboursContainer.classList.add("no-before");
  countryInputElem.value = "";
  countriesContainer.innerHTML = "";
  neighboursContainer.innerHTML = "";
  countriesContainer.style.opacity = 0;
  neighboursContainer.style.opacity = 0;
}
