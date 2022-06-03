import "./app.css";
import { Fragment, useEffect, useState } from "react";
import Unity, { UnityContext } from "react-unity-webgl";
import soulofoxLogo from "./assets/soulofox-logo.png"

interface Vector2 {
  x: number;
  y: number;
}

// This is the context that Unity will use to communicate with the React app.
const unityContext = new UnityContext({
  productName: "React Unity WebGL Tests",
  companyName: "Jeffrey Lanters",
  // The url's of the Unity WebGL runtime, these paths are public and should be
  // accessible from the internet and relative to the index.html.
  loaderUrl: "unitybuild/test/game-build.loader.js",
  dataUrl: "unitybuild/test/game-build.data",
  frameworkUrl: "unitybuild/test/game-build.framework.js",
  codeUrl: "unitybuild/test/game-build.wasm",
  streamingAssetsUrl: "unitybuild/test/streamingassets",
  // Additional configuration options.
  webglContextAttributes: {
    preserveDrawingBuffer: true,
  },
});

// This is the React component that will be rendering the Unity app.
function App() {
  // The app's state.
  const [isUnityMounted, setIsUnityMounted] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(30);
  const [cubeRotation, setCubeRotation] = useState<number>(0);
  const [clickPosition, setClickPosition] = useState<Vector2>({ x: 0, y: 0 });
  const [saidMessage, setSaidMessage] = useState<string>("Nothing");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [progression, setProgression] = useState<number>(0);
  const [email, setEmail] = useState("")
  const [walletAddress, setWalletAddress] = useState("")


  // When the component is mounted, we'll register some event listener.
  useEffect(() => {
    
    unityContext.on("canvas", handleOnUnityCanvas);
    unityContext.on("progress", handleOnUnityProgress);
    unityContext.on("loaded", handleOnUnityLoaded);
    unityContext.on("RotationDidUpdate", handleOnUnityRotationDidUpdate);
    unityContext.on("ClickedPosition", handleOnUnityClickedPosition);
    unityContext.on("Say", handleOnUnitySayMessage);
    unityContext.on("Connect", handleOnUnityConnect);
    setTimeout(() => {
      // @ts-ignore: Unreachable code error
      window.unityInstance = unityContext.unityInstance;
      console.log("unity instance loaded")
    }, 5000);
    // When the component is unmounted, we'll unregister the event listener.
    return function () {
      unityContext.removeAllEventListeners();
    };

  }, []);

  // When the rotation speed has been updated, it will be sent to Unity.
  useEffect(() => {
    unityContext.send("MeshCrate", "SetRotationSpeed", rotationSpeed);
  }, [rotationSpeed]);

  useEffect(() => {
    unityContext.send("Container - Login Code", "ReactEmailVerifySuccess", email);
  }, [email]);

  useEffect(() => {
    if(walletAddress !== "")
    unityContext.send("ButtonSendMessage", "SetAddress", walletAddress);
  }, [walletAddress]);

  // Built-in event invoked when the Unity canvas is ready to be interacted with.
  function handleOnUnityCanvas(canvas: HTMLCanvasElement) {
    canvas.setAttribute("role", "unityCanvas");

  }

  // Built-in event invoked when the Unity app's progress has changed.
  function handleOnUnityProgress(progression: number) {
    setProgression(progression);
  }

  // Built-in event invoked when the Unity app is loaded.
  function handleOnUnityLoaded() {
    setIsLoaded(true);
  }

  // Custom event invoked when the Unity app sends a message indicating that the
  // rotation has changed.
  function handleOnUnityRotationDidUpdate(degrees: number) {
    setCubeRotation(Math.round(degrees));
  }

  // Custom event invoked when the Unity app sends a message indicating that the
  // mouse click position has changed.
  function handleOnUnityClickedPosition(x: number, y: number) {
    setClickPosition({ x, y });
  }

  // Custom event invoked when the Unity app sends a message including something
  // it said.
  function handleOnUnitySayMessage(message: string) {
    setSaidMessage(message);
  }

  async function handleOnUnityConnect(message: string) {
    console.log(message);
    await checkIfWalletIsConnected()
  }

  function handleOnClickLogin(){
    setEmail("arunbluez@gmail.com")
  }
  // Event invoked when the user clicks the button, the speed will be increased.
  function handleOnClickIncreaseSpeed() {
    setRotationSpeed(rotationSpeed + 15);
  }

  // Event invoked when the user clicks the button, the speed will be decreased.
  function handleOnClickDecreaseSpeed() {
    setRotationSpeed(rotationSpeed - 15);
  }

  // Event invoked when the user clicks the button, the unity container will be
  // mounted or unmounted depending on the current mounting state.
  function handleOnClickUnMountUnity() {
    if (isLoaded === true) {
      setIsLoaded(false);
    }
    setIsUnityMounted(isUnityMounted === false);
  }


  const checkIfWalletIsConnected = async () => {
    const windowObj:any = window;

    if (windowObj.solana) {
      const response = await windowObj.solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };



  // This is the React component that will be rendering the Unity app.
  return (
    <Fragment>
      <div className="wrapper">
        {/* Introduction text */}
        <img src={soulofoxLogo} />
        <h1>Soulofox Test Build</h1>
        {/* <p>
          In this React Application we'll explore the possibilities with the
          React Unity WebGL Module. Use the built-in events, custom events,
          mount, unmount, press the buttons and resize the view to see the magic
          in action.
        </p> */}
        {/* Some buttons to interact */}
       <button onClick={handleOnClickLogin}>Login</button>
         {/* <button onClick={handleOnClickIncreaseSpeed}>Increase speed</button>
        <button onClick={handleOnClickDecreaseSpeed}>Decrease speed</button> */}
        {/* The Unity container */}
        {isUnityMounted === true && (
          <Fragment>
            <div className="unity-container">
              {/* The loading screen will be displayed here. */}
              {isLoaded === false && (
                <div className="loading-overlay">
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: progression * 100 + "%" }}
                    />
                  </div>
                </div>
              )}
              {/* The Unity app will be rendered here. */}
              <Unity className="unity-canvas" unityContext={unityContext} />
            </div>
            {/* Displaying some output values */}
            {/* <p>
              The cube is rotated <b>{cubeRotation}</b> degrees
              <br />
              The Unity app said <b>"{saidMessage}"</b>!
              <br />
              Clicked at <b>x{clickPosition.x}</b>, <b>y{clickPosition.y}</b>
            </p> */}
          </Fragment>
        )}
        {/* <h6>
          Made with love by{" "}
          <a href="https://github.com/jeffreylanters">Jeffrey Lanters</a>
        </h6> */}
      </div>
    </Fragment>
  );
}

export default App;
