var objects = require('./public/js/core-objects');
var database = require('./database')

var Party = objects.Party;

var party1 = new Party({
	name: 'John\'s Party',
	genreId: 4,
	location: new objects.Location({
        lat: 45.4372639,
        lon: -75.5202383
	}),
	hostPassword: 'root'
});
var party2 = new Party({
    name: 'Martin\'s Party',
    genreId: 2,
    location: new objects.Location({
        lat: 45.4362639,
        lon: -75.5302383
    }),
    hostPassword: 'root'
});

var s1 = new objects.SongInQueue({
        song: new objects.Song({
            trackid: 139156542
        }),
        id: 1
    });
    var s2 = new objects.SongInQueue({
        song: new objects.Song({
            trackid: 139156542
        }),
        id: 2,
        ratioOfUpsToSkips: 40
    });
    var s3 = new objects.SongInQueue({
        song: new objects.Song({
            trackid: 139156542
        }),
        id: 3,
        ratioOfUpsToSkips: -1
    });
    var s4 = new objects.SongInQueue({
        song: new objects.Song({
            trackid: 139156542
        }),
        id: 4,
        ratioOfUpsToSkips: 2
    });
    var s5 = new objects.SongInQueue({
        song: new objects.Song({
            trackid: 139156542
        }),
        id: 5,
        ratioOfUpsToSkips: 0
    });
    var s6 = new objects.SongInQueue({
        song: new objects.Song({
            trackid: 139156542
        }),
        id: 6,
        ratioOfUpsToSkips: 1
    });
    var s7 = new objects.SongInQueue({
        song: new objects.Song({
            trackid: 139156542
        }),
        id: 7,
        ratioOfUpsToSkips: 1
    });
    var s8 = new objects.SongInQueue({
        song: new objects.Song({
            trackid: 139156542
        }),
        id: 8,
        ratioOfUpsToSkips: 2
    });
    var s9 = new objects.SongInQueue({
        song: new objects.Song({
            trackid: 139156542
        }),
        id: 0,
        ratioOfUpsToSkips: 3
    });
        var s10 = new objects.SongInQueue({
        song: new objects.Song({
            trackid: 139156542
        }),
        id: 1,
        ratioOfUpsToSkips: 10
    });
var johnsSongs = [s1];
var martinsSongs = [s9,s10];
party1.addSongsToQueue(johnsSongs);
party2.addSongsToQueue(martinsSongs);

function populate() {
	database.addParty(party1);
    database.addParty(party2);
}

module.exports.populate = populate;