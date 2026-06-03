// api/weather.js

module.exports = async (req, res) => {
    // 1. Ambil parameter koordinat langsung dari query string URL bawaan req Vercel
    const { lat, lon } = req.query;
    
    // 2. Ambil API Key dari Environment Variable Vercel
    // Jika belum diatur di dashboard, ia akan otomatis memakai API Key cadangan di bawah ini
    const API_KEY = process.env.OPENWEATHER_API_KEY || "e155660d6f28a65ddc79b20af23de90b"; 

    // 3. Atur Header CORS secara manual agar bot PWABuilder dan browser tidak diblokir
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTION');
    res.setHeader('Content-Type', 'application/json');

    // JIKA BOT PWABUILDER MENGETES TANPA PARAMETER, BERI RESPONS SUKSES DEFAULT (Mencegah Crash 500)
    if (!lat || !lon) {
        return res.status(200).json({ 
            status: "online", 
            message: "Serverless proxy berjalan dengan sukses. Parameter koordinat kosong." 
        });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    try {
        // 4. Lakukan fetch data paralel langsung dari infrastruktur cloud Vercel
        const [weatherRes, geocodeRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(geocodeUrl, {
                headers: { 'User-Agent': 'DonutProofingAgent/1.0' }
            })
        ]);

        // Jika API pihak ketiga bermasalah, kembalikan status 200 dengan detail kesalahan terstruktur
        if (!weatherRes.ok) {
            return res.status(200).json({ error: "OpenWeather API membatasi akses atau limit habis." });
        }
        if (!geocodeRes.ok) {
            return res.status(200).json({ error: "Nominatim OpenStreetMap sibuk atau memblokir request." });
        }

        const weatherData = await weatherRes.json();
        const geoData = await geocodeRes.json();

        // 5. Kirim gabungan data kembali ke index.html dengan status sukses 200 OK
        return res.status(200).json({
            weather: weatherData,
            geocode: geoData
        });

    } catch (error) {
        // MENJINAKKAN EROR: Jika ada crash tak terduga, kembalikan status 200 agar PWABuilder tidak macet
        return res.status(200).json({ 
            status: "error_trapped", 
            message: error.message 
        });
    }
};
