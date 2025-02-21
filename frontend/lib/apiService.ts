const API_URL = "http://localhost:5000/api";

export async function fetchCoordinates(placeName: string) {
    const response = await fetch(`${API_URL}/coordinates?placeName=${encodeURIComponent(placeName)}`);
    return response.json();
}

export async function fetchGDELTNews() {
    const response = await fetch(`${API_URL}/gdelt-news`);
    return response.json();
}
