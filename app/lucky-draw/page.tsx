"use client";

import type React from "react";

import { useState, useEffect, useCallback, use } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize, Minimize, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { request } from "@/lib/request";

export default function LuckyDrawPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawDetails, setDrawDetails] = useState({
    drawDate: "",
    drawType: "",
  });
  const [participants, setParticipants] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentName, setCurrentName] = useState("");
  const [winner, setWinner] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
  }, [router]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      // No timeout to clear here
    };
  }, []);

  useEffect(() => {
    getLuckyDrawData();
  }, []);

  const getLuckyDrawData = useCallback(() => {
    const config = {
      url: "/v1/luckydraw/eligible-serials/",
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
    request(config)
      .then((data) => {
        setParticipants(data.serial_numbers); // Use mock data if API fails
        setDrawDetails({
          drawDate: data.draw_date,
          drawType: data.draw_category,
        });
      })
      .catch((error) => {
        console.error("Error fetching lucky draw data:", error);
      });
  }, []);

  const startDraw = () => {
    if (participants.length === 0) return;

    setIsDrawing(true);
    setWinner("");
    setShowConfetti(false);

    let animationCount = 0;
    const maxAnimations = 30 + Math.floor(Math.random() * 20); // 30-50 animations

    const animationInterval = setInterval(
      () => {
        const randomParticipant =
          participants[Math.floor(Math.random() * participants.length)];
        setCurrentName(randomParticipant);
        animationCount++;

        if (animationCount >= maxAnimations) {
          clearInterval(animationInterval);

          // Final winner selection
          setTimeout(() => {
            const finalWinner =
              participants[Math.floor(Math.random() * participants.length)];
            setWinner(finalWinner);
            setCurrentName(finalWinner);
            setIsDrawing(false);
            setShowConfetti(true);

            // Remove winner from participants for next draw
            setParticipants((prev) => prev.filter((p) => p !== finalWinner));

            // Hide confetti after 5 seconds
            setTimeout(() => setShowConfetti(false), 5000);
          }, 500);
        }
      },
      animationCount < 20 ? 100 : animationCount < 35 ? 150 : 200
    );
  };

  const postWinner = useCallback(() => {
    if (!winner) return;

    const config = {
      url: "/v1/luckydraw/winners/",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: { serial_number: winner },
    };
    request(config)
      .then((data) => {
        getLuckyDrawData();
        setWinner("");
      })
      .catch((error) => {
        console.error("Error posting winner:", error);
      });
  }, [winner]);

  useEffect(() => {
    postWinner();
  }, [winner]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6 h-dvh">
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header with navigation and fullscreen */}
          <div className="flex items-center justify-between">
            <div>
              {!isFullscreen ? (
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              ) : null}
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-foreground">
                {drawDetails.drawType == "general" ? "General" : "Bumper"} Lucky
                Draw
              </h1>
              <p className="text-muted-foreground text-lg">
                {drawDetails.drawDate
                  ? `Draw For Date: ${new Date(
                      drawDetails.drawDate
                    ).toLocaleDateString()}`
                  : "No draw date set"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={toggleFullscreen}
              className="flex items-center gap-2 bg-transparent"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
          </div>

          {/* Main Dashboard */}

          <div className="flex items-center justify-center w-full h-full">
            {/* Draw Interface */}
            <div className="w-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Lucky Draw
                  </CardTitle>
                  <CardDescription>
                    {participants.length} participants ready for draw
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Draw Display */}
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-8 text-center space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-muted-foreground">
                        {winner
                          ? "🎉 Winner!"
                          : isDrawing
                          ? "Drawing..."
                          : "Ready to Draw!"}
                      </h2>
                      <div className="bg-background rounded-lg p-6 min-h-[120px] flex items-center justify-center">
                        <div
                          className={cn(
                            "text-4xl font-bold transition-all duration-300",
                            isDrawing && "animate-pulse scale-110",
                            winner && "text-primary animate-bounce"
                          )}
                        >
                          {currentName || "Click Draw to Start"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Draw Controls */}
                  <div className="flex gap-4">
                    <Button
                      onClick={startDraw}
                      disabled={isDrawing || participants.length === 0}
                      className="flex-1"
                      size="lg"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isDrawing ? "Drawing..." : "Start Draw"}
                    </Button>
                    {/* <Button
                      onClick={resetDraw}
                      variant="outline"
                      disabled={isDrawing}
                      size="lg"
                    >
                      Reset
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
