import { GithubAuthProvider, sendPasswordResetEmail, signInWithPopup } from "firebase/auth";
import styled from "styled-components";
import { auth } from "../routes/firebase";
import { useNavigate } from "react-router-dom";

const Button = styled.span`
  margin-top: 50px;
  background-color: white;
  font-weight: 500px;
  width: 100%;
  color: black;
  padding: 10px 20px;
  border-radius: 50px;
  border: none;
  display: flex;
  gap: 5px;
  align-items: center;
  cursor: pointer;
  background-color: #f5f5f5;
  transition: background-color 0.2s;
  justify-content: center; 
  &:hover {
    background-color: #e0e0e0;
  }
`;

const Logo = styled.img`
  height: 25px;
`;

export default function GithubButton() {
    const navigate = useNavigate();
    const onClick = async() => {
        try{
         const provider = new GithubAuthProvider();
         await signInWithPopup(auth, provider);
          navigate("/");
          sendPasswordResetEmail
        } catch (error) {
            console.log(error);
        }


    }
  return (
    <Button onClick={onClick}>
      <Logo src="/github-logo.svg" alt="GitHub" />
      Continue with Github

    </Button>
  );
}
