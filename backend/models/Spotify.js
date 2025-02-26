const mongoose = require('mongoose')

const spotifySchema = new mongoose.Schema({
    currentSong: {
        type: {
            title: String,
            uri: String,
            image: String,
            artistsOrOwner: [String],
        },
        default: {
            title: '',
            uri: '',
            image: '',
            artistsOrOwner: [''],
        }
    },
    songRequest: {
        type: {
            title: String,
            uri: String,
            image: String,
            artistsOrOwner: [String],
        },
        default: {
            title: '',
            uri: '',
            image: '',
            artistsOrOwner: [''],
        }
    },
    input: {
        type: String,
        default: ''
    },
    searchResults: {
        type: [{
            title: String,
            uri: String,
            image: String,
            artist: String
        }],
        default: []
    },
    requestPlayState: {
        type: Number,
        default: null
    },
    playState: {
        type: Number,
        default: 0
    },
    controlPlayState: {
        type: Number,
        default: 0
    },
    volume: {
        type: Number,
        default: 50
    }
})

module.exports = mongoose.model('Spotify', spotifySchema)