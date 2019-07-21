

let model = {
    'api_url' : 'http://www.mocky.io/v2/5d336c403400005a00749ff9',
    'data': [],
    'state':{
        'currentList':[],
        'search':'',
        'darkTheme':false,
        'sortType':'asc',
        'sortValue':''
    },
    'main': document.querySelector('.app main'),
    'moviesContainer': document.querySelector('.list-all'),
    'libraryContainer': document.querySelector('.my-library'),
    'searchInput': document.getElementById('search-movie'),
    'sortingContainer': document.getElementById('sort'),
    'themeContainer': document.getElementById('theme')
}

let view = {
    init : function(){
        this.toggleCurrentPageState(octopus.findContainer('moviesContainer'));
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
        octopus.findContainer('sortingContainer').parentNode.prepend(newNode);
    },
    renderTheme: function(darkTheme){
        let themeContainer = octopus.findContainer('themeContainer'); 
        if(darkTheme){
            themeContainer.setAttribute('title', 'Turn On Light Mode');
            document.querySelector('body').className = "dark"
        }else{
            themeContainer.setAttribute('title', 'Turn On Dark Mode');
            document.querySelector('body').className = ""
        }
    },
    render: function(){
        let list = document.createElement('div');
        let main = octopus.findContainer('main');
        list.setAttribute('id','movies-list');
        let data = octopus.sort();
        data = octopus.search(data);;
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
        this.store = this.createStore();
    },
    createStore : function(){
        return new Proxy(model.state, this.handleStateChange);
    },
    handleStateChange: {
        set: function(target, key, value){
            target[key] = value;
            if(key === 'darkTheme'){
                view.renderTheme(value);
            }else{
                view.render();
            }
        },
        get: function(target, key){
            return target[key];
        }
    },
    bindEvents: function(){
        this.findContainer('libraryContainer').addEventListener('click', function(e){
            view.toggleCurrentPageState(e.target);
            octopus.store.currentList = model.data.filter((movie) =>  movie.library);
        });
        this.findContainer('moviesContainer').addEventListener('click', function(e){
            view.toggleCurrentPageState(e.target);
            octopus.store.currentList = model.data.filter((movie) =>  !movie.library);
        });
        this.findContainer('searchInput').addEventListener('input', function(e){
            view.displaySearchClear(true);
            octopus.store.search = e.target.value;
        });
        this.findContainer('searchInput').nextElementSibling.addEventListener('click', function(e){
            octopus.clearSearch();
        });
        this.findContainer('sortingContainer').addEventListener('change', function(e){
            if(e.target.value !== 'none'&& octopus.store.sortValue !== e.target.value){
                octopus.store.sortValue = e.target.value;
                if(!this.previousElementSibling){
                    view.renderSortingDirector();
                    this.previousElementSibling.addEventListener('click', function(){
                        octopus.store.sortType = octopus.store.sortType === 'asc' ? 'dsc' : 'asc';
                    });
                }     
            }
        });
        this.findContainer('themeContainer').addEventListener('click', function(){
            octopus.toggleTheme();
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
        octopus.store.darkTheme = octopus.store.darkTheme ? false : true;  
    },
    clearSearch: function(){
        octopus.store.search='';
        view.clearSearch();
        view.displaySearchClear(false);
    },
    findContainer: function(key){
        return model[key];
    },
    getCurrentList: function(){
        return octopus.store.currentList;
    },
    removeFromLibrary : function(movie){
        movie.library = false;
        if(this.findContainer('libraryContainer').getAttribute('data-state') === "active"){
            octopus.store.currentList = octopus.store.currentList.filter((movie) =>  movie.library);
        }  
    },
    addToLibrary : function(movie){
        movie.library = true;
    },
    search : function(data){
        let search_string = octopus.store.search;
        let filteredData = data.filter((movie) =>  movie.title.toLowerCase().indexOf(search_string.toLowerCase()) !== -1 );
        return filteredData;
    },
    sort: function(){
        let sorting_keyword = octopus.store.sortValue;
        let data = octopus.store.currentList;
        let sortedData;
        if(sorting_keyword === 'year'){
            sortedData = data.sort(function(a, b){
                if(octopus.store.sortType === 'asc'){
                    return b[sorting_keyword] - a[sorting_keyword];
                }else{
                    return a[sorting_keyword] - b[sorting_keyword];
                }
                
            });
        }else if(sorting_keyword === 'title'){
            sortedData = data.sort(function(a, b){
                if(octopus.store.sortType === 'asc'){
                    return a[sorting_keyword].localeCompare(b[sorting_keyword]);
                }else{
                    return b[sorting_keyword].localeCompare(a[sorting_keyword]);
                }
                
            });
        }else{
            sortedData = data;
        }
        return sortedData;
    },
    fetchData: function(){
        fetch(model.api_url)
        .then((response) => response.json())
		.then((data) => {
           model.data = data;
            this.store.currentList = data;
            view.init();
        })
		.catch((e) => console.log("Error: " + e));
    }
}

octopus.init();