import "./App.css";
import { useState } from "react";

import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
} from "react-leaflet";

function App() {
  const fetchPlaces = (long, lat) => {
    const url = `${process.env.REACT_APP_END_POINT}${long},${lat}.json?types=address&access_token=${process.env.REACT_APP_API_KEY}`;
    console.log(url);
    const places = fetch(url)
      .then((response) => response.json())
      .then((data) => data);
    return places;
  };

  const [location, setLocation] = useState(null);
  const [selectPosition, setSelectPosition] = useState(null);
  const [initPosition, setInitPosition] = useState({ lat: 60.25, lng: 24.94 });

  const isSelected = selectPosition !== null;
  const headerOne = isSelected
    ? `${location}, ${String(selectPosition.lng).slice(0, 5)},${String(
        selectPosition.lat
      ).slice(0, 5)}`
    : "select a place";

  function LocationMarker() {
    const map = useMapEvents({
      click: async (e) => {
        const places = await fetchPlaces(e.latlng.lng, e.latlng.lat);
        "place_name" in places.features[0]
          ? setLocation(places.features[0].place_name)
          : setLocation("uknown place");
        setSelectPosition(e.latlng);
        map.flyTo(e.latlng, 10);
      },
    });
    !isSelected && map.flyTo(initPosition, 10);

    return isSelected ? (
      <Marker position={selectPosition}>
        <Popup>{location}</Popup>
      </Marker>
    ) : null;
  }

  return (
    <div className="App">
      <h1>{headerOne}</h1>
      <MapContainer
        id="map"
        center={initPosition}
        zoom={10}
        maxBounds={[
          [59.846373196, 20.6455928891],
          [70.1641930203, 31.5160921567],
        ]}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
      <button
        disabled={!isSelected}
        onClick={() => {
          setSelectPosition(null);
          setLocation(null);
        }}
      >
        Reset
      </button>
    </div>
  );
}

export default App;
