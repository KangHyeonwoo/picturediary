class Toc {
    #dataGroupId = 'data-group';
    #tempGroupId = 'temp-group';
    #group = {
		data : [],
		temp : []
	};
    static #CONTEXT_MENU = {
        rename : {
            type : 'all',
            label : '이름 변경',
            onClick : function(pictureObj) {
				Toc.#renderRename(pictureObj);
				picture.rename(pictureObj);
            }
        },
        remove : {
            type : 'all',
            label : '파일 삭제',
            onClick : function(pictureObj) {
				picture.remove(pictureObj);
            }
        },
        addGeometry : {
            type : 'noGeometry',
            label : '좌표 추가',
            onClick : function(pictureObj) {
				picture.addGeometry(pictureObj);
            }
        },
		get : function(hasGeometry) {
			const type = (hasGeometry ? 'geometry' : 'noGeometry');
			const types = ['all', type];
			
			return Object.keys(this)
				.filter(key => typeof this[key] == 'object')
				.filter(key => types.includes(this[key]['type']))
				.map(key => this[key]);
		}
    }

    constructor() {
		document.addEventListener('click', Toc.#removeContextMenu, false);
    }


    add(pictureObj) {
		const dataGroup = document.getElementById(this.#dataGroupId);
	    const tempGroup = document.getElementById(this.#tempGroupId);
	
	    const li = document.createElement('li');
	    li.id = pictureObj.tocId;
		li.className = 'toc-object';
	    li.innerText = ((pictureObj.pictureName == '' || pictureObj.pictureName == null)? pictureObj.pictureOriginName : pictureObj.pictureName);
		
		li.addEventListener('contextmenu', function(event){
			event.preventDefault();
			Toc.#removeContextMenu();
			Toc.#addContextMenu(event ,pictureObj);
		})
		
		if(pictureObj.hasGeometry) {
			dataGroup.appendChild(li);
			this.#group.data.push(picture);
		} else {
			tempGroup.appendChild(li);
			this.#group.temp.push(picture);
		}
		
		return li;
    }

	clicked() {
		debugger;
	}

    remove(tocObj) {
		//TOC목록에서 제거(view)
    }

	static #addContextMenu(event, pictureObj) {
		const ctxMenuId = 'toc_context';
	    const ctxMenu = document.createElement('div');
		
		ctxMenu.id = ctxMenuId;
		ctxMenu.className = 'context-menu';
		ctxMenu.style.top = event.pageY+'px';
		ctxMenu.style.left = event.pageX+'px';
		
		ctxMenu.appendChild(Toc.#renderContextMenuList(pictureObj));
		
		document.body.appendChild(ctxMenu);
	}

	static #renderContextMenuList(pictureObj) {
		const ctxMenuList = document.createElement('ul');
	    ctxMenuList.className = 'context-ul'
		
		Toc.#CONTEXT_MENU.get(pictureObj.hasGeometry).forEach(function(item){
			const ctxMenuItem = document.createElement('li');
			const ctxMenuItem_a = document.createElement('a');
			const ctxMenuItem_a_text = document.createTextNode(item.label);
	
			if( item.onClick ){
				ctxMenuItem.addEventListener( 'click', function(){
					item.onClick(pictureObj);
				}, false);
			}

			ctxMenuItem_a.appendChild( ctxMenuItem_a_text );
			ctxMenuItem.appendChild( ctxMenuItem_a );
			ctxMenuList.appendChild( ctxMenuItem );
		});
	        
		return ctxMenuList;
	}

	static #removeContextMenu() {
		const prevCtxMenu = document.getElementsByClassName('context-menu');
		for(let i=0; i<prevCtxMenu.length; i++) {
			prevCtxMenu[i].remove();
		}
	}
	
	static #renderRename(pictureObj) {
		console.log(pictureObj);
		const contents = document.getElementById(pictureObj.tocId);
		
		const div = document.createElement('div');
		const text = document.createElement('input');
		text.type = 'text';
		text.id = 'rename';
		
		const button = document.createElement('button');
		button.type = 'button';
		button.innerText = '확인';
		button.addEventListener('click', function(event){
			console.log(event);
		}, false)
		
		div.appendChild(text);
		div.appendChild(button);
		
		contents.innerHTML = '';
		contents.appendChild(div);
	}
	
	static #cancelRename() {
		
	}
	
}

