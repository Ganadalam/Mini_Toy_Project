import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../routes/firebase";
import Tweet from "./tweet";

export interface ITweet {
  photo?: string;
  id: string;
  tweet: string;
  userId: string;
  username: string;
  createdAt: number;
}

const PAGE_SIZE = 3;
const LIVE_TWEET_LIMIT = 3;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
`;

const LoadingMessage = styled.div`
  color: white;
  text-align: center;
  padding: 20px;
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  text-align: center;
  padding: 20px;
  font-size: 16px;
`;

const PageButton = styled.button`
  margin: 10px 5px;
  background-color: #444;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #666;
  }
  &.active {
    background-color: #888;
  }
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 15px;
`;

export default function Timeline() {
  const [liveTweets, setLiveTweets] = useState<ITweet[]>([]);
  const [pageTweets, setPageTweets] = useState<ITweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageCursors, setPageCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  // 실시간 트윗 감시
  useEffect(() => {
    const liveQuery = query(
      collection(db, "tweets"),
      orderBy("createdAt", "desc"),
      limit(LIVE_TWEET_LIMIT)
    );

    const unsubscribe = onSnapshot(liveQuery, (snapshot) => {
      const newTweets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ITweet[];
      setLiveTweets(newTweets);
    });

    return () => unsubscribe();
  }, []);

  // 페이지 커서 준비
  const preparePagination = async () => {
    const fullSnapshot = await getDocs(query(collection(db, "tweets"), orderBy("createdAt", "desc")));
    const allDocs = fullSnapshot.docs;
    const cursors: QueryDocumentSnapshot[] = [];

    for (let i = LIVE_TWEET_LIMIT; i < allDocs.length; i += PAGE_SIZE) {
      cursors.push(allDocs[i]);
    }

    // 마지막 커서가 유효한 페이지인지 확인
    if (cursors.length > 0) {
      const lastCursor = cursors[cursors.length - 1];
      const testQuery = query(
        collection(db, "tweets"),
        orderBy("createdAt", "desc"),
        startAfter(lastCursor),
        limit(PAGE_SIZE)
      );
      const testSnap = await getDocs(testQuery);
      if (testSnap.empty) {
        cursors.pop(); // 마지막 페이지 제거
      }
    }

    setPageCursors(cursors);
  };

  const loadPage = async (pageIndex: number) => {
    setLoading(true);
    try {
      const cursor = pageCursors[pageIndex];
      const pageQuery = query(
        collection(db, "tweets"),
        orderBy("createdAt", "desc"),
        ...(cursor ? [startAfter(cursor)] : [startAfter(pageCursors[0])]),
        limit(PAGE_SIZE)
      );
      const snapshot = await getDocs(pageQuery);
      const newTweets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ITweet[];
      setPageTweets(newTweets);
      setCurrentPage(pageIndex);
    } catch (err: any) {
      setError(err.message || "오류 발생");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    preparePagination();
  }, []);

  useEffect(() => {
    if (pageCursors.length > 0) {
      loadPage(0);
    }
  }, [pageCursors]);

  const allTweets = [...liveTweets, ...pageTweets];

  if (loading && allTweets.length === 0) {
    return <LoadingMessage>트윗을 불러오는 중...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (allTweets.length === 0) {
    return <LoadingMessage>아직 트윗이 없습니다. 첫 트윗을 작성해보세요! 🐦</LoadingMessage>;
  }

  return (
    <>
      <Wrapper>
        {allTweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Wrapper>
      <PaginationBar>
        {pageCursors.map((_, index) => (
          <PageButton
            key={index}
            onClick={() => loadPage(index)}
            className={index === currentPage ? "active" : ""}
          >
            {index + 1}
          </PageButton>
        ))}
      </PaginationBar>
      {loading && <LoadingMessage>트윗을 불러오는 중...</LoadingMessage>}
    </>
  );
}
// import {
//   collection,
//   query,
//   orderBy,
//   limit,
//   startAfter,
//   getDocs,
//   DocumentData,
//   QueryDocumentSnapshot,
// } from "firebase/firestore";
// import { useEffect, useState } from "react";
// import styled from "styled-components";
// import { db } from "../routes/firebase";
// import Tweet from "./tweet";

// export interface ITweet {
//   photo?: string;
//   id: string;
//   tweet: string;
//   userId: string;
//   username: string;
//   createdAt: number;
// }

// const PAGE_SIZE = 3;

// const Wrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
//   padding: 20px;
// `;

// const LoadingMessage = styled.div`
//   color: white;
//   text-align: center;
//   padding: 20px;
//   font-size: 16px;
// `;

// const ErrorMessage = styled.div`
//   color: #ff6b6b;
//   text-align: center;
//   padding: 20px;
//   font-size: 16px;
// `;

// const PageButton = styled.button`
//   margin: 10px 5px;
//   background-color: #444;
//   color: white;
//   padding: 8px 12px;
//   border-radius: 8px;
//   cursor: pointer;
//   &:hover {
//     background-color: #666;
//   }
//   &.active {
//     background-color: #888;
//   }
// `;

// const PaginationBar = styled.div`
//   display: flex;
//   justify-content: center;
//   margin-top: 15px;
// `;

// export default function Timeline() {
//   const [tweets, setTweets] = useState<ITweet[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [pageCursors, setPageCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
//   const [currentPage, setCurrentPage] = useState(0);

//   const preparePagination = async () => {
//     const fullSnapshot = await getDocs(
//       query(collection(db, "tweets"), orderBy("createdAt", "desc"))
//     );
//     const allDocs = fullSnapshot.docs;
//     const cursors: QueryDocumentSnapshot[] = [];

//     for (let i = 0; i < allDocs.length; i += PAGE_SIZE) {
//       cursors.push(allDocs[i]);
//     }

//     // ✅ 마지막 페이지에 트윗이 없을 경우 제거
//     if (cursors.length > 0) {
//       const lastCursor = cursors[cursors.length - 1];
//       const testQuery = query(
//         collection(db, "tweets"),
//         orderBy("createdAt", "desc"),
//         startAfter(lastCursor),
//         limit(PAGE_SIZE)
//       );
//       const testSnap = await getDocs(testQuery);
//       if (testSnap.empty) {
//         cursors.pop(); // 마지막 페이지 제거
//       }
//     }

//     setPageCursors(cursors);
//   };

//   const loadPage = async (pageIndex: number) => {
//     setLoading(true);
//     try {
//       const cursor = pageCursors[pageIndex];
//       const pageQuery = query(
//         collection(db, "tweets"),
//         orderBy("createdAt", "desc"),
//         ...(cursor ? [startAfter(cursor)] : []),
//         limit(PAGE_SIZE)
//       );
//       const snapshot = await getDocs(pageQuery);
//       const newTweets = snapshot.docs.map((doc) => {
//         const data = doc.data();
//         return {
//           tweet: data.tweet,
//           createdAt: data.createdAt,
//           userId: data.userId,
//           username: data.username,
//           photo: data.photo,
//           id: doc.id,
//         };
//       });
//       setTweets(newTweets);
//       setCurrentPage(pageIndex);
//     } catch (err: any) {
//       setError(err.message || "오류 발생");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     preparePagination();
//   }, []);

//   useEffect(() => {
//     if (pageCursors.length > 0) {
//       loadPage(0); // 첫 페이지
//     }
//   }, [pageCursors]);

//   if (loading && tweets.length === 0) {
//     return <LoadingMessage>트윗을 불러오는 중...</LoadingMessage>;
//   }

//   if (error) {
//     return <ErrorMessage>{error}</ErrorMessage>;
//   }

//   if (tweets.length === 0) {
//     return (
//       <LoadingMessage>
//         아직 트윗이 없습니다. 첫 번째 트윗을 작성해보세요! 🐦
//       </LoadingMessage>
//     );
//   }

//   return (
//     <>
//       <Wrapper>
//         {tweets.map((tweet) => (
//           <Tweet key={tweet.id} {...tweet} />
//         ))}
//       </Wrapper>
//       <PaginationBar>
//         {pageCursors.map((_, index) => (
//           <PageButton
//             key={index}
//             onClick={() => loadPage(index)}
//             className={index === currentPage ? "active" : ""}
//           >
//             {index + 1}
//           </PageButton>
//         ))}
//       </PaginationBar>
//       {loading && <LoadingMessage>트윗을 불러오는 중...</LoadingMessage>}
//     </>
//   );
// }
// import {
//   collection,
//   query,
//   orderBy,
//   limit,
//   startAfter,
//   getDocs,
//   DocumentData,
//   QueryDocumentSnapshot,
// } from "firebase/firestore";
// import { useEffect, useState } from "react";
// import styled from "styled-components";
// import { db } from "../routes/firebase";
// import Tweet from "./tweet";

// export interface ITweet {
//   photo?: string;
//   id: string;
//   tweet: string;
//   userId: string;
//   username: string;
//   createdAt: number;
// }

// const PAGE_SIZE = 3;

// const Wrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
//   padding: 20px;
// `;

// const LoadingMessage = styled.div`
//   color: white;
//   text-align: center;
//   padding: 20px;
//   font-size: 16px;
// `;

// const ErrorMessage = styled.div`
//   color: #ff6b6b;
//   text-align: center;
//   padding: 20px;
//   font-size: 16px;
// `;

// const PageButton = styled.button`
//   margin: 10px 5px;
//   background-color: #444;
//   color: white;
//   padding: 8px 12px;
//   border-radius: 8px;
//   cursor: pointer;
//   &:hover {
//     background-color: #666;
//   }
//   &.active {
//     background-color: #888;
//   }
// `;

// const PaginationBar = styled.div`
//   display: flex;
//   justify-content: center;
//   margin-top: 15px;
// `;

// export default function Timeline() {
//   const [tweets, setTweets] = useState<ITweet[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [pageCursors, setPageCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);

//   const preparePagination = async () => {
//     const fullSnapshot = await getDocs(query(collection(db, "tweets"), orderBy("createdAt", "desc")));
//     const allDocs = fullSnapshot.docs;
//     const cursors: QueryDocumentSnapshot[] = [];
//     for (let i = 0; i < allDocs.length; i += PAGE_SIZE) {
//       cursors.push(allDocs[i]);
//     }
//     setPageCursors(cursors);
//     setTotalPages(cursors.length);
//   };

//   const loadPage = async (pageIndex: number) => {
//     setLoading(true);
//     try {
//       const baseQuery = query(
//         collection(db, "tweets"),
//         orderBy("createdAt", "desc"),
//         ...(pageIndex > 0 ? [startAfter(pageCursors[pageIndex])] : []),
//         limit(PAGE_SIZE)
//       );
//       const snapshot = await getDocs(baseQuery);
//       const newTweets = snapshot.docs.map((doc) => {
//         const data = doc.data();
//         return {
//           tweet: data.tweet,
//           createdAt: data.createdAt,
//           userId: data.userId,
//           username: data.username,
//           photo: data.photo,
//           id: doc.id,
//         } as ITweet;
//       });
//       setTweets(newTweets);
//       setCurrentPage(pageIndex);
//     } catch (err: any) {
//       setError(err.message || "오류 발생");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     preparePagination();
//   }, []);

//   useEffect(() => {
//     if (pageCursors.length > 0) {
//       loadPage(0); // 최초 페이지 로딩
//     }
//   }, [pageCursors]);

//   if (loading && tweets.length === 0) {
//     return <LoadingMessage>트윗을 불러오는 중...</LoadingMessage>;
//   }

//   if (error) {
//     return <ErrorMessage>{error}</ErrorMessage>;
//   }

//   if (tweets.length === 0) {
//     return (
//       <LoadingMessage>
//         아직 트윗이 없습니다. 첫 번째 트윗을 작성해보세요! 🐦
//       </LoadingMessage>
//     );
//   }

//   return (
//     <>
//       <Wrapper>
//         {tweets.map((tweet) => (
//           <Tweet key={tweet.id} {...tweet} />
//         ))}
//       </Wrapper>
//       <PaginationBar>
//         {Array.from({ length: totalPages }).map((_, index) => (
//           <PageButton
//             key={index}
//             onClick={() => loadPage(index)}
//             className={index === currentPage ? "active" : ""}
//           >
//             {index + 1}
//           </PageButton>
//         ))}
//       </PaginationBar>
//       {loading && <LoadingMessage>트윗을 불러오는 중...</LoadingMessage>}
//     </>
//   );
// }

// // import {
// //   collection,
// //   query,
// //   orderBy,
// //   limit,
// //   startAfter,
// //   getDocs,
// //   DocumentData,
// //   QueryDocumentSnapshot,
// // } from "firebase/firestore";
// // import { useEffect, useState } from "react";
// // import styled from "styled-components";
// // import { db } from "../routes/firebase";
// // import Tweet from "./tweet";

// // export interface ITweet {
// //   photo?: string;
// //   id: string;
// //   tweet: string;
// //   userId: string;
// //   username: string;
// //   createdAt: number;
// // }

// // const PAGE_SIZE = 3;

// // const Wrapper = styled.div`
// //   display: flex;
// //   flex-direction: column;
// //   gap: 10px;
// //   padding: 20px;
// // `;

// // const LoadingMessage = styled.div`
// //   color: white;
// //   text-align: center;
// //   padding: 20px;
// //   font-size: 16px;
// // `;

// // const ErrorMessage = styled.div`
// //   color: #ff6b6b;
// //   text-align: center;
// //   padding: 20px;
// //   font-size: 16px;
// // `;

// // const LoadMoreButton = styled.button`
// //   margin: 20px auto;
// //   background-color: #444;
// //   color: white;
// //   padding: 10px 20px;
// //   border-radius: 10px;
// //   cursor: pointer;
// //   &:hover {
// //     background-color: #666;
// //   }
// // `;

// // export default function Timeline() {
// //   const [tweets, setTweets] = useState<ITweet[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
// //   const [hasMore, setHasMore] = useState(true);

// //   const fetchTweets = async () => {
// //     setLoading(true);
// //     try {
// //       const baseQuery = query(
// //         collection(db, "tweets"),
// //         orderBy("createdAt", "desc"),
// //         ...(lastDoc ? [startAfter(lastDoc)] : []),
// //         limit(PAGE_SIZE)
// //       );

// //       const snapshot = await getDocs(baseQuery);

// //       const newTweets = snapshot.docs.map((doc) => {
// //         const data = doc.data();
// //         return {
// //           tweet: data.tweet,
// //           createdAt: data.createdAt,
// //           userId: data.userId,
// //           username: data.username,
// //           photo: data.photo,
// //           id: doc.id,
// //         } as ITweet;
// //       });

// //       setTweets((prev) => [...prev, ...newTweets]);
// //       setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
// //       setHasMore(snapshot.size === PAGE_SIZE);
// //     } catch (err: any) {
// //       setError(err.message || "알 수 없는 오류");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     console.log("🟡 Timeline 마운트 → 첫 페이지 로딩 시작");
// //     fetchTweets();

// //     return () => {
// //       console.log("🔴 Timeline 언마운트 → 클린업 완료");
// //     };
// //   }, []);

// //   if (loading && tweets.length === 0) {
// //     return <LoadingMessage>트윗을 불러오는 중...</LoadingMessage>;
// //   }

// //   if (error) {
// //     return <ErrorMessage>{error}</ErrorMessage>;
// //   }

// //   if (tweets.length === 0) {
// //     return (
// //       <LoadingMessage>
// //         아직 트윗이 없습니다. 첫 번째 트윗을 작성해보세요! 🐦
// //       </LoadingMessage>
// //     );
// //   }

// //   return (
// //     <>
// //       <Wrapper>
// //         {tweets.map((tweet) => (
// //           <Tweet key={tweet.id} {...tweet} />
// //         ))}
// //       </Wrapper>
// //       {hasMore && !loading && (
// //         <LoadMoreButton onClick={fetchTweets}>더 보기</LoadMoreButton>
// //       )}
// //       {loading && tweets.length > 0 && (
// //         <LoadingMessage>추가 트윗을 불러오는 중...</LoadingMessage>
// //       )}
// //     </>
// //   );
// // }









// // // import { collection, query, orderBy, onSnapshot, limit, startAfter } from "firebase/firestore";
// // // import { useEffect, useState } from "react";
// // // import styled from "styled-components";
// // // import { db } from "../routes/firebase";
// // // import Tweet from "./tweet";

// // // export interface ITweet {
// // //   photo?: string;
// // //   id: string;
// // //   tweet: string;
// // //   userId: string;
// // //   username: string;
// // //   createdAt: number;
// // // }

// // // const Wrapper = styled.div`
// // //   display: flex;
// // //   flex-direction: column;
// // //   gap: 10px;
// // //   padding: 20px;
// // // `;

// // // const LoadingMessage = styled.div`
// // //   color: white;
// // //   text-align: center;
// // //   padding: 20px;
// // //   font-size: 16px;
// // // `;

// // // const ErrorMessage = styled.div`
// // //   color: #ff6b6b;
// // //   text-align: center;
// // //   padding: 20px;
// // //   font-size: 16px;
// // // `;

// // // export default function Timeline() {
// // //   const [tweets, setTweets] = useState<ITweet[]>([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string | null>(null);
// // //   const [lastDoc, setLastDoc] = useState(null);
  
// // //   const loadNextPage = () => {
// // //     const nextQuery = query(
// // //         collection(db, "tweets"),
// // //         orderBy("createdAt","desc"),
// // //         startAfter(lastDoc),
// // //         limit(5),
// // //     )
// // //   }
// // //   useEffect(() => {
// // //     console.log("Timeline 마운트, 트윗 구독 시작");

// // //     const tweetsQuery = query(
// // //       collection(db, "tweets"),
// // //       orderBy("createdAt", "desc")
// // //     );

// // //     const unsubscribe = onSnapshot(
// // //       tweetsQuery, 
// // //       (snapshot) => {
// // //         console.log("트윗 업데이트 감지, 문서 수:", snapshot.docs.length);
        
// // //         const mappedTweets = snapshot.docs.map((doc) => {
// // //           const data = doc.data();
// // //           console.log("문서 ID:", doc.id, "데이터:", data);
          
// // //           return {
// // //             tweet: data.tweet,
// // //             createdAt: data.createdAt,
// // //             userId: data.userId,
// // //             username: data.username,
// // //             photo: data.photo,
// // //             id: doc.id,
// // //           } as ITweet;
// // //         });

// // //         setTweets(mappedTweets);
// // //         setLoading(false);
// // //         setError(null);
// // //       }, 
// // //       (error) => {
// // //         console.error("트윗 로딩 오류:", error);
// // //         setError(`트윗을 불러오는 중 오류가 발생했습니다: ${error.message}`);
// // //         setLoading(false);
// // //       }
// // //     );

// // //     // 클린업 함수 반환
// // //     return () => {
// // //       console.log("Timeline 언마운트, 구독 해제");
// // //       unsubscribe();
// // //     };
// // //   }, []);

// // //   if (loading) {
// // //     return <LoadingMessage>트윗을 불러오는 중...</LoadingMessage>;
// // //   }

// // //   if (error) {
// // //     return <ErrorMessage>{error}</ErrorMessage>;
// // //   }

// // //   if (tweets.length === 0) {
// // //     return (
// // //       <LoadingMessage>
// // //         아직 트윗이 없습니다. 첫 번째 트윗을 작성해보세요! 🐦
// // //       </LoadingMessage>
// // //     );
// // //   }

// // //   return (
// // //     <Wrapper>
// // //       {tweets.map((tweet) => (
// // //         <Tweet key={tweet.id} {...tweet} />
// // //       ))}
// // //     </Wrapper>
// // //   );
// // // }








// // // // import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
// // // // import { useEffect, useState } from "react";
// // // // import styled from "styled-components";
// // // // import { db } from "../routes/firebase";
// // // // import Tweet from "./tweet";

// // // // export interface ITweet {
// // // //   photo?: string;
// // // //   id: string;
// // // //   tweet: string;
// // // //   userId: string;
// // // //   username: string;
// // // //   createdAt: number;
// // // // }

// // // // const Wrapper = styled.div`
// // // //   display: flex;
// // // //   flex-direction: column;
// // // //   gap: 10px;
// // // //   padding: 20px;
// // // // `;

// // // // const LoadingMessage = styled.div`
// // // //   color: white;
// // // //   text-align: center;
// // // //   padding: 20px;
// // // //   font-size: 16px;
// // // // `;

// // // // const ErrorMessage = styled.div`
// // // //   color: #ff6b6b;
// // // //   text-align: center;
// // // //   padding: 20px;
// // // //   font-size: 16px;
// // // // `;

// // // // export default function Timeline() {
// // // //   const [tweets, setTweets] = useState<ITweet[]>([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [error, setError] = useState<string | null>(null);

// // // //   useEffect(() => {
// // // //     console.log("Timeline 마운트, 트윗 구독 시작");

// // // //     const fetchTweets = async () =>{
// // // //     const tweetsQuery = query(
// // // //       collection(db, "tweets"),
// // // //       orderBy("createdAt", "desc")
// // // //     );

// // // //     const unsubscribe = onSnapshot(
// // // //       tweetsQuery, 
// // // //       (snapshot) => {
// // // //         console.log("트윗 업데이트 감지, 문서 수:", snapshot.docs.length);
        
// // // //         const mappedTweets = snapshot.docs.map((doc) => {
// // // //           const data = doc.data();
// // // //           console.log("문서 ID:", doc.id, "데이터:", data);
          
// // // //           return {
// // // //             tweet: data.tweet,
// // // //             createdAt: data.createdAt,
// // // //             userId: data.userId,
// // // //             username: data.username,
// // // //             photo: data.photo,
// // // //             id: doc.id,
// // // //           } as ITweet;
// // // //         });

// // // //         setTweets(mappedTweets);
        
// // // //         setLoading(false);
// // // //         setError(null);
// // // //       }, 
// // // //       (error) => {
// // // //         console.error("트윗 로딩 오류:", error);
// // // //         setError(`트윗을 불러오는 중 오류가 발생했습니다: ${error.message}`);
// // // //         setLoading(false);
// // // //       }
// // // //     );

// // // //     // 클린업 함수
// // // //     return () => {
// // // //       console.log("Timeline 언마운트, 구독 해제");
// // // //       unsubscribe();
// // // //     };
// // // //   }, []);

// // // //   if (loading) {
// // // //     return <LoadingMessage>트윗을 불러오는 중...</LoadingMessage>;
// // // //   }

// // // //   if (error) {
// // // //     return <ErrorMessage>{error}</ErrorMessage>;
// // // //   }

// // // //   if (tweets.length === 0) {
// // // //     return (
// // // //       <LoadingMessage>
// // // //         아직 트윗이 없습니다. 첫 번째 트윗을 작성해보세요! 🐦
// // // //       </LoadingMessage>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <Wrapper>
// // // //       {tweets.map((tweet) => (
// // // //         <Tweet key={tweet.id} {...tweet} />
// // // //       ))}
// // // //     </Wrapper>
// // // //   );
// // // // }

// // // // // import { collection, query, orderBy, onSnapshot, doc } from "firebase/firestore";
// // // // // import { useEffect, useState } from "react";
// // // // // import styled from "styled-components";
// // // // // import { db } from "../routes/firebase";
// // // // // import Tweet from "./tweet";

// // // // // export interface ITweet {
// // // // //   photo?: string;
// // // // //   id: string;
// // // // //   tweet: string;
// // // // //   userId: string;
// // // // //   username: string;
// // // // //   createdAt: number;
// // // // // }

// // // // // const Wrapper = styled.div`
// // // // //   display: flex;
// // // // //   flex-direction: column;
// // // // //   gap: 10px;
// // // // //   padding: 20px;
// // // // // `;

// // // // // const LoadingMessage = styled.div`
// // // // //   color: white;
// // // // //   text-align: center;
// // // // //   padding: 20px;
// // // // // `;

// // // // // export default function Timeline() {
// // // // //   const [tweets, setTweets] = useState<ITweet[]>([]);
// // // // //   const [loading, setLoading] = useState(true);

// // // // //   useEffect(() => {
// // // // //     const tweetsQuery = query(
// // // // //       collection(db, "tweets"),
// // // // //       orderBy("createdAt", "desc")
// // // // //     );

// // // // //     const unsubscribe = onSnapshot(tweetsQuery, (snapshot) => {
// // // // //       console.log("트윗 업데이트 감지, 문서 수:", snapshot.docs.length);
      
// // // // //       const mappedTweets = snapshot.docs.map((doc) => {
// // // // //         const data = doc.data();
// // // // //         console.log("문서 데이터:", data);
        
// // // // //         return {
// // // // //           tweet: data.tweet,
// // // // //           createdAt: data.createdAt,
// // // // //           userId: data.userId,
// // // // //           username: data.username,
// // // // //           photo: data.photo,
// // // // //           id: doc.id,
// // // // //         };
// // // // //       });
// // // // //       await onSnapshot(tweetsQuery, (snapshot)=> {
// // // // //         snapshot.docs.map(doc) => {

// // // // //         }
// // // // //       })
// // // // //       setTweets(mappedTweets);
// // // // //       setLoading(false);
// // // // //     }, (error) => {
// // // // //       console.error("트윗 로딩 오류:", error);
// // // // //       setLoading(false);
// // // // //     });

// // // // //     return () => {
// // // // //       console.log("Timeline 언마운트, 구독 해제");
// // // // //       unsubscribe();
// // // // //     };
// // // // //   }, []);

// // // // //   if (loading) {
// // // // //     return <LoadingMessage>트윗을 불러오는 중...</LoadingMessage>;
// // // // //   }

// // // // //   if (tweets.length === 0) {
// // // // //     return <LoadingMessage>아직 트윗이 없습니다. 첫 번째 트윗을 작성해보세요!</LoadingMessage>;
// // // // //   }

// // // // //   return (
// // // // //     <Wrapper>
// // // // //       {tweets.map((tweet) => (
// // // // //         <Tweet key={tweet.id} {...tweet} />
// // // // //       ))}
// // // // //     </Wrapper>
// // // // //   );
// // // // // }
// // // // // import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
// // // // // import { useEffect, useState } from "react";
// // // // // import styled from "styled-components";
// // // // // import { db } from "../routes/firebase";
// // // // // import Tweet from "./tweet";

// // // // // export interface ITweet {
// // // // //   photo?: string;
// // // // //   id: string;
// // // // //   tweet: string;
// // // // //   userId: string;
// // // // //   username: string;
// // // // //   createdAt: number;
// // // // // }

// // // // // const Wrapper = styled.div``;

// // // // // export default function Timeline() {
// // // // //   const [tweets, setTweets] = useState<ITweet[]>([]);

// // // // //   useEffect(() => {
// // // // //     const tweetsQuery = query(
// // // // //       collection(db, "tweets"),
// // // // //       orderBy("createdAt", "desc")
// // // // //     );

// // // // //     const unsubscribe = onSnapshot(tweetsQuery, (snapshot) => {
// // // // //       const mappedTweets = snapshot.docs.map((doc) => {
// // // // //         const { tweet, createdAt, userId, username, photo } = doc.data();
// // // // //         return {
// // // // //           tweet,
// // // // //           createdAt,
// // // // //           userId,
// // // // //           username,
// // // // //           photo,
// // // // //           id: doc.id,
// // // // //         };
// // // // //       });
// // // // //       setTweets(mappedTweets);
// // // // //     });

// // // // //     return () => unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
// // // // //   }, []);

// // // // //   return (
// // // // //     <Wrapper>
// // // // //       {tweets.map((tweet) => (
// // // // //         <Tweet key={tweet.id} {...tweet} />
// // // // //       ))}
// // // // //     </Wrapper>
// // // // //   );


// // // // // }
// // // // // //(2)// import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
// // // // // // import { useEffect, useState } from "react";
// // // // // // import styled from "styled-components";
// // // // // // import { db } from "../routes/firebase";
// // // // // // import Tweet from "./tweet";

// // // // // // export interface ITweet{
// // // // // //   photo?: string;
// // // // // //   id: string;
// // // // // //   tweet: string;
// // // // // //   userId: string;
// // // // // //   username: string;
// // // // // //   createdAt: number;
// // // // // // };

// // // // // // const Wrapper = styled.div``;

// // // // // // export default function Timeline() {
// // // // // //   const [tweets, setTweet] = useState<ITweet[]>([]);

// // // // // //   const fetchTweets = async () => {
// // // // // //     const tweetsQuery = query(
// // // // // //       collection(db, "tweets"),
// // // // // //       orderBy("createdAt", "desc")
// // // // // //     );
// // // // // //     const snapshot = await getDocs(tweetsQuery);
// // // // // //     const mappedTweets = snapshot.docs.map((doc) => {
// // // // // //       const { tweet, createdAt, userId, username, photo } = doc.data();
// // // // // //       return { tweet, createdAt, userId, username, photo, id: doc.id };
// // // // // //     });
// // // // // //     setTweet(mappedTweets);
// // // // // //   };

// // // // // //   useEffect(() => {
// // // // // //     fetchTweets();
// // // // // //   }, []);

// // // // // //   return (
// // // // // //     <Wrapper>
// // // // // //       {tweets.map((tweet) => (
// // // // // //         <Tweet key={tweet.id} {...tweet} />
// // // // // //       ))}
// // // // // //     </Wrapper>
// // // // // //   );
// // // // // // }

// // // // // // export default function Timeline(){
// // // // // //     const [tweets, setTweet] = useState<ITweet[]>([]);
// // // // // //     const fetchTweets = async() => {
// // // // // //         const tweetsQuery = query(
// // // // // //             collection(db, "tweets"),
// // // // // //             orderBy("createdAt","desc")
// // // // // //         );
// // // // // //         const spanshot = await getDocs(tweetsQuery);
// // // // // //         const tweets = spanshot.docs.map((doc) => {
// // // // // //             const {tweet, createdAt, userId, username, photo} = doc.data();
// // // // // //             return { tweet, createdAt, userId, username, photo, id: doc.id ,};
// // // // // //         });
// // // // // //         setTweet(tweets);
// // // // // //     useEffect(() => {
// // // // // //         fetchTweets();
// // // // // //     }, [])

// // // // // //   return (
// // // // // //   <Wrapper>
// // // // // //     {tweets.map(tweet => 
// // // // // //       <Tweet key={tweet.id} {...tweet} />
// // // // // //     )}
// // // // // //   </Wrapper>
// // // // // // );

// // // // // // };

// // // // // // };
