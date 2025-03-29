const testDiv = document.getElementById('root')

async function fetchData() {
    const data = await fetch("http://localhost:5083/WeatherForecast");

    return await data.json();
}