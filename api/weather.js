// api/weather.js

module.exports = async (req, res) => {
    // Ambil parameter koordinat dari query URL
    const { lat, lon } = req.query;
    
    // Gunakan API Key dari Environment Variable Vercel atau fallback cadangan langsung
    const API_KEY = process.env.OPENWEATHER_API_KEY || "e155660d6f28a65ddc79b20af23de90b"; 

    // Set header CORS agar bot PWABuilder dan browser tidak diblokir
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    // Jika bot PWABuilder mengetes tanpa mengirim parameter lat/lon, beri respons default aman alih-alih error 500
    if (!lat || !lon) {
        return res.status(200).json({ 
            status: "online", 
            message: "Serverless proxy aktif. Parameter lat/lon kosong." 
        });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    try {
        const [weatherRes, geocodeRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(geocodeUrl, {
                headers: { 'User-Agent': 'DonutProofingAgent/1.0' }
            })
        ]);

        // Jika API luar bermasalah, tangani secara lokal dengan status 200 berisi pesan error khusus
        if (!weatherRes.ok || !geocodeRes.ok) {
            return res.status(200).json({ 
                error: "Provider luar sibuk", 
                detail: "Gagal memuat data dari OpenWeather/Nominatim." 
            });
        }

        const weatherData = await weatherRes.json();
        const geoData = await geocodeRes.json();

        return res.status(200).json({
            weather: weatherData,
            geocode: geoData
        });

    } catch (error) {
        // Cegah crash 500 global dengan membungkus error ke dalam format JSON 200
        return res.status(200).json({ 
            error: "Internal Error Terperangkap", 
            message: error.message 
        });
    }
};
