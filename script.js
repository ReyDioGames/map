// Gestion du menu Burger
const burgerBtn = document.getElementById('burger-btn');
const burgerMenu = document.getElementById('burger-menu');

burgerBtn.addEventListener('click', () => {
    burgerMenu.style.display = burgerMenu.style.display === 'block' ? 'none' : 'block';
});

// Initialisation de la carte Mapbox avec la projection 'globe'
mapboxgl.accessToken = 'pk.eyJ1IjoiYnJheWFucjY0IiwiYSI6ImNseXF5dTBlMzAxYzAyanF2Zzl0cm1lOG0ifQ.Yt51xQQj4S2VqYQulYb3UA'; // Remplacez par votre propre token Mapbox
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/brayanr64/clz5oi8qw00pj01pcg1m3gb1o', // Vous pouvez changer cela avec votre propre style
    center: [6, 45],  // Coordonnées [longitude, latitude]
    zoom: 2,
    minZoom: 1,
    maxZoom: 8,
    projection: 'globe'
});

map.addControl(new mapboxgl.NavigationControl());

map.on('style.load', () => {
    map.setFog({
        'range': [2, 8],
        'horizon-blend': 0.03,
        'color': 'white',
        'high-color': '#add8e6',
        'space-color': '#000000',
        'star-intensity': 0.1
    });
});

if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log(`Position obtenue: Latitude ${lat}, Longitude ${lon}`);

        try {
            // Récupération du nom de la ville via Mapbox
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${mapboxgl.accessToken}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
            }

            const data = await response.json();
            const city = data.features.find(feature => feature.place_type.includes('place'));

            // Calcul de l'offset UTC
            const timezoneOffset = new Date().getTimezoneOffset(); // Offset en minutes
            const offsetInHours = -(timezoneOffset / 60); // Convertir en heures
            const utcOffset = `UTC ${offsetInHours >= 0 ? '+' : ''}${offsetInHours}`;

            if (city) {
                document.getElementById('city-name').textContent = `${city.text} ${utcOffset}`;
            } else {
                document.getElementById('city-name').textContent = `Ville non trouvée ${utcOffset}`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des informations :", error);
            document.getElementById('city-name').textContent = 'Geolocation Unavailable';
        }
    }, (error) => {
        let message = 'Geolocation error';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Permission de géolocalisation refusée.';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Position non disponible.';
                break;
            case error.TIMEOUT:
                message = 'Le temps pour obtenir la géolocalisation a expiré.';
                break;
            default:
                message = 'Erreur inconnue.';
        }
        console.error("Erreur lors de la récupération de la géolocalisation :", message);
        document.getElementById('city-name').textContent = message;
    });
} else {
    document.getElementById('city-name').textContent = 'Géolocalisation non supportée';
}
