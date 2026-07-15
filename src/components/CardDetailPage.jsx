import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGetPost, fetchGetPostComments } from "../http";

const LAST_POST_ID = 100;

function CardDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const postId = Number(id);
  const [card, setCard] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetailData() {
      try {
        setIsLoading(true);
        setError(null);

        const [postData, commentData] = await Promise.all([
          fetchGetPost(postId, controller.signal),
          fetchGetPostComments(postId, controller.signal),
        ]);

        if (!postData.id) {
          throw new Error("해당 게시글을 찾을 수 없습니다.");
        }

        setCard(postData);
        setComments(commentData);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadDetailData();

    return () => controller.abort();
  }, [postId]);

  if (isLoading) {
    return (
      <main className="detail-page detail-page--empty">
        게시글을 불러오는 중입니다.
      </main>
    );
  }

  if (error) {
    return (
      <main className="detail-page detail-page--empty status-message--error">
        {error}
      </main>
    );
  }

  return (
    <main className="detail-page">
      <button className="back-link" type="button" onClick={() => navigate("/")}>
        ← 목록으로
      </button>

      <article className="post-detail">
        <span className="post-detail__label">Post #{card.id}</span>
        <h1>{card.title}</h1>
        <p className="post-detail__body">{card.body}</p>
      </article>

      <section className="comments">
        <h2>
          Comments <span>{comments.length}</span>
        </h2>
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
        <button
          onClick={() => navigate(`/${postId - 1}`)}
          disabled={postId <= 1}
        >
          ← 이전 글
        </button>
        <button
          onClick={() => navigate(`/${postId + 1}`)}
          disabled={postId >= LAST_POST_ID}
        >
          다음 글 →
        </button>
      </div>
    </main>
  );
}

export default CardDetailPage;
