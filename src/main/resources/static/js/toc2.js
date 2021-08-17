export default class Toc {
	
	#regionGroup = new Map();
	#timeGroup = new Map();
	
	constructor() {
		const tocHeader = document.getElementById('toc.header');
		const menus = tocHeader.getElementsByTagName('li');
		const tocRegion = document.getElementById('toc.region');
		const tocRegionItems = document.getElementById('toc.region.items');
		const tocTime = document.getElementById('toc.time');
		const tocTimeItems = document.getElementById('toc.time.items');
		
		//TOC 헤더에 있는 버튼 이벤트 부여
		Array.from(menus).forEach(menu => {
			menu.addEventListener('click', event => this.#headerToggle(event, menus))
			menu.addEventListener('click', event => this.#changeTocBody(event, menus))
		});
		
		//그룹 > 뒤로가기 버튼 클릭 이벤트
		const goRegionGroupButton = document.getElementById('goRegionGroupButton');
		goRegionGroupButton.addEventListener('click', () => {
			tocRegion.classList.remove('hidden')
			tocRegionItems.classList.add('hidden')
		});
		
		const goTimeGroupButton = document.getElementById('goTimeGroupButton');
		goTimeGroupButton.addEventListener('click', () => {
			tocTime.classList.remove('hidden')
			tocTimeItems.classList.add('hidden')
		});
	}
	
	/* Public Methods */
	
	//TOC 객체 그리기
	addContent(pictureObj) {
		if(pictureObj.hasGeometry) {
			this.#drawContentInAllToc(pictureObj);		//전체
		} else {
			this.#drawContentInUnregistToc(pictureObj);	//미등록
		}
		
		this.#drawContentInRegionToc(pictureObj);		//지역별
		this.#drawContentInTimeToc(pictureObj);			//시간별
	}
	
	add() {
		
	}
	
	remove() {

		
	}
	
	
	/* Private Methods */
	
	//TOC 버튼 클릭할 때 버튼 CSS 변경하기
	#headerToggle(event, menus) {
		Array.from(menus).forEach(menu => {
			menu.classList.remove('active');
		})
		
		const li = event.currentTarget;
		li.classList.add('active');
	}
	
	//TOC 버튼 클릭할 때 BODY 변경하기
	#changeTocBody(event) {
		const menuId = event.currentTarget.id;
		const tocId = menuId.replace('menu', 'toc');
		const targetTocBody = document.getElementById(tocId);
		const tocBodies = document.getElementById('toc.body').children;
		
		Array.from(tocBodies).forEach(tocBody => {
			const hiddenContains = tocBody.classList.contains('hidden');
			
			if(!hiddenContains) {
				tocBody.classList.add('hidden');
			}
			
			if(tocBody === targetTocBody) {
				tocBody.classList.remove('hidden');
			}
		})
	}
	
	//Item Div 그리기
	#getTocItem(pictureObj) {
		const itemDiv = document.createElement('div');
			  itemDiv.classList.add('item');
		
		const itemInfoDiv = document.createElement('div');
			  itemInfoDiv.classList.add('item-info');
		
		const picture = document.createElement('img');
			  picture.classList.add('picture');
			  picture.src = `/picture/images/${pictureObj.pictureOriginName}.${pictureObj.extension}`;
		itemDiv.appendChild(picture);
		
		const titlePTag = document.createElement('p');
			  titlePTag.classList.add('title');
			  titlePTag.innerText = (pictureObj.pictureName ? pictureObj.pictureName : pictureObj.pictureOriginName);
		itemInfoDiv.appendChild(titlePTag);
		
		const addressPTag = document.createElement('p');
			  addressPTag.innerText = pictureObj.address;
		itemInfoDiv.appendChild(addressPTag);
			
		const timePTag = document.createElement('p');
			  timePTag.innerText = pictureObj.refinePictureDate;
		itemInfoDiv.appendChild(timePTag);
		
		const itemButtonDiv = document.createElement('div');
			  itemButtonDiv.classList.add('item-button');
		
		const moreButton = document.createElement('button');
		moreButton.classList.add('btn-more');
		moreButton.addEventListener('click', event => {
			console.log(event.currentTarget);
		})
		
		itemButtonDiv.appendChild(moreButton);
		
		itemDiv.appendChild(itemInfoDiv);
		itemDiv.appendChild(itemButtonDiv);
		
		return itemDiv;
	}
	
	//전체 TOC Content 그리기
	#drawContentInAllToc(pictureObj) {
		const tocAll = document.getElementById('toc.all');
		const itemDiv = this.#getTocItem(pictureObj);
		
		tocAll.appendChild(itemDiv);
	}
	
	//미등록 TOC Content 그리기
	#drawContentInUnregistToc(pictureObj) {
		const tocUnregist = document.getElementById('toc.unregist');
		const itemDiv = this.#getTocItem(pictureObj);
		
		tocUnregist.appendChild(itemDiv);
	}
	
	//지역별 TOC Content 그리기 (그룹)
	#drawContentInRegionToc(pictureObj) {
		const key = this.#extractRegionGroupKey(pictureObj);
		const collection = this.#regionGroup.get(key);
		
		if(!collection) {
			this.#regionGroup.set(key, [pictureObj]);
			const itemGroup = this.#drawTocItemGroup('region', key)
		} else {
			collection.push(pictureObj);
		}
		
		const tocRegion = document.getElementById('toc.region');
		const groupItems = tocRegion.getElementsByClassName('item-group');
		for(let i=0; i<groupItems.length; i++) {
			if(groupItems[i].getElementsByClassName('title')[0].innerText === key) {
				const countEl = groupItems[i].getElementsByClassName('count')[0];
				const count = this.#regionGroup.get(key).length;
				countEl.innerText = `개수 : ${count}개`;
				
				break;
			}
		}
	}
	
	//지역별 TOC 그룹 Map객체의 키 조회
	#extractRegionGroupKey(pictureObj) {
		let key = '';
		
		if(pictureObj.address === null) {
			key = pictureObj.refineAddress;
		} else {
			const address = pictureObj.refineAddress.split(' ');
			key = `${address[0]} ${address[1]}`;
		}
		
		return key;
	}
	
	//시간별 TOC Content 그리기 (그룹)
	#drawContentInTimeToc(pictureObj) {
		const key = this.#extractTimeGroupKey(pictureObj);
		const collection = this.#timeGroup.get(key);
		
		if(!collection) {
			this.#timeGroup.set(key, [pictureObj]);
			const itemGroup = this.#drawTocItemGroup('time', key)
		} else {
			collection.push(pictureObj);
			
			
			
			
		}
	}
	
	//시간별 TOC 그룹 Map객체의 키 조회
	#extractTimeGroupKey(pictureObj) {
		const dates = pictureObj.refinePictureDate.split('-');
		const key = dates.length > 1 ? `${dates[0]}년 ${dates[1]}월` : dates[0];
		
		return key;
	}
	
	//TOC Group 그리기
	#drawTocItemGroup(type, key) {
		const that = this;
		const tocGroup = document.getElementById(`toc.${type}`);
		const groupMap = (type === 'region' ? this.#regionGroup : this.#timeGroup);
		const itemGroup = document.createElement('div');
			  itemGroup.classList.add('item-group');
	
		const img = document.createElement('span');
			  img.classList.add('info-folder');
		itemGroup.appendChild(img);
		
		const titleDiv = document.createElement('p');
		titleDiv.classList.add('title');
		titleDiv.innerText = key;
		titleDiv.onclick = function(){
			const items = groupMap.get(key);
			that.#drawTocItemsInGroup(type, items);
		}
		
		itemGroup.appendChild(titleDiv);
		
		const countDiv = document.createElement('p');
			  countDiv.classList.add('count');
			  countDiv.innerText = `개수 : 1개`;
		itemGroup.appendChild(countDiv);
		
		tocGroup.appendChild(itemGroup);
		
		return itemGroup
	}

	//TOC 그룹 내 리스트 그리기
	#drawTocItemsInGroup(type, items) {
		const tocGroup = document.getElementById(`toc.${type}`);
		tocGroup.classList.add('hidden');
		
		const groupItems = document.getElementById(`toc.${type}.items`);
		const childrens = groupItems.getElementsByClassName('item');
		
		//기존객체들지우기
		Array.from(childrens).forEach(children => {
			groupItems.removeChild(children);
		})
		
		items
			.map(item => this.#getTocItem(item))
			.forEach(itemDiv => groupItems.appendChild(itemDiv));
		
		groupItems.classList.remove('hidden');
	}
}