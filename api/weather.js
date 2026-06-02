// api/weather.js

export default async function handler(request) {
    // Mengambil parameter query URL (?lat=...&lon=...)
    const url = new URL(request.url);
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');

    // Mengambil API Key yang tersimpan aman di Environment Variable Vercel
    const API_KEY = process.env.OPENWEATHER_API_KEY || "e155660d6f28a65ddc79b20af23de90b";

    // Proteksi Header CORS agar PWA di index.html browser bisa mengakses tanpa diblokir
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Content-Type': 'application/json'
    };

    if (!lat || !lon) {
        return new Response(JSON.stringify({ error: "Koordinat tidak lengkap." }), { status: 400, headers });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    try {
        // Eksekusi pemanggilan ke API eksternal secara paralel dari serverless cloud
        const [weatherRes, geocodeRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(geocodeUrl, {
                headers: { 'User-Agent': 'DonutProofingAgent/1.0' }
            })
        ]);

        if (!weatherRes.ok || !geocodeRes.ok) {
            return new Response(JSON.stringify({ error: "Gagal mengambil data dari penyedia API luar." }), { status: 502, headers });
        }

        const weatherData = await weatherRes.json();
        const geoData = await geocodeRes.json();

        // Bungkus data menjadi satu objek untuk dikirim balik ke client
        return new Response(JSON.stringify({
            weather: weatherData,
            geocode: geoData
        }), { status: 200, headers });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}
