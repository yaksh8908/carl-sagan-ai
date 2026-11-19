/** Representação visual em CSS do tipo de corpo celeste. É ilustração, não fotografia. */
export default function BodyPortrait({ body }) {
  return (
    <div className="portrait" data-kind={body.category} data-id={body.id} style={{ '--c': body.color }} aria-hidden="true">
      <span className="portrait-orb" />
      {body.id === 'saturno' && <span className="portrait-ring" />}
      {body.category === 'blackhole' && <span className="portrait-ring is-accretion" />}
    </div>
  );
}
