const testDiv = document.getElementById('root')

async function fetchData() {
    const data = await fetch("http://localhost:5083/WeatherForecast");

    return await data.json();
}

async function insertText() {
    let data = await fetchData();
    let response = ''

    data.forEach(e => response += e.summary + ' ,')

    testDiv.textContent = response
}

insertText();