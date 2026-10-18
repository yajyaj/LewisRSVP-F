import starfish from '../assets/images/underwater/starfish-happy.webp'

export default function EventWelcome({ message }: { message: string | null }) {
  return (
    <section className="welcome-section ocean-welcome" aria-labelledby="welcome-heading">
      <div>
        <h2 className="eyebrow" id="welcome-heading">A NOTE FROM THE HOSTS</h2>
        <p className="welcome-copy">{message || 'We would be delighted to celebrate this day with you.'}</p>
      </div>
      <img className="welcome-starfish" src={starfish} alt="" width={1254} height={1254} loading="lazy" decoding="async" />
    </section>
  )
}
