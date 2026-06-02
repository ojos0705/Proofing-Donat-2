// api/weather.js

export default async function handler(request, response) {
    // Mengambil lat & lon dari query URL sisi klien
    const urlParams = new URL(request.url, `http://${request.headers.host}`);
    const lat = urlParams.searchParams.get('lat');
    const lon = urlParams.searchParams.get('lon');

    // API Key disembunyikan di Environment Variable Serverless Cloud, bukan di HTML!
    const API_KEY = process.env.OPENWEATHER_API_KEY; 

    if (!lat || !lon) {
        return new Response(JSON.stringify({ error: "Gagal: Koordinat lat dan lon diperlukan" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    try {
        // Melakukan fetch paralel langsung ke OpenWeather dan OpenStreetMap dari server cloud
        const [weatherRes, geocodeRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(geocodeUrl, {
                headers: { 'User-Agent': 'DonutProofingAgent/1.0' }
            })
        ]);

        if (!weatherRes.ok || !geocodeRes.ok) {
            throw new Error("Gagal mengambil data dari provider pihak ketiga");
        }

        const weatherData = await weatherRes.json();
        const geoData = await geocodeRes.json();

        // Gabungkan datanya dan kirim kembali ke index.html
        const gabunganData = {
            weather: weatherData,
            geocode: geoData
        };

        return new Response(JSON.stringify(gabunganData), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Aman untuk CORS PWA
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}