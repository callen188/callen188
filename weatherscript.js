$(document).ready(function() {
    $('#search-btn').click(function() {
        const city = $('#city').val();
        const apiKey = '39b05395a47c346bb566b0d05c03dfa8'; // Replace with your actual API key
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&timestamp=${new Date().getTime()}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&timestamp=${new Date().getTime()}`;

        function convertToFahrenheit(celsius) {
            return (celsius * 9/5) + 32;
        }

        // Current Weather
        $.getJSON(weatherUrl, function(data) {
            const tempF = convertToFahrenheit(data.main.temp);
            const weather = `
                <div>City: ${data.name}</div>
                <div>Temperature: ${tempF.toFixed(2)}°F</div>
                <div>Weather: ${data.weather[0].description}</div>
            `;
            $('#current-weather').html(weather);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error getting current weather:', textStatus, errorThrown);
            alert('Failed to retrieve current weather data');
        });

        // 5-Day Forecast
        $.getJSON(forecastUrl, function(data) {
            const forecast = data.list.slice(0, 40).reduce((acc, curr, index) => {
                if (index % 8 === 0) {
                    acc.push(curr);
                }
                return acc;
            }, []);

            $('#forecast').html('<h2>5-Day Forecast</h2>');
            forecast.forEach(day => {
                const tempF = convertToFahrenheit(day.main.temp);
                const forecastDay = `
                    <div class="weather-day">
                        <div>Date: ${new Date(day.dt_txt).toLocaleDateString()}</div>
                        <div>Temperature: ${tempF.toFixed(2)}°F</div>
                        <div>Weather: ${day.weather[0].description}</div>
                    </div>
                `;
                $('#forecast').append(forecastDay);
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error getting forecast data:', textStatus, errorThrown);
            alert('Failed to retrieve forecast data');
        });
    });
});


