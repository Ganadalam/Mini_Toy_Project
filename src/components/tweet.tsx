import { useState } from "react"; 
import styled from "styled-components";
import type { ITweet } from "./timeline";
import { auth, db } from "../routes/firebase";
import { deleteDoc, doc } from "firebase/firestore";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  margin-bottom: 10px;
  background-color: rgba(0, 0, 0, 0.3);
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
  object-fit: cover;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
  color: #1d9bf0;
  margin-bottom: 8px;
`;

const Payload = styled.p`
  margin: 0;
  font-size: 18px;
  color: white;
  line-height: 1.4;
`;

const CreatedAt = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
`;

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "방금 전";
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
  
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  width: 20%;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  margin-top: 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer; `;

export default function Tweet({ id, username, photo, tweet, createdAt, userId }: ITweet) {
  const user = auth.currentUser;
  const [deleted, setDeleted] = useState(false); 

  const onDelete = async () => {
    const ok = confirm("Are you sure want to delete this tweet?")

    if(!ok || user?.uid !== userId) return;
    
    try {
      await deleteDoc(doc(db, "tweets", id));
      setDeleted(true);
    } catch (e) {
      console.log("삭제 오류:", e);
    } finally {}
  };

  if (deleted) return null;
  
  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <Payload>{tweet}</Payload>
        <CreatedAt>{formatDate(createdAt)}</CreatedAt>
        {user?.uid === userId ? <DeleteButton onClick={onDelete}>Delete</DeleteButton>: null}
      </Column>
      {photo ? (
        <Column>
          <Photo src={photo} alt="트윗 이미지" />
        </Column>
      ) : null}
    </Wrapper>
  );
}

// import styled from "styled-components";
// import type { ITweet } from "./timeline";

// const Wrapper = styled.div`
//   display: grid;
//   grid-template-columns: 3fr 1fr;
//   padding: 2px;
//   border: 1px solid rgba(255,255,255,0.5);
//   border-radius: 15px;
// `;

// const Column = styled.div`
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   padding: 10px;
// `;

// const Photo = styled.img`
//   width: 100px;
//   height: 100px;
//   border-radius: 15px;
// `;

// const Username = styled.span`
//   font-weight: 600;
//   font-size: 15px;
// `;

// const Payload = styled.p`
//   margin: 10px 0px;
//   font-size: 18px;
// `;

// export default function Tweet({ username, photo, tweet }: ITweet) {
//   return (
//     <Wrapper>
//       <Column>
//         <Username>{username}</Username>
//         <Payload>{tweet}</Payload>
//       </Column>
//       {photo ? (
//         <Column>
//           <Photo src={photo} />
//         </Column>
//       ) : null}
//     </Wrapper>
//   );
// }



// // (1) import styled from "styled-components"
// // // import { Wrapper } from "./auth-componets"
// // import { ITweet } from "./timeline"

// // const Wrapper = styled.div`
// //   display: grid;
// //   grid-template-columns: 3fr 1fr;
// //   padding: 2-px;
// //   border: 1px solid rgba(255,255,255,0.5);
// //   border-radius: 15px;
// //   `;

// // const Photo = styled.div`
// //   width: 100px;
// //   height: 100px;
// //   border-radius: 15px;
// //   `;

// // const Username = styled.span`
// //   font-weight: 600;
// //   font-size: 15px;
// //   `;

// // const Payload = styled.p`
// //   margin: 10px 0px;
// //   font-size: 18px;
// //   `;


// // export default function Tweet({username, photo, tweet}: ITweet) {
// //     return
// //     <Wrapper>
// //         <Column>
// //          <Username>{username</Username>
// //          <Payload>{tweet}</Payload>
// //         </Column>
// //         {photo ? (
// //             <Column>
// //          <Photo src={photo} />
// //         </Column>
// //         ) : null }
// //     </Wrapper>
// // }