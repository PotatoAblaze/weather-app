const showButton = document.querySelector("form button");
const placeInput = document.querySelector("#place-input");
const errorMessage = document.querySelector(".error-message");
const loadingIndicator = document.querySelector("#loading-indicator");

async function getWeatherData(place) {
    try {
        loadingIndicator.textContent = "Fetching data...";
        let response = await fetch(`https://api.weatherapi.com/v1/forecast.json?q=${place}&days=5`, {
            mode: "cors",
            headers: {
                'key': '2bae799a7c7a42e4b8a55232242206',
                'Access-Control-Allow-Origin': '*',
            },
       });

       if(!response.ok) {
            if(response.status == 400) {
                errorMessage.textContent = "That isn't a valid place!";
            }
            throw new Error("Request was invalid");
       }
       let json = await response.json();
       return json;
    }
    catch(err) {
        console.error(err);
        return null;
    }
    
}

let weatherDataContainer = document.querySelector(".weather-data-container");
let usingCelsius = true;

function changeUnit()
{
    usingCelsius = !usingCelsius;
}

showButton.addEventListener("click", (e) => {
    if(placeInput.validity.valueMissing) {
        errorMessage.textContent = "Please input a value!";
        return;
    } else {
        errorMessage.textContent = "";
    }

    getWeatherData(placeInput.value).then((data) => {
        loadingIndicator.textContent = "";
        if(data === null) return;

        let rerender = function() {
            const location = data.location.name + ", " + data.location.country;
            const currentTemperature = usingCelsius ? data.current.temp_c : data.current.temp_f;
            const feelsLike = usingCelsius ? data.current.feelslike_c : data.current.feelslike_f;
            const weather = data.current.condition.text;
            const wind = data.current.wind_kph;
            const unit = usingCelsius ? "\u00B0C" : "\u00B0F";
            const imageUrl = data.current.condition.icon;
            const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

            let table_headings = "";
            let table_contents = "";
            data.forecast.forecastday.forEach((ele) => {
                const date = new Date(ele.date);
                const conditionToday = ele.day.condition.text
                const conditionTodayIcon = ele.day.condition.icon;
                table_headings = table_headings + `
                    <div class="table-header">
                    ${weekday[date.getDay()]} <br> ${date.getDate()}.${date.getMonth()}.${date.getFullYear()}
                    </div>`;
                
                const maxTempToday =  usingCelsius ? ele.day.maxtemp_c : ele.day.maxtemp_f;
                const minTempToday =  usingCelsius ? ele.day.mintemp_c : ele.day.mintemp_f;


                table_contents = table_contents + `
                <div class="prediction">
                    ${conditionToday}
                    <img src="${conditionTodayIcon}" alt="">
                    Max Temp: ${maxTempToday} ${unit} <br>
                    Min Temp: ${minTempToday} ${unit}
                </div>`
            })
            weatherDataContainer.innerHTML = `
                <div class="heading2">Weather Data</div>
                <button id="switch-units">Switch to ${usingCelsius ? "Fahrenheit" : "Celsius"}</button>
                <ul class="properties-list">
                    <li><strong>Location:</strong> ${location}</li>
                    <li><strong>Current Temperature:</strong> ${currentTemperature} ${unit}</li>
                    <li><strong>Feels Like:</strong> ${feelsLike} ${unit}</li>
                    <li><strong>Weather:</strong> ${weather} <img src="${imageUrl}" alt="Weather Icon"></li>
                    <li><strong>Wind:</strong> ${wind} km/h</li>
                </ul>
                <div class="heading2">Forecast</div>
                <div class="forecast-table">` + table_headings + table_contents  + "</div>"

            const button = weatherDataContainer.querySelector("#switch-units");
            button.addEventListener("click", () => {
                changeUnit();
                rerender();
            });
        }
        rerender();
    })
    e.preventDefault();
});