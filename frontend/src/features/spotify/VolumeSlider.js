import ReactSlider from "react-slider"
import {useEffect, useState} from "react"

const VolumeSlider = ({volume, setVolume, setUsingVolumeSlider}) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth)
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <ReactSlider
            min={0}
            max={100}
            className="customSlider"
            trackClassName={windowWidth <= 1000 ? "customSlider-jumbotrack" : "customSlider-track"}
            thumbClassName={windowWidth <= 1000 ? "customSlider-jumbothumb" : "customSlider-thumb"}
            value={volume}
            onChange={(newValue) => {
                setVolume(newValue)
            }}
            onBeforeChange={() => {
                setUsingVolumeSlider(true)
            }}
            onAfterChange={() => {
                setUsingVolumeSlider(false)
            }}
        />
    )
}

export default VolumeSlider
