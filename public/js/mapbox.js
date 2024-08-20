export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZmFyaHUiLCJhIjoiY2x6MWR1M2p4MnU5ejJrczY3eXNsdzJpciJ9.GZ-yr7D50JryjkYCkgOpnQ';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/farhu/clz1j451i00jl01podvre5zzg', // style URL
    // style: 'mapbox://styles/farhu/clz1j451i00jl01podvre5zzg', // style URL
    // center: [-118.113491, 34.111745], // starting position [lng, lat]
    scrollZoom: false,
    // zoom: 4,
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    // create the marker
    const el = document.createElement('div');
    el.className = 'marker';
    // add the marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}:${loc.description}</p>`)
      .addTo(map);
    // extends map bounds to include current location
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 },
  });
};
