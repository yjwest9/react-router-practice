import { Link } from "react-router-dom";

function ListCard({ post, user }) {
  return (
    <Link to={`/${post.id}`} className="blog-card">
      <div className="blog-card__content">
        <h2 className="blog-card__title">{post.title}</h2>
        <p className="blog-card__body">{post.body}</p>
      </div>
      <footer className="blog-card__footer">
        <span>Written by</span>
        <strong>{user?.username ?? "Unknown"}</strong>
      </footer>
    </Link>
  );
}

export default ListCard;
