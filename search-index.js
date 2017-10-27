/**
 * Process to create geojsons. 
 * Connect to MasterDataregistery DB from QGIS
 * Convert to Geojson, which splits feature into different data types
 * Convert the polygin layer to WGS84 Shapefile
 * Convert the WGS84 shapefile to individual GeoJSON file using ogr2ogr from qgis
 * "gdalogr:convertformat","C:/Projects/qgis/shapefiles/MasterRegistryFootptintsPolygonsWGS84.shp",1,"COORDINATE_PRECISION=5 ","C:/Projects/qgis/geojsons/MasterRegistryFootprintsPolygonsWGS84.geojson
 *
 * crashing on holes may be?
 *
 *
 * refs: 
 * https://www.npmjs.com/package/stream-json
 * https://github.com/mbostock/shapefile
 * https://github.com/mapbox/tile-generator
 * https://github.com/mapbox/tile-cover 
 */
const fs = require('fs');
const jsonfile = require('jsonfile');

let cover = require('@mapbox/tile-cover');

let geojson = "MasterRegistryFootprintsPolygonsWGS84-lowPrecision_1075.geojson";

//buildSearchIndexForGeoJsonSync(geojson);
fs.readdir('./geojsons', function(err, items) {
 	items.forEach(file => {
 		if(!fs.existsSync(`./searchtree/${file}`)) buildSearchIndexForGeoJsonSync(file);
 	});//end files for
});

function buildSearchIndexForGeoJson(file){
	console.log(`${file}`);
	jsonfile.readFile(`./geojsons/${file}`, function(err, polygon) {
	  let maxCacheLevel = 15;
	  let searchIndex = {};
	  for(var zoomLevel = maxCacheLevel; zoomLevel >= 0; zoomLevel--){
	  	try{
	  		let coverageTiles = cover.tiles(polygon.features[0].geometry, {min_zoom: zoomLevel,max_zoom: zoomLevel});
	  		coverageTiles.forEach(t=> {
	  			if(!searchIndex[t[2]]) searchIndex[t[2]] = {};
	  			if(!searchIndex[t[2]][`${t[0]},${t[1]}`]) searchIndex[t[2]][`${t[0]},${t[1]}`] = [];
	  			searchIndex[t[2]][`${t[0]},${t[1]}`].push(polygon.features[0].properties.MasterData);
	  		});	
	  	}
	  	catch(e){
	  		console.log('cannot parse: '+ file);
	  		break;
	  	}
	  }//end zoom level for
	  jsonfile.writeFileSync(`./searchtree/${file}`, searchIndex);
	  console.log(`$working on ${file} ...done`);
	});//end read file
}

function buildSearchIndexForGeoJsonSync(file){
	console.log(`${file}`);
	let polygon = jsonfile.readFileSync(`./geojsons/${file}`,{encoding:'utf8'});
	let maxCacheLevel = 15;
	let searchIndex = {};
	for(var zoomLevel = maxCacheLevel; zoomLevel >= 0; zoomLevel--){
		try{
			let coverageTiles = cover.tiles(polygon.features[0].geometry, {min_zoom: zoomLevel,max_zoom: zoomLevel});
			coverageTiles.forEach(t=> {
				if(!searchIndex[t[2]]) searchIndex[t[2]] = {};
				if(!searchIndex[t[2]][`${t[0]},${t[1]}`]) searchIndex[t[2]][`${t[0]},${t[1]}`] = [];
				searchIndex[t[2]][`${t[0]},${t[1]}`].push(polygon.features[0].properties.MasterData);
			});	
		}
		catch(e){
			console.log('cannot parse: '+ file);
			break;
		}
	}//end zoom level for
	jsonfile.writeFileSync(`./searchtree/${file}`, searchIndex);
	console.log(`$working on ${file} ...done`);
}