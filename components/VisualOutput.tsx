import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LevelData } from '../types';

interface VisualOutputProps {
  level: LevelData;
  code: string;
  isRunning: boolean;
  onComplete: () => void;
}

export const VisualOutput: React.FC<VisualOutputProps> = ({ level, code, isRunning, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [success, setSuccess] = useState(false);
  
  // State for Level 7 (Taquin 4x4)
  // Grid 4x4 = 16 tiles (0-15). 15 is empty.
  const [tiles, setTiles] = useState<number[]>(Array.from({length: 16}, (_, i) => i));
  const taquinImageRef = useRef<HTMLCanvasElement | null>(null);

  const initTaquin = useCallback(() => {
    const size = 600;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = size;
    offCanvas.height = size;
    const ctx = offCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, size, size);
        
        ctx.font = 'bold 100px "JetBrains Mono", monospace';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SNT2025', size / 2, size / 2);
        
        // Grid lines 4x4
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        const step = size / 4;
        for(let i=1; i<4; i++) {
            ctx.beginPath();
            ctx.moveTo(i * step, 0);
            ctx.lineTo(i * step, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * step);
            ctx.lineTo(size, i * step);
            ctx.stroke();
        }
    }
    taquinImageRef.current = offCanvas;

    // Shuffle 4x4
    let currentTiles = Array.from({length: 16}, (_, i) => i);
    let emptyIdx = 15;
    // Increased shuffle complexity for 4x4
    for (let i = 0; i < 300; i++) {
        const neighbors = [];
        const row = Math.floor(emptyIdx / 4);
        const col = emptyIdx % 4;
        if (row > 0) neighbors.push(emptyIdx - 4);
        if (row < 3) neighbors.push(emptyIdx + 4);
        if (col > 0) neighbors.push(emptyIdx - 1);
        if (col < 3) neighbors.push(emptyIdx + 1);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        [currentTiles[emptyIdx], currentTiles[randomNeighbor]] = [currentTiles[randomNeighbor], currentTiles[emptyIdx]];
        emptyIdx = randomNeighbor;
    }
    setTiles([...currentTiles]);
  }, []);

  const extractValue = (varName: string, text: string): number | null => {
    const regex = new RegExp(`${varName}\\s*=\\s*(\\d+)`);
    const match = text.match(regex);
    return match ? parseInt(match[1]) : null;
  };
  
  const extractString = (varName: string, text: string): string | null => {
    const regex = new RegExp(`${varName}\\s*=\\s*["']([^"']+)["']`);
    const match = text.match(regex);
    return match ? match[1] : null;
  };

  // Init logic based on level
  useEffect(() => {
    setSuccess(false);
    setFeedback("En attente d'exécution...");
    if (level.id === 7) initTaquin(); // ID 7 is now Taquin
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (level.id === 1) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } 
    else if (level.id === 3) {
       // DPI Visualization Preview
       ctx.fillStyle = '#f8fafc'; // Paper white
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       // Draw Ruler
       ctx.fillStyle = '#94a3b8';
       ctx.fillRect(0, 350, 600, 50);
       ctx.fillStyle = '#0f172a';
       ctx.font = "12px monospace";
       for(let i=0; i<10; i++) {
           ctx.fillRect(i * 60, 350, 2, 20);
           ctx.fillText(`${i}"`, i * 60 + 5, 345);
       }
       // Initial Image Placeholder
       const img = new Image();
       img.crossOrigin = "Anonymous";
       img.src = level.imageUrl;
       img.onload = () => {
           // Show default size (assuming 1200px / 300dpi = 4 inches)
           // 4 inches on our canvas ruler (1 inch = 60px) -> 240px wide
           ctx.drawImage(img, 20, 50, 240, 160);
           ctx.fillStyle = "#000";
           ctx.fillText("Aperçu (4 pouces)", 20, 230);
       }
    }
    else if (level.id === 4) {
      // Level 4: Hidden Message Generation
      // Draw noisy background
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const w = canvas.width;
      const h = canvas.height;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      
      // We want to write "BRAVO" hidden in RED channel
      // But we can't easily rasterize text to data array without drawing first.
      
      // 1. Draw text on temp canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
          tCtx.fillStyle = '#000000'; // Bg black
          tCtx.fillRect(0, 0, w, h);
          tCtx.fillStyle = '#FF0000'; // Text Pure Red
          tCtx.font = 'bold 150px sans-serif';
          tCtx.textAlign = 'center';
          tCtx.textBaseline = 'middle';
          tCtx.fillText('PIXEL', w/2, h/2);
          
          const textData = tCtx.getImageData(0, 0, w, h).data;
          
          // 2. Mix with noise on main canvas
          for (let i = 0; i < data.length; i += 4) {
              const isText = textData[i] > 100; // Check Red channel of text
              
              // Red channel: If text, put high red. If not, low red.
              // To make it harder, let's just use the textData directly for Red.
              data[i] = textData[i]; 
              
              // Green & Blue channels: HIGH NOISE to mask the red
              // Random noise between 100 and 255
              data[i+1] = Math.floor(Math.random() * 200) + 55; 
              data[i+2] = Math.floor(Math.random() * 200) + 55;
              
              data[i+3] = 255; // Alpha
          }
          ctx.putImageData(imageData, 0, 0);
      }
    }
    else if (level.id !== 7) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = level.imageUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      };
    }
  }, [level, initTaquin]);

  // Taquin Loop
  useEffect(() => {
      if (level.id !== 7) return;
      const canvas = canvasRef.current;
      const srcCanvas = taquinImageRef.current;
      if (!canvas || !srcCanvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const puzzleSize = 360; 
      const offsetX = (canvas.width - puzzleSize) / 2;
      const offsetY = (canvas.height - puzzleSize) / 2;
      const tileSize = puzzleSize / 4; // 4x4
      const srcTileSize = srcCanvas.width / 4;
      
      tiles.forEach((tileIndex, positionIndex) => {
          if (tileIndex === 15) return; // Empty tile
          const destCol = positionIndex % 4;
          const destRow = Math.floor(positionIndex / 4);
          const srcCol = tileIndex % 4;
          const srcRow = Math.floor(tileIndex / 4);
          
          ctx.drawImage(
              srcCanvas,
              srcCol * srcTileSize, srcRow * srcTileSize, srcTileSize, srcTileSize,
              offsetX + destCol * tileSize, offsetY + destRow * tileSize, tileSize - 2, tileSize - 2
          );
      });
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX - 2, offsetY - 2, puzzleSize + 4, puzzleSize + 4);
      
  }, [level.id, tiles]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (level.id !== 7 || success) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      const puzzleSize = 360; 
      const offsetX = (canvas.width - puzzleSize) / 2;
      const offsetY = (canvas.height - puzzleSize) / 2;
      
      if (x < offsetX || x > offsetX + puzzleSize || y < offsetY || y > offsetY + puzzleSize) return;
      
      const col = Math.floor((x - offsetX) / (puzzleSize / 4));
      const row = Math.floor((y - offsetY) / (puzzleSize / 4));
      const clickedIndex = row * 4 + col;
      
      const emptyIndex = tiles.indexOf(15);
      const emptyRow = Math.floor(emptyIndex / 4);
      const emptyCol = emptyIndex % 4;
      
      const isAdjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;
      
      if (isAdjacent) {
          const newTiles = [...tiles];
          [newTiles[clickedIndex], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[clickedIndex]];
          setTiles(newTiles);
      }
  };

  useEffect(() => {
    if (!isRunning) return;

    const runSimulation = async () => {
      setFeedback("Exécution du code...");
      await new Promise(r => setTimeout(r, 600));

      let isCorrect = true;
      for (const regex of level.validationRegex) {
        if (!regex.test(code)) isCorrect = false;
      }

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (level.id === 1 && ctx) {
        // RVB
        const r = extractValue('rouge', code) || 0;
        const v = extractValue('vert', code) || 0;
        const b = extractValue('bleu', code) || 0;
        ctx.fillStyle = `rgb(${r}, ${v}, ${b})`;
        ctx.fillRect(0, 0, canvas!.width, canvas!.height);
        
        // Target: Violet (R high, B high, G low)
        const isViolet = r > 100 && b > 100 && v < 50;
        if (isCorrect && isViolet) setFeedback("Succès ! La diode émet du violet.");
        else { isCorrect = false; setFeedback(`Échec. Couleur : rgb(${r},${v},${b}). Cible: Violet.`); }
      } 
      else if (level.id === 2) {
        // Definition
        const total = extractValue('total_pixels', code);
        if (isCorrect && total === 480000) setFeedback("Définition correcte : 480,000 pixels.");
        else { isCorrect = false; setFeedback("Calcul incorrect."); }
      }
      else if (level.id === 3 && ctx) {
          // DPI
          const val = extractValue('largeur_pouces', code);
          // 1200 / 300 = 4 inches
          if (isCorrect && val === 4) {
              setFeedback("Correct ! Largeur de 4 pouces.");
              // Draw correct size
              ctx.clearRect(0,0,600,400);
               ctx.fillStyle = '#f8fafc'; // Paper white
               ctx.fillRect(0, 0, canvas!.width, canvas!.height);
               // Draw Ruler
               ctx.fillStyle = '#94a3b8';
               ctx.fillRect(0, 350, 600, 50);
               ctx.fillStyle = '#0f172a';
               ctx.font = "12px monospace";
               for(let i=0; i<10; i++) {
                   ctx.fillRect(i * 60, 350, 2, 20);
                   ctx.fillText(`${i}"`, i * 60 + 5, 345);
               }
               
               const img = new Image();
               img.crossOrigin = "Anonymous";
               img.src = level.imageUrl;
               await new Promise(r => img.onload = r);
               // 4 inches = 4 * 60px = 240px
               ctx.drawImage(img, 20, 50, 240, 160);
               ctx.strokeStyle = "#22c55e"; // Green border
               ctx.lineWidth = 4;
               ctx.strokeRect(20, 50, 240, 160);
          } else {
              isCorrect = false;
              setFeedback("Mauvais calcul de la taille d'impression.");
          }
      }
      else if (level.id === 4 && ctx) {
        // Hidden Message Solver Logic
        if (!isCorrect) {
          setFeedback("Le bruit vert et bleu masque toujours le message.");
        } else {
          // Solve: Remove G and B
          const imageData = ctx.getImageData(0, 0, canvas!.width, canvas!.height);
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 4) {
             // Keep Red
             // Set Green and Blue to 0
             data[i+1] = 0;
             data[i+2] = 0;
          }
          ctx.putImageData(imageData, 0, 0);
          setFeedback("Canaux filtrés ! Le message caché est révélé.");
        }
      }
      else if ((level.id === 5 || level.id === 6) && ctx) {
        // Filters (ID 5: Inversion, ID 6: Threshold)
        if (!isCorrect) {
             setFeedback("Erreur dans la logique du filtre.");
        } else {
             const img = new Image();
             img.crossOrigin = "Anonymous";
             img.src = level.imageUrl;
             await new Promise(r => img.onload = r);
             
             const scale = Math.min(canvas!.width / img.width, canvas!.height / img.height);
             const w = img.width * scale;
             const h = img.height * scale;
             const x = (canvas!.width / 2) - (w / 2);
             const y = (canvas!.height / 2) - (h / 2);
             
             ctx.drawImage(img, x, y, w, h);
             const imageData = ctx.getImageData(x, y, w, h);
             const data = imageData.data;
             
             for (let i = 0; i < data.length; i += 4) {
               if (level.id === 5) {
                 // Invert
                 data[i] = 255 - data[i];
                 data[i + 1] = 255 - data[i + 1];
                 data[i + 2] = 255 - data[i + 2];
               } else if (level.id === 6) {
                 // Threshold
                 const avg = (data[i] + data[i+1] + data[i+2]) / 3;
                 const val = avg < 128 ? 0 : 255;
                 data[i] = val;
                 data[i+1] = val;
                 data[i+2] = val;
               }
             }
             ctx.putImageData(imageData, x, y);
             setFeedback(level.id === 5 ? "Négatif inversé." : "Seuillage appliqué (Binarisation).");
        }
      } 
      else if (level.id === 7) {
          // Final Taquin Check
          const pass = extractString('mot_de_passe', code);
          if (isCorrect && pass && pass.toUpperCase() === 'SNT2025') setFeedback("Mot de passe confirmé.");
          else { isCorrect = false; setFeedback("Mot de passe incorrect."); }
      }
      setSuccess(isCorrect);
      if (isCorrect) setTimeout(onComplete, 2000);
    };
    runSimulation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, code, level]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="relative bg-black rounded-lg border border-gray-700 overflow-hidden flex-1 flex items-center justify-center select-none min-h-[250px] lg:min-h-0">
        <canvas 
            ref={canvasRef} 
            width={600} 
            height={400} 
            onClick={handleCanvasClick}
            className={`max-w-full max-h-full object-contain ${level.id === 7 && !success ? 'cursor-pointer' : ''}`}
        />
        {level.id === 7 && !success && (
            <div className="absolute top-2 right-2 bg-indigo-900/80 px-2 py-1 rounded text-xs text-indigo-200 pointer-events-none">
                Taquin 4x4 : Cliquez pour déplacer
            </div>
        )}
        {success && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none animate-pulse">
                <span className="text-green-400 text-3xl lg:text-4xl font-bold bg-black/80 px-6 py-3 rounded border border-green-500">
                    SUCCÈS
                </span>
            </div>
        )}
      </div>
      <div className={`p-4 rounded border font-mono text-sm h-24 lg:h-32 overflow-y-auto transition-colors shrink-0 ${
        success ? 'bg-green-900/30 border-green-700 text-green-300' : 
        feedback.includes('Échec') || feedback.includes('Erreur') || feedback.includes('incorrect') ? 'bg-red-900/30 border-red-700 text-red-300' : 
        'bg-gray-800 border-gray-700 text-gray-300'
      }`}>
        <span className="font-bold mr-2">&gt;</span>
        {feedback}
      </div>
    </div>
  );
};