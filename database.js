var Database = function() {
	var that = this;

	var genres = {
		0: new Genre({
			name: 'Top 40',
			id: 0
		}),
		1: new Genre({
			name: 'Hip-hop',
			id: 1
		}),
		2: new Genre({
			name: 'Rap',
			id: 2
		}),
		3: new Genre({
			name: 'Pop',
			id: 3
		})
	}

	var currentPartyId = 0;
	var parties = {

	}

	this.addParty = function(party) {
		currentPartyId++;
		party.id = currentPartyId;
		parties[currentPartyId] = party;
	}

	this.getParties = function() {
		return parties;
	}

	this.getParty = function(id) {
		return parties[id];
	}

	this.getGenre = function(id) {
		return genres[id];
	}

	this.getGenres = function(id) {
		return genres;
	}
}

Database.instance = null;
Database.getInstance = function(){
    if(this.instance === null){
        this.instance = new Database();
    }
    return this.instance;
}

module.exports = Database.getInstance();