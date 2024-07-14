import "./CardStyle.scss";

export default function CardStyle({ imgSrc, name }) {
  return (
    <div className="col-12 d-flex flex-column">
      <div className="ratio" style={{ "--bs-aspect-ratio": "65%" }}>
        <img
          src={`${process.env.REACT_APP_URL}uploads/images/icons/${imgSrc}`}
          alt="bep-I"
          className="card-type__image"
        />
      </div>

      <p className="card-type__name mt-1 ">{name}</p>
    </div>
  );
}
