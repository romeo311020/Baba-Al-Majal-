import { Link } from 'react-router-dom';
export default function Logo(){return <Link to="/" className="brand" aria-label="يلا رياضة - الرئيسية"><img src={`${import.meta.env.BASE_URL}assets/brand/yalla-riyada.svg`} alt="يلا رياضة | YALLA RIYADA" /></Link>}
