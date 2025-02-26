import { Link } from 'react-router-dom'

const Public = () => {
    const content = (
        <section className="public">
            <header className='public__header'>
                <div className = 'public__welcome'>
                    <h1 style={{margin: '0', fontWeight: '600'}}><span className="nowrap">AI Chatbot</span></h1>
                </div>
            </header>
            <main className="public__main"
                style={{display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                }}>
                <div style={{display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        width: '100%',
                    }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Link className = "login__button" to="/login" style={{textDecoration: 'none'}}>Login</Link>
                    <svg width="450" height="300" viewBox="0 0 450 300">
                        <path id="curve" d="M 0 50 Q 225 400 450 50" fill="none" />
                        <text fontSize="35" fill="#ddefff">
                            <textPath href="#curve" startOffset="50%" text-anchor="middle">
                                A virtual assistant for all your needs
                            </textPath>
                        </text>
                    </svg>
                    </div>
                </div>
            </main>
            <footer>

            </footer>
        </section>

    )
    return content
}
export default Public