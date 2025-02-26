import os
import time
import certifi
import spotipy
from config import *
from rpi_ws281x import *
from spotipy.oauth2 import *
from threading import Thread
from pymongo import MongoClient
from multiprocessing import Process, Manager

class SpotifyDevice:
    manager = None
    spotifyDevice = None

    @classmethod
    def setup(cls):
        cls.manager = Manager()
        cls.spotifyDevice = cls.manager.Namespace()
        cls.spotifyDevice.spotifyClient = SPOTIFY_CLIENT
        cls.spotifyDevice.spotifySecret = SPOTIFY_SECRET
        cls.spotifyDevice.sp = None
        cls.spotifyDevice.deviceId = None
        cls.spotifyDevice.online = False
    
    @classmethod
    def authenticate(cls):
        authManager = SpotifyOAuth(
            SPOTIFY_CLIENT,
            SPOTIFY_SECRET,
            redirect_uri="http://localhost:8080/callback",
            scope=[
                "user-modify-playback-state",
                "user-read-playback-state",
                "user-read-currently-playing",
                "playlist-read-private",
                "playlist-modify-private",
                "user-read-playback-position",
               ],
            cache_path="/home/mads/Spotify/.cache",
        )
        cls.spotifyDevice.sp = spotipy.Spotify(auth_manager=authManager)
        cls.spotifyDevice.deviceId, cls.spotifyDevice.online = getDeviceId()

def spotifyInit():
    # Setup Spotify
    SpotifyDevice.setup()
    SpotifyDevice.authenticate()
    spAuthProcess = Process(target=spotifyAuth)
    spAuthProcess.start()
    
    # Set up spotify manager
    manageSpotify()

def spotifyAuth():
    while True:
        time.sleep(60)
        SpotifyDevice.authenticate()
        if not SpotifyDevice.spotifyDevice.online:
            os.system("sudo systemctl restart raspotify")

def getState(stateCol):
    state = None
    while state == None:
        try:
            state = stateCol.find_one()
        except:
            db = MongoClient(MDB_CONN_STR, tlsCAFile=certifi.where())['test']
            stateCol = db["spotifies"]
            state = stateCol.find_one()
    return state

def getDeviceId():
    rpiOnline = False
    deviceId = ''
    devices = SpotifyDevice.spotifyDevice.sp.devices()['devices']
    for device in devices:
        if device['name'] == "madspi":
            rpiOnline = True
            deviceId = device['id']
            break
    return deviceId, rpiOnline

def handleSearchResults(stateCol):
    previousSearch = ''
    search = ''
    while True:
        # Get search results for the user's input
        previousSearch = search
        search = getState(stateCol)['input']
        if search != '' and search != previousSearch:
            try:
                searchResults = SpotifyDevice.spotifyDevice.sp.search(search, 3, 0, "track,playlist")
                playlists = searchResults['playlists']['items']
                formattedPlaylists = [{
                    'title': playlist['name'],
                    'uri': playlist['uri'],
                    'image': playlist['images'][0]['url'],
                    'artistsOrOwner': [playlist['owner']['display_name']]
                } for playlist in playlists]

                tracks = searchResults['tracks']['items']
                formattedTracks = [{
                    'title': track['name'],
                    'uri': track['uri'],
                    'image': track['album']['images'][0]['url'],
                    'artistsOrOwner': [artist["name"] for artist in track["artists"]]
                } for track in tracks]

                searchResults = formattedPlaylists + formattedTracks
                stateCol.update_one(getState(stateCol), {'$set': {'searchResults': searchResults}})
            except Exception as e:
                print(f'Failed to search: {e}')
                SpotifyDevice.authenticate()
        elif search == '' and search != previousSearch:
            stateCol.update_one(getState(stateCol), {'$set': {'searchResults': []}})

def handleSongRequests(stateCol):
    while True:
        # Start playing the requested song
        requestSong = getState(stateCol)['songRequest']
        if requestSong['title'] != '':
            try:
                stateCol.update_one(getState(stateCol), {'$set': {
                    'currentSong': requestSong,
                    'songRequest': {'title': '', 'uri': '', 'image': '', 'artistsOrOwner': ''},
                    'playState': 1,
                    'controlPlayState': 0
                }})
                if 'playlist' in requestSong['uri']:
                    SpotifyDevice.spotifyDevice.sp.start_playback(
                        SpotifyDevice.spotifyDevice.deviceId,
                        context_uri=requestSong['uri'],
                        position_ms=0,
                    )
                    SpotifyDevice.spotifyDevice.sp.shuffle(True, SpotifyDevice.spotifyDevice.deviceId)
                    SpotifyDevice.spotifyDevice.sp.next_track(SpotifyDevice.spotifyDevice.deviceId)
                elif 'track' in requestSong['uri']:
                    SpotifyDevice.spotifyDevice.sp.shuffle(False, SpotifyDevice.spotifyDevice.deviceId)
                    SpotifyDevice.spotifyDevice.sp.start_playback(
                        SpotifyDevice.spotifyDevice.deviceId,
                        uris=[requestSong['uri']],
                        position_ms=0,
                    )
                SpotifyDevice.spotifyDevice.sp.repeat("off", SpotifyDevice.spotifyDevice.deviceId)
            except Exception as e:
                print(f'Failed to set song: {e}')
                SpotifyDevice.authenticate()

def handleCurrentSong(stateCol):
    lastCall = time.time()
    while True:
        # Update current song and play state
        state = getState(stateCol)
        currentSong = state['currentSong']
        playState = state['playState']
        if currentSong['title'] != '' and playState == 1 and time.time() - lastCall > 2:
            try:
                current = SpotifyDevice.spotifyDevice.sp.currently_playing()
                if current and "item" in current:
                    song = current["item"]
                    uri = song["uri"]
                    name = song["name"]
                    image = song["album"]["images"][0]["url"]
                    artists = [artist["name"] for artist in song["artists"]]
                    if uri != currentSong['uri']:
                        stateCol.update_one(getState(stateCol), {'$set': {
                            'currentSong': {
                                'title': name,
                                'uri': uri,
                                'image': image,
                                'artistsOrOwner': artists
                            }
                        }})
            except Exception as e:
                print(f'Failed to update current song: {e}')
                SpotifyDevice.authenticate()

def handlePlayState(stateCol):
    lastCall = time.time()
    while True:
        # Pause / Resume
        state = getState(stateCol)
        requestPlayState = state['requestPlayState']
        playState = state['playState']
        if requestPlayState is not None and requestPlayState != playState:
            stateCol.update_one(getState(stateCol), {'$set': {
                'playState': requestPlayState,
                'requestPlayState': None
            }})
            try:
                if requestPlayState == 0:
                    SpotifyDevice.spotifyDevice.sp.transfer_playback(SpotifyDevice.spotifyDevice.deviceId, force_play=False)
                    SpotifyDevice.spotifyDevice.sp.pause_playback(SpotifyDevice.spotifyDevice.deviceId)
                elif requestPlayState == 1:
                    SpotifyDevice.spotifyDevice.sp.transfer_playback(SpotifyDevice.spotifyDevice.deviceId, force_play=True)
            except Exception as e:
                print(f'Failed to set play state: {e}')
                SpotifyDevice.authenticate()
        elif time.time() - lastCall > 5:
            lastCall = time.time()
            try:
                current = SpotifyDevice.spotifyDevice.sp.currently_playing()
                globalPlayState = current['is_playing']
                stateCol.update_one(getState(stateCol), {'$set': {'playState': int(globalPlayState)}})
            except Exception as e:
                print(f'Failed to get global play state: {e}')
                SpotifyDevice.authenticate()

def handleControlPlayState(stateCol):
    while True:
        # Prev / Next
        
        requestControlPlayState = getState(stateCol)['controlPlayState']
        if requestControlPlayState is not None:
            if requestControlPlayState == 1:
                try:
                    SpotifyDevice.spotifyDevice.sp.transfer_playback(SpotifyDevice.spotifyDevice.deviceId, force_play=True)
                    SpotifyDevice.spotifyDevice.sp.next_track(SpotifyDevice.spotifyDevice.deviceId)
                    stateCol.update_one(getState(stateCol), {'$set': {'controlPlayState': 0, 'requestPlayState': None, 'playState': 1}})
                except Exception as e:
                    print(f'Failed to skip: {e}')
                    SpotifyDevice.authenticate()
            elif requestControlPlayState == -1:
                try:
                    SpotifyDevice.spotifyDevice.sp.transfer_playback(SpotifyDevice.spotifyDevice.deviceId, force_play=True)
                    SpotifyDevice.spotifyDevice.sp.previous_track(SpotifyDevice.spotifyDevice.deviceId)
                    stateCol.update_one(getState(stateCol), {'$set': {'controlPlayState': 0, 'requestPlayState': None, 'playState': 1}})
                except Exception as e:
                    print(f'Failed to go back: {e}')
                    SpotifyDevice.authenticate()

def manageSpotify():
    db = MongoClient(MDB_CONN_STR, tlsCAFile=certifi.where())['test']
    stateCol = db["spotifies"]
    
    threads = [
        Thread(target=handleSearchResults, args=(stateCol,)),
        Thread(target=handleSongRequests, args=(stateCol,)),
        Thread(target=handleCurrentSong, args=(stateCol,)),
        Thread(target=handlePlayState, args=(stateCol,)),
        Thread(target=handleControlPlayState, args=(stateCol,))
    ]
    
    for thread in threads:
        thread.start()