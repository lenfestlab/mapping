function Filter(key) {
  this.key = key;
  this.value = undefined;
  
  this.update = function () {
    this.value = $("select." + key + "-menu").val()
    
    if (this.value == "Select") {
        this.value = undefined
    }
  }
  
  this.active = function () {
    return this.value != undefined 
  }
  
  this.append = function () {
    $(".map-filters").append('<div class="form-group"><h6>'+ this.key +'</h6><select class="custom-select '+ this.key +'-menu"><option selected>Select</option></select></div>')
  }
}

function DateFilter(key) {
  this.key = key;
  this.value = undefined;
  
  this.update = function () {
    this.value = new Date($('input.' + key + '-date').val());    
  }
  
  this.active = function () {
    return !isNaN(this.value)
  }
  this.append = function () {
    $(".map-filters").append('<div class="form-group"><h5>'+ this.key +'</h5><input type="date" class="form-control '+ this.key +'-date" name="'+ this.key +'date" placeholder="Select Start date"></div>')
  }
}

function FilterManager() {
  this.neighborhoodFilter = new Filter("neighborhoods");
  this.countyFilter = new Filter("counties");
  this.censusFilter = new Filter("census_tracts");
  this.authorFilter = new Filter("authors");
  this.topicFilter = new Filter("topic");
  this.fromFilter = new DateFilter("from");
  this.toFilter = new DateFilter("to");
    
  this.filters = [
    this.neighborhoodFilter,
    this.countyFilter,
    this.censusFilter,
    this.authorFilter,
    this.topicFilter,
    this.fromFilter,
    this.toFilter,
   ]
   
   this.categoryFilters = [
     this.neighborhoodFilter,
     this.countyFilter,
     this.censusFilter,
     this.authorFilter,
     this.topicFilter,
    ]
   
   this.append = function () {
     this.filters.forEach(function (f) {
         f.append();
     });
   }
   
  
   this.update = function () {
     this.filters.forEach(function (f) {
         f.update();
     });
   }
  
   this.active = function () {
     return this.filters.some(function (f) {
         return f.active();
     })
   }

}

var filter = new FilterManager()