import { useNavigate, useParams } from "react-router-dom";

function CardDetailPage({ getPosts, getComments }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const postId = Number(id);
  const card = getPosts.find((item) => item.id === postId);
  const comments = getComments.filter((item) => item.postId === postId);

  if (!card) {
    return <main className="detail-page detail-page--empty">게시글을 불러오는 중입니다.</main>;
  }

  return (
    <main className="detail-page">
      <button className="back-link" type="button" onClick={() => navigate("/")}>← 목록으로</button>
      <article className="post-detail">
        <span className="post-detail__label">Post #{card.id}</span>
        <h1>{card.title}</h1>
        <p className="post-detail__body">{card.body}</p>
      </article>
      <section className="comments">
        <h2>Comments <span>{comments.length}</span></h2>
        <div className="comments__list">
          {comments.map((comment) => (
            <article className="comment" key={comment.id}>
              <div className="comment__header">
                <h3>{comment.name}</h3>
                <span>{comment.email}</span>
              </div>
              <p>{comment.body}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="detail-navigation">
        <button onClick={() => navigate(`/${postId - 1}`)} disabled={postId <= 1}>← 이전 글</button>
        <button onClick={() => navigate(`/${postId + 1}`)} disabled={postId >= getPosts.length}>다음 글 →</button>
      </div>
    </main>
  );
}

export default CardDetailPage;
