import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/layout";
import { useEffect, useState } from "react";
import Home from "./routes/home";
import Profile from "./routes/profile";
import Login from "./routes/login";
import CreateAccount from "./routes/create-account";
import styled, { createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import LoadingScreen from "./components/loading-screen";
import { auth } from "./routes/firebase";
import ProtectedRoute from "./components/protected-route";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/create-account",
    element: <CreateAccount />,
  },
]);

const GlobalStyles = createGlobalStyle`
  ${reset};
  * {
    box-sizing: border-box;
  }
  body {
    background-color: black;
    color: white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif ;
  }
`;

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`;

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const init = async () => {
    // 기존 인증 상태 준비 함수 유지
    await auth.authStateReady?.(); // authStateReady가 없으면 무시됨
    setTimeout(() => setIsLoading(false), 2000);
  };

  useEffect(() => {
    init();
  }, []);

  // 여기서 토큰 강제 갱신 주기적 체크 추가
  useEffect(() => {
    // 5분(300,000ms)마다 토큰 강제 갱신 시도
    const interval = setInterval(() => {
      auth.currentUser?.getIdToken(true).catch(() => {
        // 토큰 만료 등 문제가 있으면 자동 로그아웃
        auth.signOut();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // App 컴포넌트 안에 넣어
useEffect(() => {
  const unsubscribe = auth.onIdTokenChanged((user) => {
    if (!user) {
      return;
    }
    user.getIdToken(true).catch(() => {
      auth.signOut();
    });
  });
  return () => unsubscribe();
}, []);

  return (
    <Wrapper>
      <GlobalStyles />
      {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
    </Wrapper>
  );
}

export default App;
// import { createBrowserRouter, Route, RouterProvider } from "react-router-dom"
// import Layout from "./components/layout"
// import { Children, useEffect, useState } from "react"
// import Home from "./routes/home"
// import Profile from "./routes/profile"
// import Login from "./routes/login"
// import CreateAccount from "./routes/create-account"
// import styled, { createGlobalStyle } from "styled-components"
// import reset from "styled-reset"
// import LoadingScreen from "./components/loading-screen"
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "./routes/firebase"
// import ProtectedRoute from "./components/protected-route"

// const router = createBrowserRouter([
//   {
//     path:"/",
//     element: 
//       <ProtectedRoute>
//       <Layout />
//       </ProtectedRoute>,
//     children: [
//       {
//         path:"",
//         element: <Home />,      
//       },
//       {
//         path: "profile",
//         element: <Profile />, 
//       },
//     ],
//   },
//   {
//     path: "/login",
//     element: <Login />
//   },
//   {
//     path: "/create-account", 
//     element:<CreateAccount />
//   },
// ]);

// const GlobalStyles = createGlobalStyle`
//  ${reset};
//  * {
//   box-sizing: border-box;
//  }
//   body {
//   background-color: black;
//   color: white;
//   font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif ;
//   }
//  `;

// const Wrapper = styled.div`
//  height: 100vh;
//  display: flex;
//  justify-content: center;

//  `;

// function App() {
//   const [isLoading, setIsLoading] = useState(true);
//   const init = async() => {
//     await auth.authStateReady();
//     setTimeout(() => setIsLoading(false), 2000)
//     };
//   useEffect(() => {
//     init();
//   }, []);

//   return (
//     <Wrapper>
//      <GlobalStyles />  
//      {isLoading ? <LoadingScreen/> : <RouterProvider router={router} />}
//      {/* <RouterProvider router={router}/> */}
//     </Wrapper>
//   )
// }

// export default App
