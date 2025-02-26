import {useState, useEffect, useRef} from 'react'

const SearchResult = ({ result, setSongRequest, setInput, setShowSearchBar, searchResults, setShowSearchResults, selectedSearchResult, setSelectedSearchResult, formatArtists }) => {
    const [hover, setHover] = useState(false)
    
    const handleClick = () => {
        setSongRequest(result)
        setInput('')
        setShowSearchBar(false)
        setShowSearchResults(false)
        setSelectedSearchResult(0)
    }

    let searchResult
    if (selectedSearchResult === searchResults.indexOf(result)) {
        if (result.uri.includes("playlist")) {
            searchResult = (
                <button
                    className="selectedPlaylistButton"
                    title={`${result.title} by ${formatArtists(result.artistsOrOwner)}`}
                    onClick={handleClick}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '16px',
                            fontWeight: 'bolder',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                        }}>
                        <img src={result.image} alt="" style={{
                            height: '2.5em',
                            borderRadius: '10px',
                            marginRight: '5px',
                            width: '2.5em',
                            zIndex: '999',
                        }}/>
                        <div className={result.title.length > 15 ? 'scrollingSongTitle' : 'songTitle'}>{result.title}</div>
                    </div>
                </button>
            )
        } else {
            searchResult = (
                <button
                    className="selectedSongButton"
                    title={`${result.title} by ${formatArtists(result.artistsOrOwner)}`}
                    onClick={handleClick}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '16px',
                            fontWeight: 'bolder',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                        }}>
                        <img src={result.image} alt=""
                            style={{
                                height: '2.5em',
                                borderRadius: '10px',
                                marginRight: '5px',
                                width: '2.5em',
                                zIndex: '999',
                            }}/>
                        <div className={result.title.length > 15 ? 'scrollingSongTitle' : 'songTitle'}>{result.title}</div>
                    </div>
                </button>
            )
        }
    } else {
        if (result.uri.includes("playlist")) {
            searchResult = (
                <button
                    className="playlistButton"
                    title={`${result.title} by ${formatArtists(result.artistsOrOwner)}`}
                    onClick={handleClick}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '16px',
                            fontWeight: 'bolder',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                        }}>
                        <img src={result.image} alt="" style={{
                            height: '2.5em',
                            borderRadius: '10px',
                            marginRight: '5px',
                            width: '2.5em',
                            zIndex: '999',
                        }}/>
                        <div className={hover && result.title.length > 15 ? 'scrollingSongTitle' : 'songTitle'}>
                            {result.title}
                        </div>
                    </div>
                </button>
            )
        } else {
            searchResult = (
                <button
                    className="songButton"
                    title={`${result.title} by ${formatArtists(result.artistsOrOwner)}`}
                    onClick={handleClick}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '16px',
                            fontWeight: 'bolder',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                        }}>
                        <img src={result.image} alt="" style={{
                            height: '2.5em',
                            borderRadius: '10px',
                            marginRight: '5px',
                            width: '2.5em',
                            zIndex: '999',
                        }}/>
                        <div className={hover && result.title.length > 15 ? 'scrollingSongTitle' : 'songTitle'}>
                            {result.title}
                        </div>
                    </div>
                </button>
            )
        }
    }

    return searchResult
}

export default SearchResult