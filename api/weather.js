// api/weather.js

module.exports = async (req, res) => {
    // 1. Ambil parameter koordinat langsung dari query string bawaan Vercel
    const { lat, lon } = req.query;
    
    // 2. Ambil API Key dari Environment Variable Vercel
    // Jika belum diatur di dashboard, ia akan otomatis menggunakan API Key cadangan Anda di bawah ini
    const API_KEY = process.env.OPENWEATHER_API_KEY || "e155660d6f28a65ddc79b20af23de90b"; 

    // 3. Atur Header CORS agar aplikasi frontend (index.html) tidak diblokir browser
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json');

    if (!lat || !lon) {
        return res.status(400).json({ error: "Parameter koordinat lat dan lon wajib diisi." });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    try {
        // 4. Ambil data secara paralel menggunakan Global Fetch API yang didukung Node.js modern di Vercel
        const [weatherRes, geocodeRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(geocodeUrl, {
                headers: { 'User-Agent': 'DonutProofingAgent/1.0' }
            })
        ]);

        // Cek jika provider luar (OpenWeather/Nominatim) menolak request atau limit habis
        if (!weatherRes.ok) {
            const errText = await weatherRes.text();
            return res.status(502).json({ error: "Gagal mengambil data dari OpenWeather", detail: errText });
        }
        if (!geocodeRes.ok) {
            const errText = await geocodeRes.text();
            return res.status(502).json({ error: "Gagal mengambil data dari Nominatim OpenStreetMap", detail: errText });
        }

        const weatherData = await weatherRes.json();
        const geoData = await geocodeRes.json();

        // 5. Kirim gabungan objek data kembali ke PWA index.html dengan status 200 OK
        return res.status(200).json({
            weather: weatherData,
            geocode: geoData
        });

    } catch (error) {
        // Jika ada kesalahan logika internal, kembalikan pesan error alih-alih crash 500 kosong
        return res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};
