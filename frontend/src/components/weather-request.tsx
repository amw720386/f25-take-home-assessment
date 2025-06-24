"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function WeatherRequest() {
  const [inputId, setInputId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    data?: any;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch(`http://localhost:8000/weather/${inputId}`);
      if (!res.ok) {
        const errorData = await res.json();
        setResult({ success: false, error: errorData.detail || "Not found" });
      } else {
        const data = await res.json();
        setResult({ success: true, data });
        setShowRaw(false); // reset raw view
      }
    } catch {
      setResult({ success: false, error: "Network error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Lookup Weather Data</CardTitle>
        <CardDescription>
          Enter your request ID to retrieve previously stored weather data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Label htmlFor="id">Weather Request ID</Label>
            <Input
              id="id"
              placeholder="e.g., f4c300d3-8db8-46da-98e8-ea3c0c24141b"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Fetching..." : "Fetch Weather Data"}
          </Button>

          {result && (
            <div
              className={`p-3 rounded-md mt-4 text-sm ${
                result.success
                  ? "bg-green-900/20 text-green-500 border border-green-500"
                  : "bg-red-900/20 text-red-500 border border-red-500"
              }`}
            >
              {result.success ? (
                <div className="space-y-2">
                  <p>
                    <strong>Location:</strong>{" "}
                    {result.data.location?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {result.data.location?.localtime?.slice(0, 10) || "N/A"}
                  </p>
                  <p>
                    <strong>Temperature:</strong>{" "}
                    {result.data.current?.temperature ?? "N/A"}°C
                  </p>
                  <p>
                    <strong>Condition:</strong>{" "}
                    {result.data.current?.weather_descriptions?.[0] || "N/A"}
                  </p>
                  <p className="font-semibold underline underline-offset-2">
                    Notes
                  </p>
                  <p className="break-words whitespace-normal overflow-hidden">
                    {result.data.request.notes || "None"}
                  </p>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowRaw((prev) => !prev)}
                    >
                      {showRaw ? "Hide Raw" : "View Raw"}
                    </Button>
                  </div>

                  {showRaw && (
                    <pre className="mt-2 bg-black/20 p-2 text-xs rounded overflow-x-auto text-green-200">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <p>{result.error}</p>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
