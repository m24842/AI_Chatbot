import os
import time
import certifi
from config import *
from rpi_ws281x import *
from openai import OpenAI
from spotipy.oauth2 import *
from pymongo import MongoClient
from multiprocessing import Manager, Process, Queue
from ai.aiTools import *
from audio.audioIn import *
from audio.audioOut import *
from audio.audioControl import *
from lights.ringLight import *
from music.spotifySupport import *
from tactile.inputHandler import *
from web.webInterfaceSupport import *

if __name__ == "__main__":
    # Init
    buttonPresses = tactileInit()
    audioOutInit(buttonPresses)
    pixels, lightsUsageStatus, sleepLightsState, currentColor, onOff = lightsInit()
    spotifyInit()
    stateCol = webInit()
    audio, volLevelVerbal, volLevelButton, volQueue = volControlInit(stateCol, pixels, lightsUsageStatus, sleepLightsState, currentColor)
    recorder = audioInInit()
    # Conversation memory
    messages = []
    # Set name that listens for
    name = NAME
    print("Hi, my name is " + name)
    lights = Process(
        target=lightsControl, args=(pixels, onOff, lightsUsageStatus, sleepLightsState)
    )
    lightsUsageStatus.put(True)
    lights.start()
    convertToSpeech("Hi my name is " + name)
    onOff.put("lightsOff")
    lightsUsageStatus.put(False)

    while True:
        # Wait for action button to reset before continuing
        while readInputs() == "action":
            pass
        # Listen for wakeword
        manager = Manager()
        return_dict = manager.dict()
        listen = Process(
            target=listenForKeyWord,
            args=(
                recorder,
                audio,
                pixels,
                name,
                messages,
                volLevelVerbal,
                volLevelButton,
                volQueue,
                return_dict,
                lightsUsageStatus,
                sleepLightsState,
            ),
        )
        listen.start()
        # Wake on action button
        physicalInput = False
        awaking = False
        while listen.is_alive():
            if readInputs() == "action":
                skipInput = False
                # Check for sleep request
                tryingToSleep = False
                holdStart = time.time()
                while (readInputs() == "action"):
                    if time.time() - holdStart >= 1:
                        tryingToSleep = True
                    if time.time() - holdStart >= 2:
                        # Turn lights red to signify sleeping
                        listen.terminate()
                        checkSleep = False
                        print("Sleeping . . .")
                        sleep = Process(target=convertToSpeech, args=("Sleeping",))
                        sleep.start()
                        lightsUsageStatus.put("sleep")
                        sleepLightsOn = Process(
                            target=sleepLights,
                            args=(pixels, sleepLightsState, currentColor),
                        )
                        sleepLightsOn.start()
                        sleep = True
                        while readInputs() == "action":
                            pass
                        # Start sleeping
                        while sleep:
                            if readInputs() == "action":
                                tryingToWake = False
                                # Check for awake request
                                if (readInputs() == "action"):
                                    holdStart = time.time()
                                    awake = True
                                    while time.time() - holdStart < 2:
                                        if time.time() - holdStart >= 1:
                                            tryingToWake = True
                                        if readInputs() != "action":
                                            awake = False
                                            break
                                    if awake:
                                        sleepLightsState.put("off")
                                        for i in range(pixels.numPixels())[::-1]:
                                            pixels.setPixelColor(i, Color(0, 0, 0))
                                            pixels.show()
                                            time.sleep(5 / 1000.0)
                                        # Turn on lights briefly to signify awake
                                        sleep = False
                                        awaking = True
                                        print("Awake")
                                        awake = Process(
                                            target=convertToSpeech, args=("Awake",)
                                        )
                                        onOff = Queue()
                                        lights = Process(
                                            target=lightsControl,
                                            args=(
                                                pixels,
                                                onOff,
                                                lightsUsageStatus,
                                                sleepLightsState,
                                            ),
                                        )
                                        lights.start()
                                        awake.start()
                                    while readInputs() == "action":
                                        pass
                                    onOff.put("lightsOff")
                                if not tryingToWake:
                                    double = False
                                    triple = False
                                    doubleClickStart = time.time()
                                    while time.time() - doubleClickStart < 0.5:
                                        pass
                                        if readInputs() == "action":
                                            double = True
                                            break
                                    while readInputs() == "action":
                                        pass
                                    tripleClickStart = time.time()
                                    while time.time() - doubleClickStart < 0.5:
                                        pass
                                        if readInputs() == "action":
                                            triple = True
                                            break
                                    # Skip if triple clicked
                                    if triple:
                                        state = stateCol.find_one()
                                        stateCol.update_one(state, {'$set': {'controlPlayState': 1}})
                                        print("Skipping song . . .")
                                    # Pause/Resume if double clicked
                                    elif double:
                                        state = stateCol.find_one()
                                        if state['playState'] == 1:
                                            stateCol.update_one(state, {'$set': {'requestPlayState': 0}})
                                            print("Pausing . . .")
                                        else:
                                            stateCol.update_one(state, {'$set': {'requestPlayState': 1}})
                                            print("Resuming . . .")
                        while readInputs() == "action":
                            pass
                        onOff.put("lightsOff")
                        skipInput = True
                if not tryingToSleep:
                    double = False
                    triple = False
                    doubleClickStart = time.time()
                    while time.time() - doubleClickStart < 0.5:
                        pass
                        if readInputs() == "action":
                            double = True
                            break
                    while readInputs() == "action":
                        pass
                    tripleClickStart = time.time()
                    while time.time() - doubleClickStart < 0.5:
                        pass
                        if readInputs() == "action":
                            triple = True
                            break
                    # Skip if triple clicked
                    if triple:
                        db = MongoClient(MDB_CONN_STR, tlsCAFile=certifi.where())['test']
                        stateCol = db["spotifies"]
                        state = stateCol.find_one()
                        stateCol.update_one(state, {'$set': {'controlPlayState': 1}})
                        print("Skipping song . . .")
                    # Pause/Resume if double clicked
                    elif double:
                        state = stateCol.find_one()
                        if state['playState'] == 1:
                            stateCol.update_one(state, {'$set': {'requestPlayState': 0}})
                            print("Pausing . . .")
                        else:
                            stateCol.update_one(state, {'$set': {'requestPlayState': 1}})
                            print("Resuming . . .")
                    elif not skipInput:
                        listen.terminate()
                        physicalInput = True
                        break
        # Check if the user wants to terminate the program
        try:
            if awaking:
                continue
        except:
            pass
        if not physicalInput:
            listen.join()
            messages = return_dict.values()[0]
        # Temporarily pause any songs currently playing to listen to user
        # Connect to MongoDB
        state = None
        while state == None:
            try:
                state = stateCol.find_one()
            except:
                db = MongoClient(MDB_CONN_STR, tlsCAFile=certifi.where())['test']
                stateCol = db["spotifies"]
                state = stateCol.find_one()
        originalState = state['playState'] == 1
        try:
            stateCol.update_one(state, {'$set': {'requestPlayState': 0}})
            while stateCol.find_one()['playState'] == 1:
                pass
        except:
            pass
        # Turn on lights to signify listening
        onOff = Queue()
        lights = Process(
            target=lightsControl,
            args=(pixels, onOff, lightsUsageStatus, sleepLightsState),
        )
        lights.start()

        # Listen for a prompt
        manager = Manager()
        return_dict = manager.dict()
        listenPrompt = Process(target=listenForPrompt, args=(recorder, return_dict))
        listenPrompt.start()
        print("I'm listening . . .", end="\r")
        convertToSpeech("I'm listening")
        # Cancel on action button
        cancelled = False
        while listenPrompt.is_alive():
            if readInputs() == "action":
                listenPrompt.terminate()
                print("Cancelled", end="\r")
                convertToSpeech("Cancelling")
                cancelled = True
                break
        # Turn lights off to signify prompt recieved and generating response
        onOff.put("lightsOff")
        # Don't respond if chat cancelled through action button
        if cancelled:
            # Resume any songs that were paused while listening for prompt
            if originalState:
                state = None
                while state == None:
                    try:
                        state = stateCol.find_one()
                    except:
                        db = MongoClient(MDB_CONN_STR, tlsCAFile=certifi.where())['test']
                        stateCol = db["spotifies"]
                        state = stateCol.find_one()
                try:
                    stateCol.update_one(state, {'$set': {'requestPlayState': 1}})
                except:
                    pass
            continue
        # Retrieve prompt in text form
        listenPrompt.join()
        text = return_dict.values()[0]
        # Don't respond if chat cancelled verbally
        cancelled = text == "cancel"
        print("Me: " + text)

        if not cancelled:
            # Send prompt to ChatGPT
            responseText = sendPrompt(messages, text)
            messages.append(responseText)
            print(name[0].upper() + name[1:] + ": " + responseText)

            # Split response into sentences
            responseSentences = splitIntoSentences(responseText)
            # Turn lights on to signify start of response
            onOff = Queue()
            lights = Process(
                target=lightsControl,
                args=(pixels, onOff, lightsUsageStatus, sleepLightsState),
            )
            lights.start()
            # Start responding
            response = Process(target=respond, args=(responseSentences,))
            response.start()
            # Stop responding on action button
            while response.is_alive():
                if readInputs() == "action":
                    response.terminate()
                    os.system("killall mpg123")
                    break
            onOff.put("lightsOff")
        
        # Resume any songs that were paused while listening for prompt
        if originalState:
            state = None
            while state == None:
                try:
                    state = stateCol.find_one()
                except:
                    db = MongoClient(MDB_CONN_STR, tlsCAFile=certifi.where())['test']
                    stateCol = db["spotifies"]
                    state = stateCol.find_one()
            try:
                stateCol.update_one(state, {'$set': {'requestPlayState': 1}})
            except:
                pass
