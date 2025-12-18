import './App.css'; // Tuodaan tyylitiedosto sovellukselle.
import React, { useState } from "react"; 
import { MapContainer, TileLayer, Polyline } from "react-leaflet"; 
import "leaflet/dist/leaflet.css"; 
import { Input } from "./components/input.jsx"; 
import { Button } from "./components/button.jsx"; 
import { Card, CardContent } from "./components/card.jsx"; 
const DistanceCalculator = () => {
  // Määritetään tilamuuttujat lähtö- ja määränpääkaupungille, reitille, etäisyydelle ja arvioidulle ajalle.
  const [start, setStart] = useState(""); // Lähtöpaikan syötteen tila.
  const [end, setEnd] = useState(""); // Määränpään syötteen tila.
  const [route, setRoute] = useState(null); // Reitin tilamuuttuja, jossa säilytetään kartalle piirrettävä reitti.
  const [distance, setDistance] = useState(null); // Matkan pituus kilometreinä.
  const [time, setTime] = useState(null); // Arvioitu ajoaika tunteina.

  // Funktio hakee annetun paikan koordinaatit OpenStreetMapin Nominatim-palvelusta.
  const getCoordinates = async (place) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}` // Lähetetään kysely paikannimellä.
    );
    const data = await response.json(); // Parsitaan vastaus JSON-muotoon.
    if (data.length > 0) {
      return `${data[0].lon},${data[0].lat}`; // Palautetaan koordinaatit (longitudi, latitudi).
    }
    return null; // Jos paikkaa ei löydy, palautetaan null.
  };

  // Funktio hakee reitin lähtö- ja määränpään välillä OSRM-palvelusta.
  const getRoute = async () => {
    const startCoords = await getCoordinates(start); // Haetaan lähtöpaikan koordinaatit.
    const endCoords = await getCoordinates(end); // Haetaan määränpään koordinaatit.
    
    if (!startCoords || !endCoords) { // Tarkistetaan, löytyivätkö koordinaatit.
      alert("Paikkakuntaa ei löytynyt, tarkista kirjoitusasu."); // Näytetään varoitus, jos jompaa kumpaa ei löydy.
      return;
    }
    
    // Haetaan reitti OSRM-palvelusta käyttäen koordinaatteja.
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${startCoords};${endCoords}?overview=full&geometries=geojson`
    );
    const data = await response.json(); // Parsitaan vastaus JSON-muotoon.
    if (data.routes.length > 0) { // Tarkistetaan, löytyikö reitti.
      const routeCoords = data.routes[0].geometry.coordinates.map((coord) => [
        coord[1], // Käännetään koordinaattien järjestys (Leaflet käyttää lat, lon -järjestystä).
        coord[0],
      ]);
      setRoute(routeCoords); // Tallennetaan reitti tilaan.
      setDistance((data.routes[0].distance / 1000).toFixed(2)); // Muutetaan etäisyys metreistä kilometreiksi ja pyöristetään kahteen desimaaliin.
      setTime(((data.routes[0].distance / 1000) / 80).toFixed(2)); // Lasketaan arvioitu ajoaika oletusnopeudella 80 km/h.
    }
  };

  return (
    <div className="p-4"> {/* Ulkoinen div, jossa on padding. */}
      <Card> {/* Käytetään Card-komponenttia sisällön kehystämiseen. */}
        <CardContent> {/* Kortin sisältöosa. */}
          <div className="flex space-x-2 mb-4"> {/* Flexbox-asettelu syötekentille ja painikkeelle. */}
            <Input
              placeholder="Lähtöpaikka (kaupunki)"
              value={start}
              onChange={(e) => setStart(e.target.value)} // Päivitetään lähtöpaikan tila käyttäjän syötteen perusteella.
            />
            <Input
              placeholder="Määränpää (kaupunki)"
              value={end}
              onChange={(e) => setEnd(e.target.value)} // Päivitetään määränpään tila käyttäjän syötteen perusteella.
            />
            <Button onClick={getRoute}>Laske</Button> {/* Kun painiketta painetaan, kutsutaan getRoute-funktiota. */}
          </div>
          {distance && ( // Jos etäisyys on laskettu, näytetään se käyttöliittymässä.
            <div>
              <p>Matkan pituus: {distance} km</p> {/* Näytetään laskettu etäisyys. */}
              <p>Arvioitu ajoaika (80 km/h): {time} h</p> {/* Näytetään arvioitu ajoaika. */}
            </div>
          )}
          <MapContainer center={[60.1695, 24.9354]} zoom={6} style={{ height: "400px", width: "100%" }}> {/* Luodaan kartta, keskipisteenä Helsinki. */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // Ladataan OpenStreetMapin karttatiiliä.
            />
            {route && <Polyline positions={route} color="blue" />} {/* Jos reitti on laskettu, piirretään se kartalle sinisellä viivalla. */}
          </MapContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DistanceCalculator; // Viedään DistanceCalculator-komponentti, jotta sitä voidaan käyttää sovelluksessa.
