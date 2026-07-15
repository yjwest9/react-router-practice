import { Link, NavLink } from "react-router-dom";

function NavBar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">Router.</Link>
      <div className="navbar__links">
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
          홈
        </NavLink>
      </div>
    </nav>
  );
}

export default NavBar;
