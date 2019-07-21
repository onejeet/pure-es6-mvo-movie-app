

let model = {
    'api_url' : 'http://www.mocky.io/v2/5d336c403400005a00749ff9',
    'data': [],
    'currentList':[],
    'search':'',
    'darkTheme':false,
    'sorting':{
        'value':'',
        'type':'asc'
    },
    'main': document.querySelector('.app main'),
    'moviesContainer': document.querySelector('.list-all'),
    'libraryContainer': document.querySelector('.my-library'),
    'searchInput': document.getElementById('search-movie'),
    'sortingContainer': document.getElementById('sort').parentNode,
    'themeContainer': document.getElementById('theme')
}

let view = {
    init : function(){
        this.toggleCurrentPageState(octopus.findContainer('moviesContainer'));
        this.render();
    },
    toggleCurrentPageState: function(el){
        el.setAttribute('data-state', 'active');
        if(el.nextElementSibling){
            el.nextElementSibling.setAttribute('data-state','inactive');
        }else{
            el.previousElementSibling.setAttribute('data-state','inactive');
        }
    },
    toggleButtonState : function(el, add){
        if(add){
            el.querySelector('.add-button').textContent = 'Added';
            setTimeout(function(){
                el.querySelector('.add-button').textContent = 'Remove';
                el.querySelector('.add-button').className += ' remove';
            }, 300);
        }else{
            el.querySelector('.add-button').textContent = 'Removed';
            setTimeout(function(){
                el.querySelector('.add-button').textContent = 'Add';
                el.querySelector('.add-button').className = 'add-button';
            }, 300);
        }
    
    },
    displaySearchClear: function(bool){
        let el = octopus.findContainer('searchInput');
        if(bool && el.value !== ''){
            el.nextElementSibling.style.opacity = 1;
        }else{
            el.nextElementSibling.style.opacity = 0;
        }
    },
    clearSearch : function(){
        octopus.findContainer('searchInput').value = '';
    },
    cardBuilder: function(movie){
        let card = document.createElement('div');
        card.setAttribute('class','card');
        card.setAttribute('id', movie.id);
        let buttonClass = movie.library ? 'remove' : '';
        let buttonText = movie.library ? 'Remove' : 'Add';
        card.innerHTML = '<div class="thumb"><img src='+movie.poster+'/><button class="add-button '+buttonClass+'">'+buttonText+'</button></div><div class="info"><p>'+movie.title+'</p><p>'+movie.year+'</p></div>';
        return card;
    },
    renderSortingDirector: function(){
        let newNode = document.createElement('button');
        newNode.setAttribute('class','sorting-director');
        newNode.setAttribute('title', 'Toggle the Order');
        newNode.innerHTML = '&varr;';
        octopus.findContainer('sortingContainer').prepend(newNode);
    },
    renderTheme: function(darkTheme){
        let themeContainer = octopus.findContainer('themeContainer'); 
        if(darkTheme){
            themeContainer.className = 'dark'; 
        }else{
            themeContainer.className = ' '; 
        }
    },
    render: function(){
        let list = document.createElement('div');
        let main = octopus.findContainer('main');
        list.setAttribute('id','movies-list');
        octopus.sort();
        let data = octopus.search(octopus.getCurrentList());;
        if(data.length && data.length > 0){
            data.map((movie) => {
                el= this.cardBuilder(movie);
                octopus.bindAddEvents(el, movie);	
                list.appendChild(el);
            });
        }else{
            list.innerHTML="No Movies Found!"
        }      
        main.innerHTML = '';
        main.appendChild(list);
    }
}

let octopus = {
    init: function(){
        this.fetchData();
        this.bindEvents();
    },
    bindEvents: function(){
        this.findContainer('libraryContainer').addEventListener('click', function(e){
            model.currentList = model.data.filter((movie) =>  movie.library);
            view.toggleCurrentPageState(e.target);
            view.render();
        });
        this.findContainer('moviesContainer').addEventListener('click', function(e){
            model.currentList = model.data.filter((movie) =>  !movie.library);
            view.toggleCurrentPageState(e.target);
            view.render();
        });
        this.findContainer('searchInput').addEventListener('input', function(e){
            view.displaySearchClear(true);
            model.search = e.target.value;
            view.render();
        });
        this.findContainer('searchInput').nextElementSibling.addEventListener('click', function(e){
            octopus.clearSearch();
            view.render();
        });
        this.findContainer('sortingContainer').addEventListener('click', function(e){
            if(e.target.className === 'sorting-director'){
                model.sorting.type = model.sorting.type === 'asc' ? 'dsc' : 'asc';
                view.render();
            }else if(e.target.value !== 'none' && model.sorting.value !== e.target.value){
                model.sorting.value = e.target.value;
                view.render();
                if(!this.querySelector('button.sorting-director')){
                    view.renderSortingDirector();
                }     
            }
        });
        this.findContainer('themeContainer').addEventListener('click', function(){
            octopus.toggleTheme(this.className);
        });
    },
    bindAddEvents: function(el, movie){
        el.querySelector('.add-button').addEventListener('click', function(e){
            if(movie.library){
                view.toggleButtonState(el, false);
                octopus.removeFromLibrary(movie);
            }else{
                octopus.addToLibrary(movie); 
                view.toggleButtonState(el, true);
            }   
        });
    },
    toggleTheme: function(){
        model.darkTheme = model.darkTheme ? false : true;
        view.renderTheme(model.darkTheme);
    },
    clearSearch: function(){
        model.search='';
        view.clearSearch();
        view.displaySearchClear(false);
    },
    findContainer: function(key){
        return model[key];
    },
    getCurrentList: function(){
        return model.currentList;
    },
    removeFromLibrary : function(movie){
        movie.library = false;
        if(this.findContainer('libraryContainer').getAttribute('data-state') === "active"){
            model.currentList = model.currentList.filter((movie) =>  movie.library);
            view.render();
        }  
    },
    addToLibrary : function(movie){
        movie.library = true;
    },
    search : function(data){
        let search_string = model.search;
        let filteredData = data.filter((movie) =>  movie.title.toLowerCase().indexOf(search_string.toLowerCase()) !== -1 );
        return filteredData;
    },
    sort: function(){
        let sorting_keyword = model.sorting.value;
        let data = model.currentList;
        let sortedData;
        if(sorting_keyword === 'year'){
            sortedData = data.sort(function(a, b){
                if(model.sorting.type === 'asc'){
                    return b[sorting_keyword] - a[sorting_keyword];
                }else{
                    return a[sorting_keyword] - b[sorting_keyword];
                }
                
            });
        }else if(sorting_keyword === 'title'){
            sortedData = data.sort(function(a, b){
                if(model.sorting.type === 'asc'){
                    return a[sorting_keyword].localeCompare(b[sorting_keyword]);
                }else{
                    return b[sorting_keyword].localeCompare(a[sorting_keyword]);
                }
                
            });
        }else{
            sortedData = data;
        }
        model.currentList = sortedData;
    },
    fetchData: function(){
        fetch(model.api_url)
        .then((response) => response.json())
		.then((data) => {
            model.data = data;
            model.currentList = data;
            view.init();
        })
		.catch((e) => console.log("Error: " + e));
    }
}

octopus.init();