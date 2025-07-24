import { useState, useRef } from "react";
import styled from "styled-components";
import { auth, db } from "../routes/firebase";
import { addDoc, collection } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

const AttachFileButton = styled.label`
  padding: 10px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const AttachFileInput = styled.input`
  display: none;
`;

const SubmitBtn = styled.input`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.8;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  max-width: 200px;
  border-radius: 20px;
  margin-top: 10px;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 14px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: #51cf66;
  font-size: 14px;
  text-align: center;
`;

interface PostTweetFormProps {
  onTweetPosted?: () => void; // 트윗 게시 후 콜백 함수
}

export default function PostTweetForm({ onTweetPosted }: PostTweetFormProps) {
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 파일 input을 참조하기 위한 ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(e.target.value);
    // 입력 시 메시지 초기화
    setError(null);
    setSuccess(null);
  };

  // 이미지 압축 함수
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 비율 유지하면서 크기 조정
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // 이미지 그리기
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 압축된 base64 데이터 반환
        const compressedData = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedData);
      };
      
      img.onerror = () => reject(new Error('이미지 로드 실패'));
      img.src = URL.createObjectURL(file);
    });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    setError(null);
    setSuccess(null); 
    
    if (files && files.length === 1) {
      const selectedFile = files[0];
      
      // 파일 크기 체크 (10MB 제한)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("파일 크기는 10MB 이하여야 합니다.");
        return;
      }
      
      try {
        // 이미지 압축
        const compressedImage = await compressImage(selectedFile, 600, 0.6);
        
        // 압축 후 크기 체크 (Firestore 제한을 위해)
        const sizeInBytes = (compressedImage.length * 3) / 4; // base64 크기 추정
        if (sizeInBytes > 500 * 1024) { // 500KB 제한
          setError("압축 후에도 이미지가 너무 큽니다. 더 작은 이미지를 선택해주세요.");
          return;
        }
        
        setFile(compressedImage);
      } catch (error) {
        console.error('이미지 압축 오류:', error);
        setError("이미지 처리 중 오류가 발생했습니다.");
      }
    }
  };

  const resetForm = () => {
    setTweet("");
    setFile(null);
    setError(null);
    setSuccess(null);
    // 파일 input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    // 유효성 검사
    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }
    
    if (isLoading) return;
    
    if (tweet.trim() === "") {
      setError("트윗 내용을 입력해주세요.");
      return;
    }
    
    if (tweet.length > 180) {
      setError("트윗은 180자 이하여야 합니다.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await addDoc(collection(db, "tweets"), {
        tweet: tweet.trim(),
        createdAt: Date.now(),
        username: user.displayName || "Anonymous",
        userId: user.uid,
        photo: file || null,
      });
      
      if(file) {
        await updateProfile(user, {
          photoURL: file,
        });
      }
      
      setSuccess("트윗이 성공적으로 게시되었습니다!");
      resetForm();
      
      // 부모 컴포넌트에 트윗 게시 완료 알림
      if (onTweetPosted) {
        onTweetPosted();
      }
      
      // 성공 메시지를 2초 후 자동 제거
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
      
    } catch (error) {
      console.error("트윗 게시 오류:", error);
      setError("트윗 게시 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <TextArea
        rows={5}
        required
        maxLength={180}
        onChange={onChange}
        value={tweet}
        placeholder="What is happening?"
      />
      
      <AttachFileButton htmlFor="file">
        {file ? "Photo added 🌠 ✅ (compressed)" : "Add photo"}
      </AttachFileButton>
      
      <AttachFileInput
        ref={fileInputRef}
        onChange={onFileChange}
        type="file"
        id="file"
        accept="image/*"
      />
      
      {file && <PreviewImage src={file} alt="uploaded" />}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <SubmitBtn 
        type="submit" 
        value={isLoading ? "Posting..." : "Post Tweet"} 
        disabled={isLoading}
      />
    </Form>
  );
}

// import { useState, useRef } from "react";
// import styled from "styled-components";
// import { auth, db } from "../routes/firebase";
// import { addDoc, collection } from "firebase/firestore";

// const Form = styled.form`
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
// `;

// const TextArea = styled.textarea`
//   border: 2px solid white;
//   padding: 20px;
//   border-radius: 20px;
//   font-size: 16px;
//   color: white;
//   background-color: black;
//   width: 100%;
//   resize: none;
//   font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
//   &::placeholder {
//     font-size: 16px;
//   }
//   &:focus {
//     outline: none;
//     border-color: #1d9bf0;
//   }
// `;

// const AttachFileButton = styled.label`
//   padding: 10px 0px;
//   color: #1d9bf0;
//   text-align: center;
//   border-radius: 20px;
//   border: 1px solid #1d9bf0;
//   font-size: 14px;
//   font-weight: 600;
//   cursor: pointer;
// `;

// const AttachFileInput = styled.input`
//   display: none;
// `;

// const SubmitBtn = styled.input`
//   background-color: #1d9bf0;
//   color: white;
//   border: none;
//   padding: 10px 0px;
//   border-radius: 20px;
//   font-size: 16px;
//   cursor: pointer;
//   &:hover,
//   &:active {
//     opacity: 0.8;
//   }
//   &:disabled {
//     opacity: 0.5;
//     cursor: not-allowed;
//   }
// `;

// const PreviewImage = styled.img`
//   width: 100%;
//   max-width: 200px;
//   border-radius: 20px;
//   margin-top: 10px;
// `;

// const ErrorMessage = styled.div`
//   color: #ff6b6b;
//   font-size: 14px;
//   text-align: center;
// `;

// const SuccessMessage = styled.div`
//   color: #51cf66;
//   font-size: 14px;
//   text-align: center;
// `;

// interface PostTweetFormProps {
//   onTweetPosted?: () => void; // 트윗 게시 후 콜백 함수
// }

// export default function PostTweetForm({ onTweetPosted }: PostTweetFormProps) {
//   const [isLoading, setLoading] = useState(false);
//   const [tweet, setTweet] = useState("");
//   const [file, setFile] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
  
//   // 파일 input을 참조하기 위한 ref
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setTweet(e.target.value);
//     // 입력 시 메시지 초기화
//     setError(null);
//     setSuccess(null);
//   };

//   const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { files } = e.target;
//     setError(null);
//     setSuccess(null);
    
//     if (files && files.length === 1) {
//       const selectedFile = files[0];
      
//       // 파일 크기 체크 (5MB 제한)
//       if (selectedFile.size > 5 * 1024 * 1024) {
//         setError("파일 크기는 5MB 이하여야 합니다.");
//         return;
//       }
      
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setFile(reader.result as string);
//       };
//       reader.onerror = () => {
//         setError("파일을 읽는 중 오류가 발생했습니다.");
//       };
//       reader.readAsDataURL(selectedFile);
//     }
//   };

//   const resetForm = () => {
//     setTweet("");
//     setFile(null);
//     setError(null);
//     setSuccess(null);
//     // 파일 input 초기화
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//         console.log("onSubmit file 값:", file);

//     const user = auth.currentUser;
    
//     // 유효성 검사
//     if (!user) {
//       setError("로그인이 필요합니다.");
//       return;
//     }
    
//     if (isLoading) return;
    
//     if (tweet.trim() === "") {
//       setError("트윗 내용을 입력해주세요.");
//       return;
//     }
    
//     if (tweet.length > 180) {
//       setError("트윗은 180자 이하여야 합니다.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
      
//       await addDoc(collection(db, "tweets"), {
//         tweet: tweet.trim(),
//         createdAt: Date.now(),
//         username: user.displayName || "Anonymous",
//         userId: user.uid,
//         photo: file || null,
//       });
      
//       setSuccess("트윗이 성공적으로 게시되었습니다!");
//       resetForm();
      
//       // 부모 컴포넌트에 트윗 게시 완료 알림
//       if (onTweetPosted) {
//         onTweetPosted();
//       }
      
//       // 성공 메시지를 2초 후 자동 제거
//       setTimeout(() => {
//         setSuccess(null);
//       }, 2000);
      
//     } catch (error) {
//       console.error("트윗 게시 오류:", error);
//       setError("트윗 게시 중 오류가 발생했습니다. 다시 시도해주세요.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Form onSubmit={onSubmit}>
//       <TextArea
//         rows={5}
//         required
//         maxLength={180}
//         onChange={onChange}
//         value={tweet}
//         placeholder="What is happening?"
//       />
      
//       <AttachFileButton htmlFor="file">
//         {file ? "Photo added 🌠 ✅" : "Add photo"}
//       </AttachFileButton>
      
//       <AttachFileInput
//         ref={fileInputRef}
//         onChange={onFileChange}
//         type="file"
//         id="file"
//         accept="image/*"
//       />
      
//       {file && <PreviewImage src={file} alt="uploaded" />}
      
//       {error && <ErrorMessage>{error}</ErrorMessage>}
//       {success && <SuccessMessage>{success}</SuccessMessage>}
      
      
// <SubmitBtn 
//   type="submit" 
//   value={isLoading ? "Posting..." : "Post Tweet"} 
//   disabled={
//     isLoading || (!!fileInputRef.current?.files?.[0] && !file)
//   }
// />

//     </Form>
//   );
// }





// // (2)import { useState } from "react";
// // import styled from "styled-components";
// // import { auth, db } from "../routes/firebase";
// // import { addDoc, collection } from "firebase/firestore";

// // const Form = styled.form`
// //   display: flex;
// //   flex-direction: column;
// //   gap: 10px;
// // `;
// // const TextArea = styled.textarea`
// //   border: 2px solid white;
// //   padding: 20px;
// //   border-radius: 20px;
// //   font-size: 16px;
// //   color: white;
// //   background-color: black;
// //   width: 100%;
// //   resize: none;
// //   font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
// //   &::placeholder {
// //     font-size: 16px;
// //   }
// //   &:focus {
// //     outline: none;
// //     border-color: #1d9bf0;
// //   }
// // `;
// // const AttachFileButton = styled.label`
// //   padding: 10px 0px;
// //   color: #1d9bf0;
// //   text-align: center;
// //   border-radius: 20px;
// //   border: 1px solid #1d9bf0;
// //   font-size: 14px;
// //   font-weight: 600;
// //   cursor: pointer;
// // `;
// // const AttachFileInput = styled.input`
// //   display: none;
// // `;
// // const SubmitBtn = styled.input`
// //   background-color: #1d9bf0;
// //   color: white;
// //   border: none;
// //   padding: 10px 0px;
// //   border-radius: 20px;
// //   font-size: 16px;
// //   cursor: pointer;
// //   &:hover,
// //   &:active {
// //     opacity: 0.8;
// //   }
// // `;

// // export default function PostTweetForm() {
// //   const [isLoading, setLoading] = useState(false);
// //   const [tweet, setTweet] = useState("");
// //   const [file, setFile] = useState<string | null>(null);

// //   const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
// //     setTweet(e.target.value);
// //   };

// //   const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const { files } = e.target;
// //     if (files && files.length === 1) {
// //       const reader = new FileReader();
// //       reader.onloadend = () => {
// //         setFile(reader.result as string); // base64 저장
// //       };
// //       reader.readAsDataURL(files[0]);
// //     }
// //   };

// //   const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
// //     e.preventDefault();
// //     const user = auth.currentUser;
// //     if (!user || isLoading || tweet === "" || tweet.length > 180) return;
// //     try {
// //       setLoading(true);
// //       await addDoc(collection(db, "tweets"), {
// //         tweet,
// //         createdAt: Date.now(),
// //         username: user.displayName || "Anonymous",
// //         userId: user.uid,
// //         photo: file || null,
// //       });
// //       setTweet("");
// //       setFile(null);
// //     } catch (e) {
// //       console.log(e);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Form onSubmit={onSubmit}>
// //       <TextArea
// //         rows={5}
// //         required
// //         maxLength={180}
// //         onChange={onChange}
// //         value={tweet}
// //         placeholder="What is happening?"
// //       />
// //       <AttachFileButton htmlFor="file">
// //         {file ? "Photo added 🌠 ✅" : "Add photo"}
// //       </AttachFileButton>
// //       <AttachFileInput
// //         onChange={onFileChange}
// //         type="file"
// //         id="file"
// //         accept="image/*"
// //       />
// //       {file && <img src={file} alt="uploaded" style={{ width: "5%", borderRadius: "20px" }} />}

// //       <SubmitBtn type="submit" value={isLoading ? "Posting" : "Post Tweet"} />
// //     </Form>
// //   );
// // }

// // //(2) import { useState } from "react";
// // // import styled from "styled-components";
// // // import { auth } from "../routes/firebase";
// // // import { db } from "../routes/firebase";
// // // import { addDoc, collection, doc } from "firebase/firestore";
// // // import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


// // // const Form = styled.form`
// // //   display: flex;
// // //   flex-direction: column;
// // //   gap: 10px;
// // //   `;
// // // const TextArea = styled.textarea`
// // //   border: 2px solid white;
// // //   padding: 20px;
// // //   border-radius: 20px;
// // //   font-size: 16px;
// // //   color: white;
// // //   background-color: black;
// // //   width: 100%;
// // //   resize: none;
// // //   font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

// // //   &::placeholder {
// // //     font-size: 16px;
// // //     font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
// // //   }
// // //   &:focus {
// // //     outline: none;
// // //     border-color: #1d9bf0;
// // //   }
// // //   ;
// // //   `;
// // // const AttachFileButton = styled.label`
// // //    padding: 10px 0px;
// // //    color: #1d9bf0;
// // //    text-align: center;
// // //    border-radius: 20px;
// // //    border: 1px solid #1d9bf0;
// // //    font-size: 14px;
// // //    font-weight: 600;
// // //    cursor: pointer;
// // //    `;
// // // const AttachFileInput = styled.input`
// // //   display: none;
// // //   `;
// // // const SubmitBtn = styled.input`
// // //   background-color: #1d9bf0;
// // //   color: white;
// // //   border: none;
// // //   padding: 10px 0px;
// // //   border-radius: 20px;
// // //   font-size: 16px;
// // //   cursor: pointer;
// // //   &:hover,
// // //   &:active{
// // //     opacity: 0.8;
// // //   }`;


// // // export default function PostTweetForm(){

// // //     const[isLoading, setLoading] = useState(false);
// // //     const[tweet, setTweet] = useState("");
// // //     const[file, setFile] = useState<File | null>(null);
// // //     const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
// // //         setTweet(e.target.value);
// // //     };

// // //     const onFileChange = (e: React.ChangeEvent) => {
// // //         const {files} = e.target;
// // //         if (files && files.length === 1) {
// // //             const reader = new FileReader();
// // //             reader.onloadend = () => {
// // //                 setFile(reader.result as string);
// // //             };
// // //             reader.readAsDataURL(files[0]);
// // // }
// // // }
    
// // //     const onSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
// // //         e.preventDefault();
// // //         const user= auth.currentUser
// // //         if(!user || isLoading || tweet === "" || tweet.length > 180) return;
// // //         try{
// // //             setLoading(true);
// // //             await addDoc(collection(db,"tweets"),{
// // //                 tweet,
// // //                 createdAt: Date.now(),
// // //                 username: user.displayName || "Anonymous", 
// // //                 useId: user.uid,
// // //                 fileData: file
// // //             });
// // //             if(file) {
// // //                 const locationRef = ref(
// // //                     db,
// // //                     `tweets/${user.uid}-${user.displayName}/${doc.id}`
// // //                 );
// // //                 const result = await uploadBytes(locationRef, file);
// // //                 const url = await getDownloadURL(result.ref);
// // //             }
// // //         } catch(e) {
// // //             console.log(e);
// // //         } finally {
// // //             setLoading(false);
// // //         }
// // //     }

// // //     return <Form onSubmit={onSubmit}>
// // //         <TextArea 
// // //         rows={5}
// // //         required
// // //         maxLength={180}
// // //         onChange={onChange}
// // //         value={tweet}
// // //         placeholder="What is happening?"/>
// // //         <AttachFileButton htmlFor="file">
// // //              {file ? "Photo added 🌠 ✅" : "Add photo"}
// // //              </AttachFileButton>
// // //         <AttachFileInput 
// // //          onChange={onFileChange}
// // //          type="file" id="file" accept="image/*" />
// // //         <SubmitBtn type="submit" value={isLoading ? "Posting":"Post Tweet"}/>
// // //     </Form>

// // // }