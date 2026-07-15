import { useCallback, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { fetchGetComments, fetchGetPosts, fetchGetUsers } from "./http";
import HomePage from "./components/HomePage";
import NavBar from "./components/NavBar";
import CardDetailPage from "./components/CardDetailPage";

function App() {
  const [getPosts, setGetPosts] = useState([]);
  const [getUsers, setGetUsers] = useState([]);
  const [getComments, setGetComments] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const posts = await fetchGetPosts();
      const users = await fetchGetUsers();
      const comments = await fetchGetComments();
      setGetPosts(posts);
      setGetUsers(users);
      setGetComments(comments);
    } catch (error) {
      console.error("데이터를 불러오지 못했습니다.", error);
    }
  }, []);

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              fetchData={fetchData}
              getPosts={getPosts}
              getUsers={getUsers}
            />
          }
        />
        <Route
          path="/:id"
          element={<CardDetailPage getPosts={getPosts} getComments={getComments} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
