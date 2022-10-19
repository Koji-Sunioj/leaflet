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
  const [timer, setTimer] = useState(null);
  const [search, setSearch] = useState("");
  const [dataList, setDataList] = useState([]);
  const [location, setLocation] = useState(null);
  const [selectPosition, setSelectPosition] = useState(null);
  const initPosition = { lat: 60.25, lng: 24.94 };

  const isSelected = selectPosition !== null;
  const headerOne = isSelected
    ? `${location}, ${String(selectPosition.lng).slice(0, 5)},${String(
        selectPosition.lat
      ).slice(0, 5)}`
    : "select a place";

  const fetchPlaces = (long, lat) => {
    const reverseGeo = `${process.env.REACT_APP_END_POINT}${long},${lat}.json?types=address&access_token=${process.env.REACT_APP_API_KEY}`;
    const places = fetch(reverseGeo)
      .then((response) => response.json())
      .then((data) => data);
    return places;
  };

  const LocationMarker = () => {
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
    !isSelected ? map.flyTo(initPosition, 10) : map.flyTo(selectPosition, 10);

    return isSelected ? (
      <Marker position={selectPosition}>
        <Popup>{location}</Popup>
      </Marker>
    ) : null;
  };

  const searchAddress = (input) => {
    console.log("endpoint hit");
    const searchApi = `${process.env.REACT_APP_END_POINT}${input}.json?&autocomplete=true&country=fi&types=address&access_token=${process.env.REACT_APP_API_KEY}`;
    fetch(searchApi)
      .then((response) => response.json())
      .then((data) => setDataList(data.features));
  };

  const inputChanged = (e) => {
    const {
      target: { value: searchInput },
    } = e;
    setSearch(searchInput);
    const inputAction = "inputType" in e.nativeEvent ? "typed" : "selected";

    switch (inputAction) {
      case "typed": {
        clearTimeout(timer);
        const refined = searchInput.trim();
        const shouldFetch = refined.length > 0 && refined !== search;
        const newTimer = setTimeout(() => {
          shouldFetch && searchAddress(refined);
        }, 1000);
        setTimer(newTimer);
        break;
      }
      case "selected": {
        const coords = searchInput.split(", ");
        const shouldFlyTo =
          coords.every((coord) => typeof Number(coord)) && coords.length > 1;
        shouldFlyTo &&
          (() => {
            const place = dataList.find(
              (place) => place.center.join(", ") === searchInput
            );
            setSelectPosition({ lat: place.center[1], lng: place.center[0] });
            setLocation(place.place_name);
          })();
      }
    }
  };

  return (
    <div className="App">
      <h1>{headerOne}</h1>
      <div>
        <label htmlFor="search">Or search: </label>
        <input
          className="noArrow"
          value={search}
          autoComplete="off"
          name="search"
          type="search"
          onChange={inputChanged}
          list="places"
        />
        <datalist id="places">
          {dataList.map((place) => (
            <option
              value={place.geometry.coordinates.join(", ")}
              label={place.place_name}
              key={place.id}
            />
          ))}
        </datalist>
      </div>
      <br />
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
