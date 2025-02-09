import React, { useState } from 'react';
import "./Comment.css";
import Displaycommment from './Displaycommment';
import { useSelector, useDispatch } from 'react-redux';
import { postcomment } from '../../action/comment';

const Comment = ({ videoid }) => {
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState("");
  const currentuser = useSelector(state => state.currentuserreducer);
  const commentlist = useSelector(state => state.commentreducer);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (currentuser) {
      if (!commentText) {
        alert("please type your comment!!");
      } else {
        dispatch(postcomment({
          videoid: videoid,
          userid: currentuser?.result?._id,
          commentbody: commentText,
          usercommented: currentuser.result.name
        }));
        setCommentText("");
      }
    } else {
      alert("Please login to comment");
    }
  };

  // Safeguard in case commentlist.data is null
  const comments = (commentlist && commentlist.data) ? commentlist.data : [];

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>

      {comments.filter(comment => comment.videoid === videoid)
        .map(comment => (
          <Displaycommment key={comment._id} comment={comment} />
      ))}
    </>
  );
};

export default Comment;
