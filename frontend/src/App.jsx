import { auth } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { useEffect, useState } from "react";
import {
  Sparkles,
  ArrowUpRight,
  Download,
  WandSparkles,
  Image as ImageIcon,
  Layers3,
  Zap,
  Menu,
  X,
  ChevronDown,
  Copy,
  Check
} from "lucide-react";

import "./index.css";

const API_URL = "https://gen-ai-image-generator-with-promt.onrender.com";

const showcaseCards = [
  {
    title: "Dreamscape",
    type: "Fantasy",
    className: "art-one"
  },
  {
    title: "Neon Future",
    type: "Cyberpunk",
    className: "art-two"
  },
  {
    title: "Cosmic Journey",
    type: "Sci-Fi",
    className: "art-three"
  },
  {
    title: "Mystic Forest",
    type: "Fantasy",
    className: "art-four"
  }
];

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("auraUser")) || null;
  } catch {
    return null;
  }
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card glass">
      <div className="feature-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{description}</p>

      <div className="card-arrow">
        <ArrowUpRight size={17} />
      </div>
    </div>
  );
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const [style, setStyle] = useState("Cinematic");
  const [aspectRatio, setAspectRatio] = useState("Square");
  const [selectedHistoryImage, setSelectedHistoryImage] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  const [user, setUser] = useState(getStoredUser);

  const [token, setToken] = useState(
    localStorage.getItem("firebaseToken") || ""
  );

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ==========================================
  // FETCH GENERATION HISTORY
  // ==========================================

  const fetchHistory = async (authToken = token) => {
    if (!authToken) {
      setHistory([]);
      return;
    }

    try {
      const headers = {};

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(
        `${API_URL}/api/ai/history`,
        {
          method: "GET",
          headers
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch history"
        );
      }

      setHistory(data.generations || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  // ==========================================
  // FIREBASE AUTH STATE
  // ==========================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const firebaseToken =
              await firebaseUser.getIdToken();

            const userData = {
              id: firebaseUser.uid,
              name:
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                "User",
              email: firebaseUser.email || ""
            };

            localStorage.setItem(
              "firebaseToken",
              firebaseToken
            );

            localStorage.setItem(
              "auraUser",
              JSON.stringify(userData)
            );

            setToken(firebaseToken);
            setUser(userData);
          } catch (error) {
            console.error(
              "Failed to restore Firebase session:",
              error
            );

            localStorage.removeItem("firebaseToken");
            localStorage.removeItem("auraUser");
            setToken("");
            setUser(null);
          }
        } else {
          localStorage.removeItem("firebaseToken");
          localStorage.removeItem("auraUser");

          setToken("");
          setUser(null);
          setHistory([]);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // ==========================================
  // LOAD HISTORY WHEN USER IS LOGGED IN
  // ==========================================

  useEffect(() => {
    if (token) {
      fetchHistory(token);
    } else {
      setHistory([]);
    }
  }, [token]);

  // ==========================================
  // LOGIN / REGISTER
  // ==========================================

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!authEmail.trim() || !authPassword.trim()) {
      alert("Please enter email and password.");
      return;
    }

    if (authMode === "register" && !authName.trim()) {
      alert("Please enter your name.");
      return;
    }

    setAuthLoading(true);

    try {
      let firebaseUser;

      if (authMode === "register") {
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            authEmail.trim(),
            authPassword
          );

        firebaseUser = userCredential.user;

        if (authName.trim()) {
          await updateProfile(firebaseUser, {
            displayName: authName.trim()
          });
        }
      } else {
        const userCredential =
          await signInWithEmailAndPassword(
            auth,
            authEmail.trim(),
            authPassword
          );

        firebaseUser = userCredential.user;
      }

      const firebaseToken =
        await firebaseUser.getIdToken(true);

      const userData = {
        id: firebaseUser.uid,
        name:
          firebaseUser.displayName ||
          authName.trim() ||
          firebaseUser.email?.split("@")[0] ||
          "User",
        email: firebaseUser.email || ""
      };

      localStorage.setItem(
        "firebaseToken",
        firebaseToken
      );

      localStorage.setItem(
        "auraUser",
        JSON.stringify(userData)
      );

      setToken(firebaseToken);
      setUser(userData);
      setShowAuth(false);

      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");

      await fetchHistory(firebaseToken);

      console.log(
        `Firebase ${
          authMode === "login" ? "login" : "registration"
        } successful:`,
        firebaseUser.uid
      );
    } catch (error) {
      console.error(
        "Firebase authentication error:",
        error
      );

      let message = "Authentication failed.";

      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already registered.";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          message =
            "Password should be at least 6 characters.";
          break;
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          message = "Invalid email or password.";
          break;
        case "auth/too-many-requests":
          message =
            "Too many attempts. Please try again later.";
          break;
        case "auth/network-request-failed":
          message =
            "Network error. Please check your internet connection.";
          break;
        default:
          message =
            error.message || "Authentication failed.";
      }

      alert(message);
    } finally {
      setAuthLoading(false);
    }
  };

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogleLogin = async () => {
    setAuthLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account"
      });

      const result = await signInWithPopup(
        auth,
        provider
      );

      const firebaseUser = result.user;

      const firebaseToken =
        await firebaseUser.getIdToken(true);

      const userData = {
        id: firebaseUser.uid,
        name:
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          "User",
        email: firebaseUser.email || ""
      };

      localStorage.setItem(
        "firebaseToken",
        firebaseToken
      );

      localStorage.setItem(
        "auraUser",
        JSON.stringify(userData)
      );

      setToken(firebaseToken);
      setUser(userData);
      setShowAuth(false);

      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");

      await fetchHistory(firebaseToken);

      console.log(
        "Google login successful:",
        firebaseUser.uid
      );
    } catch (error) {
      console.error(
        "Google login error:",
        error
      );

      let message = "Google login failed.";

      switch (error.code) {
        case "auth/popup-closed-by-user":
          message = "Google login was cancelled.";
          break;

        case "auth/popup-blocked":
          message =
            "The Google login popup was blocked by your browser.";
          break;

        case "auth/unauthorized-domain":
          message =
            "This website domain is not authorized in Firebase.";
          break;

        case "auth/account-exists-with-different-credential":
          message =
            "An account already exists with this email using another sign-in method. Sign in with that method first.";
          break;

        case "auth/network-request-failed":
          message =
            "Network error. Please check your internet connection.";
          break;

        default:
          message =
            error.message || "Google login failed.";
      }

      alert(message);
    } finally {
      setAuthLoading(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = async () => {
    try {
      await signOut(auth);

      localStorage.removeItem("firebaseToken");
      localStorage.removeItem("auraUser");
      localStorage.removeItem("auraToken");

      setToken("");
      setUser(null);
      setHistory([]);
      setGeneratedImage("");
      setEnhancedPrompt("");

      console.log("Firebase logout successful.");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  // ==========================================
  // GENERATE IMAGE
  // ==========================================

  const generateImage = async () => {
    if (!user || !auth.currentUser) {
      setAuthMode("login");
      setShowAuth(true);
      return;
    }

    if (!prompt.trim()) {
      return;
    }

    setLoading(true);
    setGeneratedImage("");
    setEnhancedPrompt("");

    try {
      const currentToken =
        await auth.currentUser.getIdToken();

      setToken(currentToken);

      // ----------------------------------------
      // STEP 1: ENHANCE PROMPT
      // ----------------------------------------

      const enhanceResponse = await fetch(
        `${API_URL}/api/ai/enhance-prompt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(currentToken
              ? {
                  Authorization: `Bearer ${currentToken}`
                }
              : {})
          },
          body: JSON.stringify({
            prompt: prompt.trim()
          })
        }
      );

      const enhanceData =
        await enhanceResponse.json();

      if (
        !enhanceResponse.ok ||
        !enhanceData.success
      ) {
        throw new Error(
          enhanceData.message ||
            "Failed to enhance prompt"
        );
      }

      const finalEnhancedPrompt =
        enhanceData.enhancedPrompt ||
        prompt.trim();

      setEnhancedPrompt(finalEnhancedPrompt);

      // ----------------------------------------
      // STEP 2: GENERATE IMAGE
      // ----------------------------------------

      const imageResponse = await fetch(
        `${API_URL}/api/ai/generate-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(currentToken
              ? {
                  Authorization: `Bearer ${currentToken}`
                }
              : {})
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
            enhancedPrompt: finalEnhancedPrompt,
            style,
            aspectRatio
          })
        }
      );

      if (!imageResponse.ok) {
        let errorMessage =
          "Image generation failed";

        try {
          const errorData =
            await imageResponse.json();

          errorMessage =
            errorData.message ||
            errorMessage;
        } catch {
          // Response was not JSON.
        }

        throw new Error(errorMessage);
      }

      const imageBlob =
        await imageResponse.blob();

      const imageUrl =
        URL.createObjectURL(imageBlob);

      setGeneratedImage(imageUrl);

      // Refresh history after successful generation.
      await fetchHistory(currentToken);
    } catch (error) {
      console.error(
        "Image generation error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while generating the image."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DOWNLOAD CURRENT IMAGE
  // ==========================================

  const downloadImage = () => {
    if (!generatedImage) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = generatedImage;
    link.download =
      "Pixora-ai-generated.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // COPY ENHANCED PROMPT
  // ==========================================

  const copyPrompt = async () => {
    if (!enhancedPrompt) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        enhancedPrompt
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error(
        "Failed to copy prompt:",
        error
      );
    }
  };

  // ==========================================
  // DELETE HISTORY ITEM
  // ==========================================

  const deleteHistoryItem = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this generated image? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/ai/history/${id}`,
        {
          method: "DELETE",
          headers: token
            ? {
                Authorization: `Bearer ${token}`
              }
            : {}
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete generation"
        );
      }

      setHistory((prevHistory) =>
        prevHistory.filter(
          (item) => item._id !== id
        )
      );

      if (
        selectedHistoryImage?._id === id
      ) {
        setSelectedHistoryImage(null);
      }
    } catch (error) {
      console.error(
        "Delete history error:",
        error
      );

      alert("Failed to delete image.");
    }
  };

  // ==========================================
  // TOGGLE FAVORITE
  // ==========================================

  const toggleFavorite = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/api/ai/history/${id}/favorite`,
        {
          method: "PATCH",
          headers: token
            ? {
                Authorization: `Bearer ${token}`
              }
            : {}
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update favorite"
        );
      }

      setHistory((prevHistory) =>
        prevHistory.map((item) =>
          item._id === id
            ? {
                ...item,
                favorite: data.favorite
              }
            : item
        )
      );

      setSelectedHistoryImage(
        (current) =>
          current?._id === id
            ? {
                ...current,
                favorite: data.favorite
              }
            : current
      );
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );

      alert(
        "Failed to update favorite."
      );
    }
  };

  // ==========================================
  // DOWNLOAD HISTORY IMAGE
  // ==========================================

  const downloadHistoryImage = (item) => {
    if (!item?.imageData) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = item.imageData;
    link.download =
      `Pixora-ai-${item._id}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app">

      {/* ======================================
          AMBIENT BACKGROUND
      ====================================== */}

      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>
      <div className="ambient ambient-three"></div>

      {/* ======================================
          NAVBAR
      ====================================== */}

      <header className="navbar glass">

        <div className="brand">

          <div className="brand-icon">
            <Sparkles size={18} />
          </div>

          <span>Pixora</span>
          <small>AI</small>

        </div>

        <nav
          className={
            mobileMenu
              ? "nav-links mobile-open"
              : "nav-links"
          }
        >

          <a
            href="#home"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            Home
          </a>

          <a
            href="#create"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            Create
          </a>

          <a
            href="#gallery"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            Gallery
          </a>

          <a
            href="#history"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            History
          </a>

          <a
            href="#features"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            Features
          </a>

          <a
            href="#about"
            onClick={() =>
              setMobileMenu(false)
            }
          >
            About
          </a>

        </nav>

        <div className="nav-actions">

          {user ? (
            <>
              <div className="user-pill glass">

                <span className="user-avatar">
                  {user.name
                    ?.charAt(0)
                    .toUpperCase()}
                </span>

                <span>
                  {user.name}
                </span>

              </div>

              <button
                type="button"
                className="login-button"
                onClick={logout}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="login-button"
                onClick={() => {
                  setAuthMode("login");
                  setShowAuth(true);
                }}
              >
                Log in
              </button>

              <button
                type="button"
                className="nav-create"
                onClick={() => {
                  setAuthMode("register");
                  setShowAuth(true);
                }}
              >
                Get Started
                <ArrowUpRight size={15} />
              </button>
            </>
          )}

        </div>

        <button
          type="button"
          className="menu-button"
          onClick={() =>
            setMobileMenu(!mobileMenu)
          }
        >
          {mobileMenu ? (
            <X />
          ) : (
            <Menu />
          )}
        </button>

      </header>

      {/* ======================================
          HERO
      ====================================== */}

      <main id="home">

        <section className="hero">

          <div className="hero-badge glass">
            <span className="status-dot"></span>
            Powered by Generative AI
            <Sparkles size={14} />
          </div>

          <h1>
            Imagine it.
            <br />
            <span>
              Bring it to life.
            </span>
          </h1>

          <p className="hero-description">
            Turn your imagination into
            stunning visuals with
            intelligent prompt enhancement
            and AI-powered image generation.
          </p>

          {/* ==================================
              GENERATOR
          ================================== */}

          <div
            id="create"
            className="generator glass"
          >

            <div className="generator-top">

              <div className="generator-label">

                <WandSparkles size={18} />

                <span>
                  Create an image
                </span>

              </div>

              <div className="model-pill">

                <span className="tiny-dot"></span>

                FLUX AI

                <ChevronDown size={14} />

              </div>

            </div>

            <textarea
              value={prompt}
              onChange={(e) =>
                setPrompt(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  generateImage();
                }
              }}
              placeholder="Describe anything you can imagine..."
              rows="3"
            />

            <div className="generation-options">

              <div className="option-group">

                <label>Style</label>

                <select
                  value={style}
                  onChange={(e) =>
                    setStyle(e.target.value)
                  }
                >
                  <option value="Cinematic">
                    Cinematic
                  </option>

                  <option value="Photorealistic">
                    Photorealistic
                  </option>

                  <option value="Anime">
                    Anime
                  </option>

                  <option value="3D Render">
                    3D Render
                  </option>

                  <option value="Fantasy">
                    Fantasy
                  </option>

                  <option value="Cyberpunk">
                    Cyberpunk
                  </option>
                </select>

              </div>

              <div className="option-group">

                <label>
                  Aspect Ratio
                </label>

                <select
                  value={aspectRatio}
                  onChange={(e) =>
                    setAspectRatio(
                      e.target.value
                    )
                  }
                >
                  <option value="Square">
                    Square · 1:1
                  </option>

                  <option value="Portrait">
                    Portrait · 2:3
                  </option>

                  <option value="Landscape">
                    Landscape · 3:2
                  </option>

                  <option value="Wide">
                    Wide · 16:9
                  </option>
                </select>

              </div>

            </div>

            <div className="generator-bottom">

              <div className="prompt-hints">

                <span>Try:</span>

                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      "A futuristic city floating above the clouds"
                    )
                  }
                >
                  Futuristic city
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      "A magical forest with glowing flowers"
                    )
                  }
                >
                  Magical forest
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPrompt(
                      "A cinematic astronaut exploring Mars"
                    )
                  }
                >
                  Space
                </button>

              </div>

              <button
                type="button"
                className="generate-button"
                onClick={generateImage}
                disabled={
                  loading ||
                  !prompt.trim()
                }
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    Generate
                    <Sparkles size={17} />
                  </>
                )}
              </button>

            </div>

          </div>

          {/* ==================================
              MINI CAPABILITIES
          ================================== */}

          <div className="hero-features">

            <div>
              <WandSparkles size={16} />
              <span>
                Smart Prompt Enhancement
              </span>
            </div>

            <div>
              <ImageIcon size={16} />
              <span>
                AI Image Generation
              </span>
            </div>

            <div>
              <Zap size={16} />
              <span>
                Fast & Simple
              </span>
            </div>

          </div>

        </section>

        {/* ======================================
            GENERATED RESULT
        ====================================== */}

        {(loading || generatedImage) && (
          <section className="result-section">

            <div className="section-heading">

              <div>

                <span className="eyebrow">
                  YOUR CREATION
                </span>

                <h2>
                  From words to
                  <span> visuals.</span>
                </h2>

              </div>

              {generatedImage && (
                <button
                  type="button"
                  className="download-button glass"
                  onClick={downloadImage}
                >
                  <Download size={16} />
                  Download
                </button>
              )}

            </div>

            <div className="result-layout">

              <div className="image-result glass">

                {loading ? (
                  <div className="loading-screen">

                    <div className="loading-orb">
                      <Sparkles size={30} />
                    </div>

                    <h3>
                      Creating your vision...
                    </h3>

                    <p>
                      Enhancing your prompt
                      and generating your image.
                    </p>

                    <div className="loading-bar">
                      <span></span>
                    </div>

                  </div>
                ) : (
                  <img
                    src={generatedImage}
                    alt="AI generated artwork"
                  />
                )}

              </div>

              {enhancedPrompt &&
                !loading && (
                  <div className="prompt-result glass">

                    <div className="prompt-result-header">

                      <div>

                        <span className="eyebrow">
                          AI ENHANCED PROMPT
                        </span>

                        <h3>
                          Your idea, refined.
                        </h3>

                      </div>

                      <button
                        type="button"
                        className="icon-button"
                        onClick={copyPrompt}
                      >
                        {copied ? (
                          <Check size={17} />
                        ) : (
                          <Copy size={17} />
                        )}
                      </button>

                    </div>

                    <p>
                      {enhancedPrompt}
                    </p>

                    <div className="prompt-tag">
                      <Sparkles size={13} />
                      Enhanced by AI
                    </div>

                  </div>
                )}

            </div>

          </section>
        )}

        {/* ======================================
            GENERATION HISTORY
        ====================================== */}

        <section
          id="history"
          className="history-section"
        >

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                YOUR CREATIONS
              </span>

              <h2>
                Generation
                <span> history.</span>
              </h2>

            </div>

            <div className="history-controls">

              <button
                type="button"
                className={`history-filter-button ${
                  showFavoritesOnly
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setShowFavoritesOnly(
                    !showFavoritesOnly
                  )
                }
              >
                ❤️ Favorites
              </button>

              <div className="history-count glass">
                {history.length} creations
              </div>

            </div>

          </div>

          {history.length === 0 ? (
            <div className="empty-history glass">

              <div className="empty-icon">
                <ImageIcon size={24} />
              </div>

              <h3>
                No creations yet
              </h3>

              <p>
                Your generated images
                will appear here.
              </p>

            </div>
          ) : (
            <div className="history-grid">

              {history
                .filter(
                  (item) =>
                    !showFavoritesOnly ||
                    item.favorite
                )
                .map((item) => (
                  <div
                    className="history-card glass"
                    key={item._id}
                  >

                    <div
                      className="history-image-wrapper"
                      onClick={() =>
                        setSelectedHistoryImage(
                          item
                        )
                      }
                    >
                      <img
                        src={item.imageData}
                        alt={item.prompt}
                        className="history-image"
                      />

                      <div className="history-image-overlay">
                        <span>
                          🔍 View
                        </span>
                      </div>
                    </div>

                    <div className="history-info">

                      <p className="history-prompt">
                        {item.prompt}
                      </p>

                      <div className="history-tags">

                        <span className="history-tag">
                          🎨{" "}
                          {item.style ||
                            "Cinematic"}
                        </span>

                        <span className="history-tag">
                          📐{" "}
                          {item.aspectRatio ||
                            "Square"}
                        </span>

                      </div>

                      <span className="history-date">
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString()}
                      </span>

                      <div className="history-actions">

                        <button
                          type="button"
                          className={`history-action-button favorite-button ${
                            item.favorite
                              ? "favorited"
                              : ""
                          }`}
                          onClick={() =>
                            toggleFavorite(
                              item._id
                            )
                          }
                          title={
                            item.favorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          ❤️

                          <span>
                            {item.favorite
                              ? "Favorited"
                              : "Favorite"}
                          </span>
                        </button>

                        <button
                          type="button"
                          className="history-action-button"
                          onClick={() =>
                            downloadHistoryImage(
                              item
                            )
                          }
                          title="Download image"
                        >
                          <Download size={15} />

                          <span>
                            Download
                          </span>
                        </button>

                        <button
                          type="button"
                          className="history-action-button delete"
                          onClick={() =>
                            deleteHistoryItem(
                              item._id
                            )
                          }
                          title="Delete image"
                        >
                          <X size={15} />

                          <span>
                            Delete
                          </span>
                        </button>

                      </div>

                    </div>

                  </div>
                ))}

            </div>
          )}

          {/* ======================================
              FULL SCREEN IMAGE VIEWER
          ====================================== */}

          {selectedHistoryImage && (
            <div
              className="history-modal"
              onClick={() =>
                setSelectedHistoryImage(
                  null
                )
              }
            >

              <div
                className="history-modal-content glass"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                <button
                  type="button"
                  className="history-modal-close"
                  onClick={() =>
                    setSelectedHistoryImage(
                      null
                    )
                  }
                >
                  <X size={20} />
                </button>

                <img
                  src={
                    selectedHistoryImage.imageData
                  }
                  alt={
                    selectedHistoryImage.prompt
                  }
                  className="history-modal-image"
                />

                <div className="history-modal-info">

                  <span className="eyebrow">
                    AI GENERATED IMAGE
                  </span>

                  <h3>
                    {selectedHistoryImage.prompt}
                  </h3>

                  <div className="history-tags">

                    <span className="history-tag">
                      🎨{" "}
                      {selectedHistoryImage.style ||
                        "Cinematic"}
                    </span>

                    <span className="history-tag">
                      📐{" "}
                      {selectedHistoryImage.aspectRatio ||
                        "Square"}
                    </span>

                    <span className="history-tag">
                      🤖 FLUX.1-schnell
                    </span>

                  </div>

                  <p className="history-enhanced-prompt">
                    {
                      selectedHistoryImage.enhancedPrompt
                    }
                  </p>

                  <div className="history-modal-actions">

                    <button
                      type="button"
                      className={`history-action-button favorite-button ${
                        selectedHistoryImage.favorite
                          ? "favorited"
                          : ""
                      }`}
                      onClick={() =>
                        toggleFavorite(
                          selectedHistoryImage._id
                        )
                      }
                    >
                      ❤️{" "}
                      {selectedHistoryImage.favorite
                        ? "Remove Favorite"
                        : "Add to Favorites"}
                    </button>

                    <button
                      type="button"
                      className="history-action-button delete"
                      onClick={() =>
                        deleteHistoryItem(
                          selectedHistoryImage._id
                        )
                      }
                    >
                      <X size={16} />
                      Delete Image
                    </button>

                    <button
                      type="button"
                      className="history-action-button"
                      onClick={() =>
                        downloadHistoryImage(
                          selectedHistoryImage
                        )
                      }
                    >
                      <Download size={16} />
                      Download Image
                    </button>

                  </div>

                </div>

              </div>

            </div>
          )}

        </section>

        {/* ======================================
            SHOWCASE
        ====================================== */}

        <section
          id="gallery"
          className="showcase"
        >

          <div className="section-heading centered">

            <span className="eyebrow">
              EXPLORE THE POSSIBILITIES
            </span>

            <h2>
              Imagination has
              <span> no limits.</span>
            </h2>

            <p>
              A glimpse of what you can
              create with Pixora AI.
            </p>

          </div>

          <div className="art-grid">

            {showcaseCards.map((card) => (
              <div
                className={`art-card ${card.className}`}
                key={card.title}
              >

                <div className="art-overlay">

                  <div>

                    <span>
                      {card.type}
                    </span>

                    <h3>
                      {card.title}
                    </h3>

                  </div>

                  <ArrowUpRight size={20} />

                </div>

              </div>
            ))}

          </div>

        </section>

        {/* ======================================
            FEATURES
        ====================================== */}

        <section
          id="features"
          className="features-section"
        >

          <div className="section-heading centered">

            <span className="eyebrow">
              WHY Pixora AI
            </span>

            <h2>
              Powerful tools.
              <span>
                Simple experience.
              </span>
            </h2>

          </div>

          <div className="feature-grid">

            <FeatureCard
              icon={<WandSparkles />}
              title="Smart prompts"
              description="Turn simple ideas into detailed, visually rich prompts automatically."
            />

            <FeatureCard
              icon={<ImageIcon />}
              title="AI image generation"
              description="Transform enhanced prompts into original AI-generated artwork."
            />

            <FeatureCard
              icon={<Layers3 />}
              title="Creative gallery"
              description="Keep your favorite creations organized and easy to access."
            />

            <FeatureCard
              icon={<Zap />}
              title="Simple & fast"
              description="A clean interface designed to make creating images effortless."
            />

          </div>

        </section>

        {/* ======================================
            ABOUT / CTA
        ====================================== */}

        <section
          id="about"
          className="cta-section"
        >

          <div className="cta glass">

            <div className="cta-orb">
              <Sparkles size={30} />
            </div>

            <span className="eyebrow">
              START CREATING
            </span>

            <h2>
              Your imagination is
              <br />
              the only limit.
            </h2>

            <p>
              Describe an idea.
              We'll turn it into a visual.
            </p>

            <button
              type="button"
              className="generate-button"
              onClick={() => {
                document
                  .getElementById("create")
                  ?.scrollIntoView({
                    behavior: "smooth"
                  });
              }}
            >
              Create something amazing
              <ArrowUpRight size={17} />
            </button>

          </div>

        </section>

      </main>

      {/* ======================================
          AUTHENTICATION MODAL
      ====================================== */}

      {showAuth && (
        <div
          className="auth-modal"
          onClick={() =>
            setShowAuth(false)
          }
        >

          <div
            className="auth-modal-card glass"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="auth-close"
              onClick={() =>
                setShowAuth(false)
              }
            >
              <X size={20} />
            </button>

            <div className="auth-icon">
              <Sparkles size={24} />
            </div>

            <span className="eyebrow">
              Pixora AI
            </span>

            <h2>
              {authMode === "login"
                ? "Welcome back."
                : "Create your account."}
            </h2>

            <p className="auth-description">
              {authMode === "login"
                ? "Sign in to continue creating amazing visuals."
                : "Join Pixora AI and start creating your imagination."}
            </p>

            <form onSubmit={handleAuth}>

              {authMode === "register" && (
                <div className="auth-field">

                  <label htmlFor="auth-name">
                    Name
                  </label>

                  <input
                    id="auth-name"
                    type="text"
                    value={authName}
                    onChange={(e) =>
                      setAuthName(
                        e.target.value
                      )
                    }
                    placeholder="Your name"
                    required
                  />

                </div>
              )}

              <div className="auth-field">

                <label htmlFor="auth-email">
                  Email
                </label>

                <input
                  id="auth-email"
                  type="email"
                  value={authEmail}
                  onChange={(e) =>
                    setAuthEmail(
                      e.target.value
                    )
                  }
                  placeholder="you@example.com"
                  required
                />

              </div>

              <div className="auth-field">

                <label htmlFor="auth-password">
                  Password
                </label>

                <input
                  id="auth-password"
                  type="password"
                  value={authPassword}
                  onChange={(e) =>
                    setAuthPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  required
                />

              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Sign In"
                    : "Create Account"}

                {!authLoading && (
                  <ArrowUpRight size={17} />
                )}
              </button>

            </form>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "20px 0",
                color: "rgba(30,30,50,0.45)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1px"
              }}
            >
              <span
                style={{
                  flex: 1,
                  height: "1px",
                  background:
                    "rgba(255,255,255,0.45)"
                }}
              />
              <span>OR</span>
              <span
                style={{
                  flex: 1,
                  height: "1px",
                  background:
                    "rgba(255,255,255,0.45)"
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              style={{
                width: "100%",
                minHeight: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                borderRadius: "15px",
                border:
                  "1px solid rgba(255,255,255,0.55)",
                background:
                  "rgba(255,255,255,0.28)",
                color: "#171629",
                fontSize: "15px",
                fontWeight: 600,
                cursor: authLoading
                  ? "not-allowed"
                  : "pointer",
                opacity: authLoading ? 0.55 : 1,
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter:
                  "blur(18px)",
                transition:
                  "transform 0.2s ease, background 0.2s ease"
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.71-.06-1.4-.18-2.06H12v3.9h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.23Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.54 13.6A5.85 5.85 0 0 1 6.23 12c0-.56.1-1.1.31-1.6V7.87H3.3A9.5 9.5 0 0 0 2.25 12c0 1.49.36 2.9 1.05 4.13l3.24-2.53Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.38c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.47 14.62 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.37l3.24 2.53C7.31 8.1 9.46 6.38 12 6.38Z"
                />
              </svg>

              Continue with Google
            </button>

            <div className="auth-switch">

              {authMode === "login" ? (
                <>
                  Don't have an account?

                  <button
                    type="button"
                    onClick={() =>
                      setAuthMode(
                        "register"
                      )
                    }
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?

                  <button
                    type="button"
                    onClick={() =>
                      setAuthMode("login")
                    }
                  >
                    Sign in
                  </button>
                </>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ======================================
          FOOTER
      ====================================== */}

      <footer>

        <div className="footer-brand">

          <div className="brand-icon">
            <Sparkles size={16} />
          </div>

          <strong>
            Pixora AI
          </strong>

        </div>

        <p>
          Intelligent text-to-image generation.
        </p>

        <span>
          © 2026 Pixora AI
        </span>

      </footer>

    </div>
  );
}

export default App;
