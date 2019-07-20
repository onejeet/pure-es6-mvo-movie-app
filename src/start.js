

let model = {
    'api_url' : 'http://www.mocky.io/v2/5d321d223300006b007ba592',
    'data': [],
    'library': [],
    'currentList': ''
}

let view = {
    init : function(){

    },
    cardBuilder: function(movie){
        let card = document.createElement('div');
        card.setAttribute('class','card');
        card.setAttribute('id', movie.id);
        let buttonState = movie.library ? 'remove' : '';
        let buttonText = movie.library ? 'Remove' : 'Add';
        card.innerHTML = '<div class="thumb"><img src='+movie.poster+'/><button class="add-button '+buttonState+'">'+buttonText+'</button></div><div class="info"><p>'+movie.title+'</p><p>'+movie.year+'</p></div>';
        return card;
    },
    render: function(data){
        let app = document.querySelector('.app main');
        let list = document.createElement('div');
        list.setAttribute('id','movie-list');
        if(data.length > 0){
            data.map((movie) => {
                el= this.cardBuilder(movie);
                octopus.bindAddEvents(el, movie);	
                list.appendChild(el);
            });
        }else{
            list.innerHTML="Library has no movies. Start Adding!"
        }      
        app.innerHTML = '';
        app.appendChild(list);
    }
}

let octopus = {
    init: function(){
        this.fetchData();
        this.bindEvents();
    },
    bindEvents: function(){
        document.querySelector('.my-library').addEventListener('click', function(){
            view.render(model.library);
            model.currentList = 'library';
        });
        document.querySelector('.add-movies').addEventListener('click', function(){
            view.render(model.data);
            model.currentList = 'data';
        });
        document.getElementById('search-movie').addEventListener('input', function(e){
            octopus.search(this.value);
        });
        document.getElementById('sort').addEventListener('change', function(e){
            octopus.sort(this.value);
        });
    },
    bindAddEvents: function(el, movie){
        el.addEventListener('click', function(e){
            if(movie.library){
                octopus.removeFromLibrary(el, movie);
            }else{
                octopus.addToLibrary(el, movie); 
            }   
        });
    },
    updateData: function(data){
        model.data = data;
        view.render(data); 
        model.currentList = 'data';
    },
    removeFromLibrary : function(el, movie){
        model.library.some((movie, i) => {
            if(movie.id === movie.id){
                model.library.splice(i,1);
                return true;
            }
            return false;
        });
        el.querySelector('.add-button').textContent = 'Removed';
        setTimeout(function(){
            el.querySelector('.add-button').textContent = 'Add';
            el.querySelector('.add-button').className = 'add-button';
        }, 400);
        if(model.currentList === 'library'){
            view.render(model.library);
        }
        this.toggleButtonState(movie, false);
    },
    addToLibrary : function(el, movie){
        model.library.push(movie);
        el.querySelector('.add-button').textContent = 'Added';
        setTimeout(function(){
            el.querySelector('.add-button').textContent = 'Remove';
            el.querySelector('.add-button').className += ' remove';
        }, 400);
        this.toggleButtonState(movie, true);
    },
    search : function(val){  
        console.log(val);
        let filteredData = model[model.currentList].filter((movie) => movie.title.toLowerCase().indexOf(val.toLowerCase()) !== -1 );
        view.render(filteredData);
    },
    sort: function(sorting_keyword){
        console.log(sorting_keyword);
        let sortedData;
        if(sorting_keyword === 'year'){
            sortedData = model[model.currentList].sort(function(a, b){
                return b[sorting_keyword] - a[sorting_keyword];
            });
        }else{
            sortedData = model[model.currentList].sort(function(a,b){
                return a[sorting_keyword].localeCompare(b[sorting_keyword]);
            });
        }
    
        console.log(sortedData);
        view.render(sortedData);
    },
    toggleButtonState : function(movie, bool){
        if(bool){
            movie.library = true;
        }else{
            movie.library = false;
        }
    },
    fetchData: function(){
        fetch(model.api_url)
        .then((response) => response.json())
		.then((data) => {
            octopus.updateData(data);
        })
		.catch((e) => console.log("Error: " + e));
    }
}

octopus.init();