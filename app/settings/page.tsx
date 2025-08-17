"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarIcon,
  Upload,
  FileSpreadsheet,
  Settings,
  Trophy,
  Filter,
  ArrowLeft,
  Maximize,
  Minimize,
  Play,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import * as XLSX from "xlsx";
import { request } from "@/lib/request";
import { toast } from "react-toastify";

// Mock data for winners
const mockWinners = [
  {
    id: 1,
    name: "John Doe",
    phone: "+1234567890",
    prize: "Bumper Prize",
    date: "2024-01-15",
    amount: "$10,000",
  },
  {
    id: 2,
    name: "Jane Smith",
    phone: "+1234567891",
    prize: "General Lucky Draw",
    date: "2024-01-14",
    amount: "$500",
  },
  {
    id: 3,
    name: "Mike Johnson",
    phone: "+1234567892",
    prize: "Bumper Prize",
    date: "2024-01-13",
    amount: "$10,000",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    phone: "+1234567893",
    prize: "General Lucky Draw",
    date: "2024-01-12",
    amount: "$250",
  },
  {
    id: 5,
    name: "David Brown",
    phone: "+1234567894",
    prize: "General Lucky Draw",
    date: "2024-01-11",
    amount: "$750",
  },
];

export default function SettingsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [drawType, setDrawType] = useState("general");
  const [drawDate, setDrawDate] = useState<Date>();
  const [filterDate, setFilterDate] = useState<Date>();
  type Winner = {
    id: number;
    region: string;
    serial_number: string;
    draw_date: string;
    winner_type: string;
  };
  const [filteredWinners, setFilteredWinners] = useState<Winner[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [fileName, setFileName] = useState("");

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
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target) return;
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      // take first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      if (file) {
        setFileName(file.name);
      }

      // convert sheet to JSON
      const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setJsonData(data);
    };

    if (file) {
      reader.readAsBinaryString(file);
    }
  };

  const handleUpload = () => {
    if (!Object.keys(jsonData).length) {
      return;
    }
    const config = {
      url: "/v1/luckydraw/draw-data-bulk/",
      method: "POST",
      data: {
        filename: fileName,
        data: jsonData,
      },
    };
    request(config)
      .then((response) => {
        setSelectedFile(null);
        setJsonData([]);
        setFileName("");
        toast.success("File uploaded successfully!");
        // Optionally, you can refresh the winners list or show a success message
      })
      .catch((error) => {
        console.error("Error uploading file:", error.response.data);
        const data = error.response?.data?.data;
        const errorMessage =
          data && data.length > 0
            ? data?.[0].toString()
            : error.response?.data?.detail ||
              "An error occurred while uploading the file.";
        console.error("Upload error:", errorMessage);
        toast.error(errorMessage || "Failed to upload file.");
      });
  };

  const handleFilterByDate = () => {
    if (!filterDate) {
      toast.warning("Please select a date to filter.");
      return;
    }

    const config = {
      url: "/v1/luckydraw/winners/",
      method: "GET",
      params: {
        draw_date: filterDate ? format(filterDate, "yyyy-MM-dd") : undefined,
      },
    };

    request(config)
      .then((response) => {
        const data = response || [];
        setFilteredWinners(data);
        if (data.length === 0) {
          toast.info("No winners found for the selected date.");
        }
      })
      .catch((error) => {
        toast.error("Failed to filter winners.");
      });
  };

  const handleSaveConfiguration = () => {
    const config = {
      url: "/v1/luckydraw/draw-setting/",
      method: "POST",
      data: {
        draw_category: drawType,
        draw_date: drawDate ? format(drawDate, "yyyy-MM-dd") : null,
      },
    };

    request(config)
      .then((response) => {
        console.log("Configuration saved successfully:", response);
        // Optionally, you can show a success message or refresh the page
        toast.success("Configuration saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving configuration:", error);
        // Handle error appropriately, e.g., show a notification
      });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header with navigation and fullscreen */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="space-y-1">
                <h1 className="text-4xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground text-lg">
                  Professional dashboard for managing draws and tracking winners
                </p>
              </div>
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
          <Card className="shadow-lg">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  General Settings
                </TabsTrigger>
                <TabsTrigger
                  value="winners"
                  className="flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Winner List
                </TabsTrigger>
              </TabsList>

              {/* Upload File Tab */}
              <TabsContent value="upload" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-primary" />
                      Upload Excel File
                    </CardTitle>
                    <CardDescription>
                      Upload your participant data in Excel format to start the
                      lucky draw process
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4 hover:border-primary/50 transition-colors">
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <FileSpreadsheet className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Choose Excel file or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supports .xlsx, .xls files up to 10MB
                        </p>
                      </div>
                      <Input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="max-w-xs mx-auto"
                      />
                      {selectedFile && (
                        <p className="text-sm text-primary font-medium">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                    <Button onClick={handleUpload} className="w-full" size="lg">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* General Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      Draw Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure your lucky draw settings and schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Draw Type</Label>
                      <RadioGroup value={drawType} onValueChange={setDrawType}>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value="bumper" id="bumper" />
                          <Label
                            htmlFor="bumper"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">Bumper Prize</div>
                            <div className="text-sm text-muted-foreground">
                              High-value prize draw with special conditions
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value="general" id="general" />
                          <Label
                            htmlFor="general"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">
                              General Lucky Draw
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Standard prize draw for all participants
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium">Draw Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !drawDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {drawDate
                              ? format(drawDate, "PPP")
                              : "Select draw date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={drawDate}
                            onSelect={setDrawDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSaveConfiguration}
                    >
                      Save Configuration
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Winner List Tab */}
              <TabsContent value="winners" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Winner Tracking
                    </CardTitle>
                    <CardDescription>
                      View and filter lucky draw winners by date
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Filter by Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !filterDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {filterDate
                                ? format(filterDate, "PPP")
                                : "Select date to filter"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={filterDate}
                              onSelect={setFilterDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button onClick={handleFilterByDate} variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Apply Filter
                      </Button>
                      <Button
                        onClick={() => {
                          setFilterDate(undefined);
                          setFilteredWinners([]);
                        }}
                        variant="outline"
                      >
                        Clear Filter
                      </Button>
                    </div>

                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Winner Serial Number</TableHead>
                            <TableHead>Region</TableHead>
                            <TableHead>Winner Type</TableHead>
                            <TableHead>Date Won</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredWinners.map((winner) => (
                            <TableRow key={winner.id}>
                              <TableCell className="font-medium">
                                {winner.serial_number}
                              </TableCell>
                              <TableCell>{winner.region}</TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    winner.winner_type === "bumper"
                                      ? "bg-primary/10 text-primary"
                                      : "bg-secondary/10 text-secondary"
                                  )}
                                >
                                  {winner.winner_type.charAt(0).toUpperCase() +
                                    winner.winner_type.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(winner.draw_date),
                                  "MMM dd, yyyy"
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {filteredWinners.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No winners found for the selected date</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
