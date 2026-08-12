import React, { useState, useEffect } from 'react';
import { Camera, Terminal, Play, HelpCircle, Lock, Unlock, RefreshCw, User, BookOpen, GraduationCap, Home, Trash2 } from 'lucide-react';
import { LEVELS } from './constants';
import { GameState, LevelStatus, LevelData, StudentResult } from './types';
import { CodeEditor } from './components/CodeEditor';
import { VisualOutput } from './components/VisualOutput';
import { getHintFromGemini } from './services/geminiService';

const STORAGE_KEY = 'snt_game_results';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentLevelId: 1,
    levels: { 1: LevelStatus.ACTIVE }, // Others locked
    isGameComplete: false,
    studentName: "",
    isLoggedIn: false,
    showCourse: true // Show course 1 first
  });

  const [currentCode, setCurrentCode] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  
  // Admin State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [classResults, setClassResults] = useState<StudentResult[]>([]);

  const currentLevel: LevelData = LEVELS.find(l => l.id === gameState.currentLevelId) || LEVELS[0];

  // Load results from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setClassResults(JSON.parse(stored));
      } catch (e) {
        console.error("Erreur lecture résultats", e);
      }
    }
  }, []);

  useEffect(() => {
    // Update levels availability when ID changes
    setGameState(prev => {
        const newLevels = { ...prev.levels };
        // Ensure current is active
        newLevels[prev.currentLevelId] = LevelStatus.ACTIVE;
        return { ...prev, levels: newLevels };
    });
    
    // Load code
    const level = LEVELS.find(l => l.id === gameState.currentLevelId);
    if (level) {
        setCurrentCode(level.initialCode);
    }
    setHint(null);
    setIsRunning(false);
  }, [gameState.currentLevelId]);

  // Helper to save progress
  const saveStudentProgress = (name: string, levelId: number, completed: boolean) => {
    if (!name) return;
    
    setClassResults(prev => {
      const newResults = [...prev];
      const index = newResults.findIndex(r => r.name === name);
      
      // Calculate score based on progress (simple percentage of levels passed)
      // Level 1 start = 0%, Level 1 done = 1/6, All done = 100%
      // We assume if levelId is X, user is PLAYING level X, so they finished X-1.
      const levelsFinished = completed ? LEVELS.length : (levelId - 1);
      const score = Math.round((levelsFinished / LEVELS.length) * 100);

      const result: StudentResult = {
        name,
        progress: completed ? LEVELS.length : levelId,
        completed,
        score
      };
      
      if (index >= 0) {
        // Update existing entry
        newResults[index] = result;
      } else {
        // Create new entry
        newResults.push(result);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newResults));
      return newResults;
    });
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const name = gameState.studentName.trim();
      if (name.length > 1) {
          setGameState(prev => ({ ...prev, isLoggedIn: true, showCourse: true }));
          // Initialize progress in storage
          saveStudentProgress(name, 1, false);
      }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (adminPassword === "profsnt") {
          setIsAdminAuthenticated(true);
          setShowAdminLogin(false);
      } else {
          alert("Mot de passe incorrect");
      }
  };

  const handleClearData = () => {
    if (window.confirm("Attention : Cela va effacer l'historique de tous les élèves sur cet ordinateur. Continuer ?")) {
      localStorage.removeItem(STORAGE_KEY);
      setClassResults([]);
    }
  };

  const handleResetGame = () => {
      setGameState({
        currentLevelId: 1,
        levels: { 1: LevelStatus.ACTIVE },
        isGameComplete: false,
        studentName: "",
        isLoggedIn: false,
        showCourse: true
      });
      setIsAdminAuthenticated(false);
  };

  const handleLevelComplete = () => {
    const nextLevelId = gameState.currentLevelId + 1;
    const isFinished = nextLevelId > LEVELS.length;

    // Save persistence
    saveStudentProgress(gameState.studentName, isFinished ? LEVELS.length : nextLevelId, isFinished);

    if (isFinished) {
        setGameState(prev => ({
            ...prev,
            levels: { ...prev.levels, [prev.currentLevelId]: LevelStatus.COMPLETED },
            isGameComplete: true,
            showCourse: false
        }));
    } else {
        setGameState(prev => ({
            ...prev,
            levels: { ...prev.levels, [prev.currentLevelId]: LevelStatus.COMPLETED, [nextLevelId]: LevelStatus.ACTIVE },
            currentLevelId: nextLevelId,
            showCourse: true // Show course for next level
        }));
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  const handleGetHint = async () => {
    if (loadingHint) return;
    setLoadingHint(true);
    const newHint = await getHintFromGemini(currentLevel.hintPrompt, currentCode);
    setHint(newHint);
    setLoadingHint(false);
  };

  // 1. Admin View
  if (isAdminAuthenticated) {
      return (
          <div className="min-h-screen bg-slate-950 p-8">
              <div className="max-w-4xl mx-auto">
                  <header className="flex justify-between items-center mb-8">
                      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                          <GraduationCap className="text-indigo-400" />
                          Tableau de Bord Enseignant
                      </h1>
                      <div className="flex gap-4">
                        <button 
                            onClick={handleClearData}
                            className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 border border-red-900/50 rounded hover:bg-red-900/50 transition-colors"
                        >
                            <Trash2 size={16} /> Effacer les données
                        </button>
                        <button 
                            onClick={() => setIsAdminAuthenticated(false)}
                            className="text-slate-400 hover:text-white px-4 py-2"
                        >
                            Quitter
                        </button>
                      </div>
                  </header>
                  
                  <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                      <table className="w-full text-left text-slate-300">
                          <thead className="bg-slate-800 text-slate-100 uppercase text-xs font-bold">
                              <tr>
                                  <th className="p-4">Élève</th>
                                  <th className="p-4">Niveau Atteint</th>
                                  <th className="p-4">Progression</th>
                                  <th className="p-4">Statut</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                              {classResults.length === 0 ? (
                                  <tr>
                                      <td colSpan={4} className="p-8 text-center text-slate-500 italic">
                                          Aucun élève enregistré sur ce poste.
                                      </td>
                                  </tr>
                              ) : (
                                  classResults.map((s, i) => (
                                      <tr key={i} className={`hover:bg-slate-800/50 transition-colors ${s.name === gameState.studentName ? 'bg-indigo-900/10' : ''}`}>
                                          <td className="p-4 font-medium text-white">
                                              {s.name}
                                              {s.name === gameState.studentName && <span className="ml-2 text-xs text-indigo-400 border border-indigo-500/30 px-1 rounded">Actuel</span>}
                                          </td>
                                          <td className="p-4">
                                              {s.completed ? LEVELS.length : s.progress} / {LEVELS.length}
                                          </td>
                                          <td className="p-4 w-1/3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                                    <div 
                                                        className={`h-2.5 rounded-full ${s.completed ? 'bg-green-500' : 'bg-indigo-500'}`} 
                                                        style={{width: `${s.score}%`}}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-slate-500 w-8">{s.score}%</span>
                                            </div>
                                          </td>
                                          <td className="p-4">
                                              {s.completed ? (
                                                  <span className="inline-flex items-center gap-1 text-green-400 bg-green-900/20 px-2 py-1 rounded text-xs font-bold">
                                                      Terminé
                                                  </span>
                                              ) : (
                                                  <span className="inline-flex items-center gap-1 text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded text-xs font-bold">
                                                      En cours
                                                  </span>
                                              )}
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
                  <p className="mt-4 text-xs text-slate-500 text-center">
                      * Les données sont stockées localement sur cet ordinateur (LocalStorage).
                  </p>
              </div>
          </div>
      );
  }

  // 2. Login Screen
  if (!gameState.isLoggedIn) {
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative">
              <button 
                onClick={() => setShowAdminLogin(true)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                title="Accès Professeur"
              >
                  <Lock size={20} />
              </button>

              {showAdminLogin && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
                      <form onSubmit={handleAdminLogin} className="bg-slate-900 p-8 rounded-xl border border-slate-700 relative shadow-2xl w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-300">
                          <button 
                            type="button" 
                            onClick={() => setShowAdminLogin(false)}
                            className="absolute top-3 right-3 text-slate-500 hover:text-white"
                          >X</button>
                          <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
                              <GraduationCap className="text-indigo-500" /> 
                              Espace Enseignant
                          </h3>
                          <div className="mb-4">
                            <label className="block text-xs text-slate-400 mb-1 ml-1">Mot de passe</label>
                            <input 
                                type="password" 
                                className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="•••••••"
                                value={adminPassword}
                                onChange={e => setAdminPassword(e.target.value)}
                                autoFocus
                            />
                          </div>
                          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-lg transition-colors shadow-lg hover:shadow-indigo-500/25">
                              Connexion
                          </button>
                      </form>
                  </div>
              )}

              <div className="max-w-md w-full bg-slate-900 border border-indigo-500/30 p-8 rounded-2xl shadow-2xl text-center">
                  <div className="w-20 h-20 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-indigo-500/50">
                      <Camera className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">La Chambre Noire</h1>
                  <p className="text-slate-400 mb-8">Escape Game SNT : Photographie Numérique</p>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                          <label className="block text-left text-sm text-slate-400 mb-1 ml-1">Votre Nom & Prénom</label>
                          <input 
                            type="text" 
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                            placeholder="ex: Jean Dupont"
                            value={gameState.studentName}
                            onChange={(e) => setGameState({...gameState, studentName: e.target.value})}
                          />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/25"
                      >
                          Commencer l'aventure
                      </button>
                  </form>
              </div>
          </div>
      );
  }

  // 3. Game Complete View
  if (gameState.isGameComplete) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-slate-900 p-8 rounded-2xl border border-green-500 shadow-2xl text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-2 ring-green-500/50">
            <Camera className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            Félicitations {gameState.studentName} !
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Tu as validé toutes les compétences du module "Photographie Numérique".
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-sm text-slate-400 bg-slate-800 p-6 rounded-lg mb-8 border border-slate-700">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Synthèse Additive RVB</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Définition d'image</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Résolution (DPI/PPP)</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Algorithmes (Seuil/Inversion)</div>
          </div>
          <button 
            onClick={handleResetGame}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold transition-all w-full sm:w-auto flex items-center justify-center gap-2 mx-auto shadow-lg hover:shadow-indigo-500/25"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // 4. Course View (Interstitial)
  if (gameState.showCourse) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
              <div className="max-w-3xl w-full bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <div className="bg-indigo-600 p-8 text-white md:w-1/3 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 opacity-80">
                            <BookOpen size={20} />
                            <span className="font-bold tracking-wider text-sm uppercase">Cours SNT</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 leading-tight">{currentLevel.courseContent.title}</h2>
                        <div className="w-12 h-1 bg-white/30 rounded mb-6"></div>
                      </div>
                      <div className="relative z-10 text-indigo-100 text-sm font-medium bg-indigo-700/50 py-1 px-3 rounded-full self-start">
                          Niveau {currentLevel.id} / {LEVELS.length}
                      </div>
                  </div>
                  <div className="p-8 md:w-2/3 flex flex-col">
                      <div className="flex-1">
                          <p className="text-lg leading-relaxed text-slate-700 mb-8">
                              {currentLevel.courseContent.body}
                          </p>
                          <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                  <GraduationCap size={18} className="text-indigo-600" />
                                  À retenir :
                              </h3>
                              <ul className="space-y-3">
                                  {currentLevel.courseContent.keyPoints.map((pt, i) => (
                                      <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></span>
                                          {pt}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                      <button 
                        onClick={() => setGameState(prev => ({ ...prev, showCourse: false }))}
                        className="mt-8 self-end bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5"
                      >
                          Accéder au Défi <Play size={18} fill="currentColor" />
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // 5. Game Level View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shrink-0 shadow-lg shadow-indigo-500/20">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">Évasion : La Chambre Noire</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Élève : <span className="text-indigo-400 font-medium">{gameState.studentName}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            {LEVELS.map(l => (
              <div 
                key={l.id}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border shrink-0 whitespace-nowrap transition-all ${
                  gameState.currentLevelId === l.id 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                    : gameState.levels[l.id] === LevelStatus.COMPLETED
                    ? 'bg-green-900/30 border-green-800 text-green-400'
                    : 'bg-slate-800 border-slate-700 text-slate-600'
                }`}
              >
                 {gameState.levels[l.id] === LevelStatus.COMPLETED ? <Unlock size={12}/> : <Lock size={12}/>}
                 <span>{l.id}</span>
              </div>
            ))}
            <button 
                onClick={() => setGameState(prev => ({...prev, showCourse: true}))} 
                className="ml-2 p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-900/50 rounded transition-colors"
                title="Revoir le cours"
            >
                <BookOpen size={18}/>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:h-[calc(100vh-80px)] lg:overflow-hidden">
        
        {/* Left Column: Mission & Editor */}
        <div className="flex flex-col gap-4 order-2 lg:order-1 lg:h-full lg:overflow-y-auto pb-8 lg:pb-0">
          {/* Mission Card */}
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm shrink-0">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-indigo-400" />
                    {currentLevel.title}
                </h2>
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded">
                    {currentLevel.concept}
                </span>
            </div>
            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
              {currentLevel.description}
            </p>
            <div className="bg-slate-800/50 p-3 rounded border-l-4 border-yellow-500 text-yellow-100 text-sm shadow-inner">
                <strong>Mission :</strong> {currentLevel.mission}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-400">Terminal Python</label>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setCurrentCode(currentLevel.initialCode)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors bg-slate-800/50 px-2 py-1 rounded hover:bg-slate-800"
                        title="Réinitialiser le code"
                    >
                        <RefreshCw size={14} /> Reset
                    </button>
                </div>
            </div>
            <CodeEditor code={currentCode} onChange={setCurrentCode} />
          </div>

          {/* Action Bar */}
          <div className="flex gap-3 shrink-0">
            <button 
                onClick={handleRunCode}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
            >
                <Play className="w-5 h-5 fill-current" />
                Exécuter le Code
            </button>
            <button 
                onClick={handleGetHint}
                disabled={loadingHint}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg flex items-center justify-center transition-colors"
                title="Demander de l'aide"
            >
                {loadingHint ? <RefreshCw className="animate-spin" /> : <HelpCircle />}
            </button>
          </div>
        </div>

        {/* Right Column: Visualization & Hints */}
        <div className="flex flex-col gap-4 order-1 lg:order-2 lg:h-full lg:overflow-y-auto">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-1 flex flex-col shadow-lg lg:h-full aspect-video lg:aspect-auto">
                <div className="bg-slate-950 rounded-lg flex-1 overflow-hidden relative">
                    <VisualOutput 
                        level={currentLevel} 
                        code={currentCode} 
                        isRunning={isRunning} 
                        onComplete={handleLevelComplete}
                    />
                </div>
            </div>

            {/* Hint Box (Conditional) */}
            {hint && (
                <div className="bg-indigo-950/40 border border-indigo-500/30 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-4 lg:mb-0 shadow-lg shadow-indigo-900/20">
                    <div className="bg-indigo-500/20 p-2 rounded-full shrink-0">
                        <HelpCircle className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-indigo-300 mb-1">Indice</h4>
                        <p className="text-sm text-indigo-100">{hint}</p>
                    </div>
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default App;
