import Marker from './Marker.js';
import TempMarker from './TempMarker.js';

const map = {};
const picture = {};
let tempMarker;
const toc = new Toc();

map.options = {
    divId : 'map',
    center : {
        lat : 37.445009887950526,
        lng : 126.9529891719831,
    },
    level : 9,
}

map.init = function() {
    //1. map on
    this.on();
	Toc.Map = map.obj;
	
	//2. pictures draw;
	picture.getList(pictureList => {
		pictureList.forEach(pictureObj => {
			
			const contents = toc.add(pictureObj);
			
			if(pictureObj.hasGeometry) {
				picture.addMarker(pictureObj, contents);
			}
		})
	})
	
	//3. button setting
	const extractButton = document.getElementById('extract-button');
	extractButton.addEventListener('click', picture.extract)
	
	kakao.maps.event.addListener(map.obj, 'toc-contextmenu-picture-remove', picture.tocContextMenuRemoveHandler);
	kakao.maps.event.addListener(map.obj, 'toc-contextmenu-picture-addGeometry', picture.tocContextMenuAddGeometryHandler)
	
	
	//TOC 마우스 오른쪽 클릭 > 좌표 추가 > [확인] 버튼 클릭 이벤트
	kakao.maps.event.addListener(map.obj, 'addGeometry-ok', picture.addGeometryOkHandler);
}

map.on = function() {
    const container = document.getElementById(this.options.divId);

    const options = {
        center: new kakao.maps.LatLng(this.options.center.lat, this.options.center.lng),
        level: this.options.level,
    };

    map.obj = new kakao.maps.Map(container, options);
}



picture.extract = function() {
    const url = '/picture/extract';
    const data = {};

    Async.post(url, data, function(pictureList){
        pictureList.forEach(pictureObj => {
			const contents = toc.add(pictureObj);
			
			if(pictureObj.hasGeometry) {
				picture.addMarker(pictureObj, contents);
			}
		})
    })
}


picture.addMarker = function(pictureObj, contents) {
	const marker = new Marker(pictureObj, map.obj);
	
	contents.addEventListener('click', function(event){
		map.obj.panTo(marker.position)
		
		Marker.closeAllInfowindow();
		marker.infowindow.show()
	})
}

picture.findById = function(id) {
	
    return this.list.find(e => e.pictureId == id);
}

picture.getList = function(fnCallback) {
    const url = '/picture/list';
    const data = {};

    Async.get(url, data, function(result) {

        fnCallback(result);
    })
}

picture.rename = function(pictureObj, name) {
	const data = {
		pictureId : pictureObj.pictureId,
		pictureName : name
	}
	const url = '/picture/rename';
	
	Async.post(url, data, function(result){
	    const pictureObj = picture.findById(result.pictureId);
	    pictureObj.pictureName = result.pictureName;

        Toc.closeRename(pictureObj);
	})
}

/** EVENT HANDLER **/

picture.tocContextMenuRemoveHandler = function(pictureObj) {
	const data = {
		pictureId : pictureObj.pictureId,
	}
	const url = `/picture/${data.pictureId}/delete`;
	
	Async.post(url, data, function(result){
		//toc remove
		const contents = document.getElementById(pictureObj.tocId);
		contents.remove();
		
		//marker remove
		const marker = Marker.findByPictureId(pictureObj.pictureId);
		if(marker) {			
			marker.remove();
		}
	})
}
picture.tocContextMenuAddGeometryHandler = function(pictureObj) {
	const addTempMarkerEventHandler = function(mouseEvent) {
		const pictureId = pictureObj.pictureId;
		const latlng = mouseEvent.latLng;
	    const latitude = latlng.getLat();
	    const longitude = latlng.getLng();
	
		if(typeof tempMarker !== 'undefined') {
			tempMarker.remove();		
		}
		
		tempMarker = new TempMarker(pictureObj, latitude, longitude, map.obj);
		/*
		tempMarker.okButtonClick(function(){
			const paramObj = {
				'latlng' : latlng,
				'pictureObj' : pictureObj
			}
			kakao.maps.event.trigger(map.obj, 'addGeometry-ok', paramObj);
		})
		
		tempMarker.cancelButtonClick(function(){
			kakao.maps.event.removeListener(map.obj, 'click', picture.addTempMarker);
			tempMarker.remove();
		})
		*/
	}
	
	kakao.maps.event.addListener(map.obj, 'click', addTempMarkerEventHandler);
}

picture.addGeometryOkHandler = function(obj) {
    tempMarker.remove();

	const data = {
        pictureId : pictureObj.pictureId,
        latitude : latlng.getLat(),
        longitude : latlng.getLng(),
    }

    const url = '/picture/addGeometry';
    Async.post(url, data, function(resultPictureObj){
		//toc 변경
		const contents = document.getElementById(resultPictureObj.tocId);
		toc.remove(pictureObj);
		toc.add(resultPictureObj);
		
		//marker추가
		picture.addMarker(resultPictureObj, contents);
    })
}

map.init();


